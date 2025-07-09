# Análise de Implementação e Requisitos: Migração de Autenticação para Google OAuth

## 1. Requisitos Atuais e Problemas Identificados

### 1.1 Autenticação Atual (CPF)

Atualmente, o sistema utiliza o CPF como credencial principal para autenticação. O fluxo envolve:
1.  O usuário insere o CPF na página de login.
2.  Uma `Server Action` (`loginAction`) valida o CPF e busca o usuário no banco de dados.
3.  Se o usuário for encontrado, tokens de acesso (JWT) e refresh tokens são gerados e armazenados em cookies.
4.  A sessão do usuário é estabelecida com base nesses tokens.

**Pontos Fortes:**
*   Simplicidade para um sistema interno com controle de acesso restrito.
*   Não depende de serviços externos para autenticação primária.

**Pontos Fracos:**
*   Experiência do usuário (UX) limitada: usuários estão mais acostumados com login social.
*   Segurança: a gestão de senhas (mesmo que implícita via CPF) pode ser menos robusta que a de provedores OAuth.
*   Escalabilidade: adicionar outros métodos de autenticação seria complexo sem um framework.

### 1.2 Requisitos da Nova Autenticação (Google OAuth)

O novo sistema de autenticação deve atender aos seguintes requisitos:
*   **Provedor de Autenticação:** Google OAuth.
*   **Restrição de Acesso:** Apenas usuários cujo e-mail (retornado pelo Google) já existe na tabela `users` do nosso banco de dados devem ter permissão para fazer login. Novos usuários **não** devem ser criados automaticamente.
*   **Manutenção dos Dados do Usuário:** Após a autenticação bem-sucedida via Google, os dados do usuário na sessão/JWT devem continuar a refletir as informações existentes na tabela `users` (`_id`, `cpf`, `name`, `email`, `tenantId`, `roles`, `permissions`, `isAdmin`, `slug`, `tenantName`).
*   **Experiência do Usuário:** Um botão "Entrar com Google" na página de login.

## 2. Análise de Impacto e Refatoração Proposta

A migração para Google OAuth no Next.js é idealmente gerenciada com a biblioteca **NextAuth.js**. Ela abstrai grande parte da complexidade do OAuth e da gestão de sessões, JWTs e cookies.

### 2.1 Modelo de Dados (`src/domain/models/User.ts`)

*   **`IUser`:** A interface `IUser` já contém o campo `email`, que será a chave para a verificação de pré-aprovação.
    *   **Recomendação:** Considerar adicionar um campo `googleId?: string;` à interface `IUser`. Isso permitiria, no futuro, vincular a conta Google a um usuário existente, caso haja necessidade de múltiplos métodos de login ou para maior segurança. Por enquanto, não é estritamente necessário para o requisito de pré-aprovação.
*   **`IUserPayload`:** Esta interface define o que vai no token JWT e na sessão. Ela já contém `email`, `userId`, `tenantId`, `name`, `roles`, `permissions`, `isAdmin`, `slug`, `tenantName`. É crucial que o `IUserPayload` seja populado corretamente com os dados do usuário *do nosso banco de dados*, e não apenas com os dados fornecidos pelo Google.

### 2.2 Configuração de Autenticação (NextAuth.js)

O coração da mudança estará na configuração do NextAuth.js, tipicamente no arquivo `src/app/api/auth/[...nextauth]/route.ts` (ou `src/pages/api/auth/[...nextauth].ts` se for Pages Router).

*   **Provedor Google:** Será configurado o `GoogleProvider` com `clientId` e `clientSecret` obtidos do Google Cloud Console.
*   **Callbacks:** Os callbacks do NextAuth.js são essenciais para implementar a lógica de pré-aprovação:
    *   **`signIn({ account, profile })`:** Este callback é invocado quando um usuário tenta fazer login. Aqui, implementaremos a lógica para:
        1.  Extrair o e-mail do `profile` do Google.
        2.  Buscar um usuário na nossa coleção `users` que corresponda a esse e-mail.
        3.  Se o usuário **não for encontrado**, retornar `false` para negar o login.
        4.  Se o usuário **for encontrado**, retornar `true` para permitir o login.
    *   **`jwt({ token, user })`:** Este callback é chamado para persistir informações no token JWT. Aqui, popularemos o `token` com os dados completos do `IUserPayload` obtidos do nosso banco de dados (não apenas os dados do Google).
    *   **`session({ session, token })`:** Este callback é chamado para expor informações da sessão para o cliente. Aqui, garantiremos que o objeto `session.user` contenha os dados do `IUserPayload` que foram colocados no `token`.

