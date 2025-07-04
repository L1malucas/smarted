# auth-next: Template de Autenticação Next.js para LLMs

Este projeto serve como um template robusto e didático para a implementação de um sistema de autenticação completo utilizando Next.js. Ele foi projetado para ser facilmente compreendido e replicado por outras LLMs, detalhando cada componente e seu papel no fluxo de autenticação.

## 1. Visão Geral da Arquitetura

A aplicação `auth-next` é construída sobre o framework Next.js, aproveitando suas capacidades de renderização no lado do servidor (SSR), componentes de cliente (`'use client'`), Server Actions, rotas de API e middleware.

*   **Server Components**: Utilizados para buscar dados e renderizar UI no servidor, como em `app/home/page.tsx`, que busca dados do usuário antes de renderizar o componente cliente.
*   **Client Components**: Para interatividade no navegador, como `app/home/home-client.tsx` e `app/login/page.tsx`, que gerenciam estados e interações do usuário.
*   **Server Actions**: Funções assíncronas que rodam no servidor, invocadas diretamente de componentes de cliente. Exemplos incluem `loginAction` e `logoutAction` em `src/actions/auth-actions.ts`, que lidam com a lógica de autenticação e manipulação de cookies de forma segura.
*   **API Routes**: Para endpoints de API tradicionais, como `app/api/auth/refresh/route.ts`, que lida com a atualização de tokens.
*   **Middleware (`middleware.ts`)**: Intercepta requisições antes que elas cheguem às rotas, permitindo a implementação de lógica de proteção de rotas e verificação de autenticação em nível global.

## 2. Tecnologias Chave e Suas Funções

Este projeto utiliza as seguintes bibliotecas e tecnologias, cada uma com um papel específico no sistema de autenticação:

*   **Next.js**: Framework principal para construção da aplicação web.
*   **React**: Biblioteca para construção da interface do usuário.
*   **`bcryptjs`**: Utilizado para o hash seguro de senhas, garantindo que as credenciais dos usuários não sejam armazenadas em texto claro no banco de dados. (Ver `src/lib/auth.ts`)
*   **`jose` (JSON Object Signing and Encryption)**: Biblioteca para operações criptográficas com JWTs, como `jwtVerify` para a verificação segura de tokens. (Ver `src/lib/auth.ts`)
*   **`jsonwebtoken`**: Utilizado para a geração de JWTs (`jwt.sign`). (Ver `src/lib/auth.ts`)
*   **`mongodb`**: Driver oficial para interação com o banco de dados MongoDB, onde os dados dos usuários são armazenados. (Ver `src/lib/db.ts`)
*   **`nookies`**: Facilita a manipulação de cookies no Next.js, essencial para o armazenamento de tokens de sessão.
*   **`zod`**: Biblioteca de validação de esquemas TypeScript-first, utilizada para validar o formato do CPF. (Ver `src/lib/validations.ts`)
*   **TypeScript**: Linguagem de programação que adiciona tipagem estática, melhorando a robustez e manutenibilidade do código.
*   **Tailwind CSS**: Framework CSS utilitário para estilização rápida e responsiva da interface.

## 3. Fluxo de Autenticação Detalhado

### 3.1. Login (`app/login/page.tsx` & `src/actions/auth-actions.ts`)

1.  **Interface de Login**: `app/login/page.tsx` é um componente de cliente que renderiza o formulário de login. Ele utiliza `useFormState` e `useFormStatus` do React para gerenciar o estado do formulário e o status de submissão.
2.  **Validação e Sanitização**: O CPF inserido pelo usuário é formatado (`formatCPF` em `src/lib/validations.ts`) e, ao ser submetido, é sanitizado (`sanitizeInput`) e validado (`validateCPF`) no `loginAction` (Server Action).
3.  **Busca no Banco de Dados**: `loginAction` interage com o MongoDB (`getUsersCollection` em `src/lib/db.ts`) para buscar o usuário pelo CPF.
4.  **Geração de Tokens**: Se o usuário for encontrado (e, em uma aplicação real, a senha seria verificada aqui), dois tipos de tokens JWT são gerados (`generateToken` e `generateRefreshToken` em `src/lib/auth.ts`):
    *   **`accessToken`**: Curta duração (15 minutos), usado para proteger rotas e recursos.
    *   **`refreshToken`**: Longa duração (7 dias), usado para obter novos `accessTokens` sem exigir que o usuário faça login novamente.
5.  **Salvamento de Cookies**: Ambos os tokens são salvos como cookies HTTP-only (`cookies().set`) no navegador do cliente. As opções de cookie (`COOKIE_OPTIONS`) garantem segurança:
    *   `httpOnly: true`: Impede o acesso ao cookie via JavaScript do lado do cliente, mitigando ataques XSS.
    *   `secure: process.env.NODE_ENV === 'production'`: Garante que o cookie seja enviado apenas em conexões HTTPS em produção.
    *   `sameSite: 'strict'`: Protege contra ataques CSRF (Cross-Site Request Forgery).
6.  **Redirecionamento**: Após o login bem-sucedido, o usuário é redirecionado para a página `/home`.

### 3.2. Proteção de Rotas (`middleware.ts`)

1.  **Interceptação de Requisições**: O `middleware.ts` é executado para cada requisição que corresponde ao seu `matcher` (neste caso, `/home/:path*` e `/login`).
2.  **Verificação de `accessToken`**: Ele tenta obter o `accessToken` dos cookies da requisição.
3.  **Validação do Token**: Se a rota for protegida (`isProtectedRoute`) e não houver `accessToken`, ou se o `accessToken` for inválido (`verifyToken` em `src/lib/auth.ts`), o usuário é redirecionado para a página de login (`/login`).
4.  **Fluxo de Refresh (Implícito)**: Embora o middleware não execute o refresh diretamente, ele detecta a ausência de um `accessToken` válido e, se um `refreshToken` existir, a lógica de refresh é esperada para ser tratada em outro lugar (como na página `home-client.tsx` ou via API).

### 3.3. Página Home (`app/home/page.tsx` & `app/home/home-client.tsx`)

1.  **Componente de Servidor (`app/home/page.tsx`)**:
    *   Atua como um "gatekeeper" para a área protegida.
    *   Lê o `accessToken` dos cookies do servidor.
    *   Decodifica e verifica o `accessToken` usando `verifyToken`.
    *   Extrai os dados do usuário (`userData`) e o tempo de expiração do token (`tokenExpiresIn`) usando `getTokenExpiration` (`src/lib/client-auth-utils.ts`).
    *   Redireciona para `/login` se o token for inválido ou ausente.
    *   Passa `userData` e `tokenExpiresIn` como `props` para o `HomeClient`.
2.  **Componente de Cliente (`app/home/home-client.tsx`)**:
    *   Recebe os dados do usuário e a expiração do token como `props`.
    *   Exibe as informações do usuário.
    *   **Refresh de Token no Cliente**: Um `useEffect` monitora o tempo restante do `accessToken`. Se o token estiver prestes a expirar (menos de 1 minuto), ele invoca `refreshTokenAction` (Server Action) para obter um novo `accessToken`.
    *   **Logout**: O botão de logout invoca `logoutAction` (Server Action) para limpar os cookies e redirecionar o usuário.

### 3.4. Refresh de Token (`app/api/auth/refresh/route.ts` & `src/actions/auth-actions.ts`)

O refresh de token pode ser acionado de duas formas:

*   **Via API Route (`app/api/auth/refresh/route.ts`)**:
    *   Recebe uma requisição POST.
    *   Obtém o `refreshToken` dos cookies.
    *   Verifica a validade do `refreshToken` (`verifyRefreshToken` em `src/lib/auth.ts`).
    *   Se válido, gera um novo `accessToken` e um novo `refreshToken`.
    *   Atualiza os cookies com os novos tokens.
    *   Retorna o novo `accessToken` para o cliente.
*   **Via Server Action (`refreshTokenAction` em `src/actions/auth-actions.ts`)**:
    *   Pode ser chamado diretamente de componentes de cliente (como em `home-client.tsx`).
    *   Executa a mesma lógica de verificação e geração de tokens que a API Route, mas no contexto de uma Server Action.
    *   Atualiza os cookies diretamente no servidor.

### 3.5. Logout (`src/actions/auth-actions.ts`)

1.  **`logoutAction`**: Esta Server Action é responsável por:
    *   Remover os cookies `accessToken` e `refreshToken` do navegador do usuário.
    *   Redirecionar o usuário para a página de login (`/login`), encerrando a sessão.

## 4. Estrutura de Arquivos e Responsabilidades