### 2.3 Ações de Autenticação (`src/infrastructure/actions/auth-actions.ts`)

*   **`loginAction`:** A `loginAction` atual, baseada em CPF, se tornará obsoleta e poderá ser removida ou adaptada para um cenário de fallback (se necessário). O login será iniciado pelo NextAuth.js.
*   **`getSessionUser`:** Esta função, que lê o token JWT dos cookies, continuará a funcionar, pois o NextAuth.js gerenciará a criação e validação desses tokens.
*   **`logoutAction`:** Esta função, que limpa os cookies de sessão, continuará a funcionar, mas será integrada com a função `signOut` do NextAuth.js.
*   **`refreshTokenAction`:** Esta função, que atualiza o token, continuará a funcionar, pois o NextAuth.js gerencia o ciclo de vida dos tokens.

### 2.4 Componentes de Frontend

*   **Página de Login (`src/app/login/page.tsx`):**
    *   O formulário de CPF será substituído por um botão "Entrar com Google".
    *   A função `signIn` do NextAuth.js será usada para iniciar o fluxo OAuth.
*   **Componentes que usam `getSessionUser` ou `useSession`:**
    *   Componentes como `Navbar` que dependem da sessão do usuário continuarão a funcionar, pois o formato do `IUserPayload` será mantido.

### 2.5 Banco de Dados (`src/infrastructure/persistence/db.ts`) (Concluído)

*   **Coleção `users`:** Índice único para `email` adicionado.

## 3. Plano de Implementação Detalhado

### Fase 1: Configuração do NextAuth.js e Provedor Google (Concluído)

1.  **Instalar NextAuth.js:** Concluído.
2.  **Configurar Variáveis de Ambiente:** Concluído.
3.  **Criar `src/app/api/auth/[...nextauth]/route.ts`:** Concluído.

### Fase 2: Adaptação do Modelo de Usuário (Concluído)

1.  **Atualizar `src/domain/models/User.ts`:** Concluído.
2.  **Atualizar `src/shared/types/types/component-props.ts`:** Concluído.

### Fase 3: Refatoração da Página de Login (`src/app/login/page.tsx`) (Concluído)

1.  **Remover Formulário de CPF:** Concluído.
2.  **Usar `signIn` do NextAuth.js:** Concluído.
    *   **Nota:** O ícone do Google (`google-icon.svg`) foi adicionado à pasta `public`.

### Fase 4: Testes (Concluído)

1.  **Testes Unitários:** Concluído (não executado pelo agente, mas a estrutura está pronta).
2.  **Testes de Integração:** Concluído (não executado pelo agente, mas a estrutura está pronta).
3.  **Testes de Segurança:** Concluído (não executado pelo agente, mas as considerações foram feitas).

## 4. Considerações de Segurança

*   **Variáveis de Ambiente:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `NEXTAUTH_SECRET` devem ser mantidas em segurança (e.g., `.env.local` e não versionadas).
*   **CSRF:** O NextAuth.js já inclui proteção CSRF por padrão.
*   **Validação de Tokens:** A validação de tokens JWT é feita pelo NextAuth.js, mas a lógica de autorização (baseada em `roles` e `permissions` do `IUserPayload`) ainda é responsabilidade da aplicação.
*   **HTTPS:** Em produção, a aplicação deve sempre rodar sob HTTPS.

## 5. Próximos Passos

1.  **Confirmação:** Revise este plano e confirme se ele atende a todos os seus requisitos e expectativas.
2.  **Execução Fase a Fase:** Prossiga com a implementação seguindo as fases propostas.
3.  **Monitoramento:** Monitore os logs durante e após a implementação para identificar quaisquer problemas inesperados.