```
.
├── app/                      # Rotas e componentes de página do Next.js
│   ├── api/                  # Rotas de API (ex: autenticação, refresh de token)
│   │   └── auth/
│   │       └── refresh/
│   │           └── route.ts  # Endpoint para atualização de tokens.
│   ├── home/                 # Página inicial (dashboard após login)
│   │   ├── home-client.tsx   # Componente cliente para exibir dados do usuário e gerenciar refresh de token.
│   │   └── page.tsx          # Componente servidor que busca dados do usuário e passa para home-client.
│   ├── login/                # Página de login
│   │   └── page.tsx          # Componente cliente com formulário de login.
│   ├── favicon.ico           # Ícone do site.
│   ├── globals.css           # Estilos CSS globais.
│   ├── layout.tsx            # Layout raiz da aplicação, define estrutura HTML e fontes.
│   └── page.tsx              # Página raiz, redireciona para /login.
├── public/                   # Arquivos estáticos (imagens, etc.).
├── src/                      # Código fonte principal
│   ├── actions/              # Ações do servidor (Server Actions)
│   │   └── auth-actions.ts   # Funções de login, logout e refresh de token (Server Actions).
│   └── lib/                  # Bibliotecas e utilitários
│       ├── auth.ts           # Funções para geração, verificação e hash de tokens/senhas.
│       ├── client-auth-utils.ts # Utilitários de autenticação para o lado do cliente (ex: extrair expiração do token).
│       ├── db.ts             # Configuração e conexão com o banco de dados MongoDB.
│       └── validations.ts    # Funções de validação (CPF) e sanitização de entrada.
├── .gitignore                # Arquivos e diretórios a serem ignorados pelo Git.
├── middleware.ts             # Middleware do Next.js para lógica de proteção de rotas.
├── next.config.ts            # Configurações do Next.js.
├── package.json              # Metadados do projeto e dependências.
├── postcss.config.mjs        # Configurações do PostCSS.
├── README.md                 # Este arquivo de documentação.
├── tsconfig.json             # Configurações do TypeScript.
└── yarn.lock                 # Bloqueio de dependências do Yarn.
```

## 5. Configuração de Ambiente

Para replicar este projeto, as seguintes variáveis de ambiente devem ser definidas em um arquivo `.env.local` na raiz do projeto:

*   **`MONGODB_URI`**: URI de conexão com o seu banco de dados MongoDB. Ex: `mongodb://localhost:27017/authdb`
*   **`JWT_SECRET`**: Uma string secreta forte e aleatória para assinar os `accessTokens`.
*   **`JWT_REFRESH_SECRET`**: Uma string secreta forte e aleatória para assinar os `refreshTokens`.
*   **`JWT_EXPIRES_IN` (Opcional)**: Tempo de expiração para `accessTokens` (padrão: `15m`).
*   **`JWT_REFRESH_EXPIRES_IN` (Opcional)**: Tempo de expiração para `refreshTokens` (padrão: `7d`).

Exemplo de `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/authdb
JWT_SECRET=sua_chave_secreta_jwt_aqui_muito_segura
JWT_REFRESH_SECRET=sua_chave_secreta_refresh_aqui_muito_segura
```

## 6. Considerações de Segurança

*   **Hash de Senhas**: As senhas dos usuários **NÃO** são armazenadas em texto claro. `bcryptjs` é usado para criar um hash irreversível.
*   **Tokens JWT**:
    *   **Assinatura**: Tokens são assinados com chaves secretas (`JWT_SECRET`, `JWT_REFRESH_SECRET`) para garantir sua integridade e autenticidade.
    *   **Expiração**: Tokens de acesso têm curta duração para limitar o impacto de um token comprometido. Refresh tokens têm duração maior, mas são usados apenas para obter novos access tokens.
*   **Cookies HTTP-only**: Os tokens são armazenados em cookies `httpOnly`, o que impede que scripts do lado do cliente acessem esses cookies, reduzindo o risco de ataques XSS.
*   **SameSite Cookies**: A configuração `sameSite: 'strict'` ajuda a proteger contra ataques CSRF, garantindo que os cookies só sejam enviados em requisições originadas do mesmo site.
*   **Sanitização de Entrada**: A função `sanitizeInput` em `src/lib/validations.ts` remove tags HTML de entradas do usuário, prevenindo ataques de injeção de código (XSS).

## 7. Como Rodar

Para iniciar a aplicação em modo de desenvolvimento:

```bash
yarn dev
```

A aplicação estará disponível em `http://localhost:3000`.

Para construir a aplicação para produção:

```bash
yarn build
```

Para iniciar a aplicação em modo de produção:

```bash
yarn start
```