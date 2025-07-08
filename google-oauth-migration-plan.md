
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

### 2.5 Banco de Dados (`src/infrastructure/persistence/db.ts`)

*   **Coleção `users`:** É fundamental garantir que o campo `email` na coleção `users` tenha um índice único para otimizar as buscas e garantir a integridade dos dados.
    *   **Ação:** Adicionar um índice único para `email` na coleção `users` se ainda não existir.

## 3. Plano de Implementação Detalhado

### Fase 1: Configuração do NextAuth.js e Provedor Google

1.  **Instalar NextAuth.js:**
    ```bash
    yarn add next-auth
    ```
2.  **Configurar Variáveis de Ambiente:**
    *   Obtenha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` do Google Cloud Console.
    *   Defina `NEXTAUTH_SECRET` (uma string aleatória longa) e `NEXTAUTH_URL` (URL base da sua aplicação) no seu `.env.local`.
3.  **Criar `src/app/api/auth/[...nextauth]/route.ts`:**
    ```typescript
    // src/app/api/auth/[...nextauth]/route.ts
    import NextAuth from "next-auth";
    import GoogleProvider from "next-auth/providers/google";
    import { getUsersCollection } from "@/infrastructure/persistence/db";
    import { IUser } from "@/domain/models/User";
    import { IUserPayload } from "@/shared/types/types/auth"; // Certifique-se de que IUserPayload está atualizado

    export const authOptions = {
      providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
      ],
      callbacks: {
        async signIn({ account, profile }) {
          if (account?.provider === "google") {
            const usersCollection = await getUsersCollection();
            const user = await usersCollection.findOne({ email: profile?.email }) as IUser;

            if (user) {
              // Usuário pré-aprovado encontrado no banco de dados
              return true;
            } else {
              // Usuário não encontrado, negar login
              console.warn(`Tentativa de login com e-mail não autorizado: ${profile?.email}`);
              return false; // Nega o login
            }
          }
          return false; // Nega login para outros provedores ou casos não tratados
        },
        async jwt({ token, user }) {
          // 'user' aqui é o objeto retornado pelo 'signIn' (se for true)
          // ou o objeto do provedor (se não houver 'signIn' customizado)
          if (user) {
            const usersCollection = await getUsersCollection();
            const dbUser = await usersCollection.findOne({ email: user.email }) as IUser;

            if (dbUser) {
              // Popula o token com os dados completos do nosso usuário
              const userPayload: IUserPayload = {
                userId: dbUser._id.toHexString(),
                cpf: dbUser.cpf,
                email: dbUser.email,
                name: dbUser.name,
                roles: dbUser.roles,
                permissions: dbUser.permissions,
                isAdmin: dbUser.isAdmin,
                tenantId: dbUser.tenantId,
                tenantName: dbUser.tenantName,
                slug: dbUser.slug, // Adicionar slug aqui
              };
              token.user = userPayload;
            }
          }
          return token;
        },
        async session({ session, token }) {
          // Expõe os dados do usuário para o cliente
          session.user = token.user as IUserPayload;
          return session;
        },
      },
      pages: {
        signIn: "/login", // Redireciona para sua página de login customizada
        error: "/login", // Redireciona para a página de login em caso de erro
      },
      secret: process.env.NEXTAUTH_SECRET,
      session: {
        strategy: "jwt",
      },
    };

    const handler = NextAuth(authOptions);
    export { handler as GET, handler as POST };
    ```

### Fase 2: Adaptação do Modelo de Usuário

1.  **Atualizar `src/domain/models/User.ts`:**
    ```typescript
    // Adicionar 'slug' e 'tenantName' se ainda não estiverem em IUserPayload
    export interface IUserPayload {
      userId: string;
      cpf: string;
      email: string;
      name: string;
      roles: string[];
      permissions: string[];
      isAdmin: boolean;
      tenantId: string;
      slug: string; // Adicionar esta linha
      tenantName?: string; // Adicionar esta linha se for opcional
    }

    // Opcional: Adicionar googleId a IUser
    export interface IUser extends IBaseEntity {
      // ... outras propriedades
      email: string;
      googleId?: string; // Novo campo
      // ...
    }
    ```
2.  **Atualizar `src/shared/types/types/component-props.ts`:**
    *   Garantir que `INavbarProps.user` seja `IUserPayload | null`.

### Fase 3: Refatoração da Página de Login (`src/app/login/page.tsx`)

1.  **Remover Formulário de CPF:** Substitua o formulário de CPF por um botão de login do Google.
2.  **Usar `signIn` do NextAuth.js:**
    ```typescript
    // src/app/login/page.tsx
    "use client";
    import { signIn } from "next-auth/react";
    import { Button } from "@/shared/components/ui/button";
    import { useRouter, useSearchParams } from "next/navigation";
    import { useEffect } from "react";
    import { toast } from "@/shared/hooks/use-toast";

    export default function LoginPage() {
      const router = useRouter();
      const searchParams = useSearchParams();
      const error = searchParams.get("error");

      useEffect(() => {
        if (error) {
          let errorMessage = "Ocorreu um erro ao fazer login.";
          if (error === "AccessDenied") {
            errorMessage = "Seu e-mail não está autorizado. Por favor, entre em contato com o administrador.";
          } else if (error === "OAuthAccountNotLinked") {
            errorMessage = "Este e-mail já está registrado com outro método de login. Por favor, use o método original.";
          }
          toast({
            title: "Erro de Login",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }, [error]);

      const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" }); // Redireciona para o dashboard após login
      };

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Entrar no Smarted
            </h2>
            <div className="mt-8 space-y-6">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2"
              >
                <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
                Entrar com Google
              </Button>
              {/* Remover o formulário de CPF aqui */}
            </div>
          </div>
        </div>
      );
    }
    ```
    *   **Nota:** Você precisará de um ícone do Google (`google-icon.svg`) na pasta `public`.

### Fase 4: Testes

1.  **Testes Unitários:**
    *   Testar os callbacks `signIn`, `jwt` e `session` do NextAuth.js isoladamente para garantir que a lógica de verificação de e-mail e população do token/sessão funcione como esperado.
2.  **Testes de Integração:**
    *   Simular um fluxo de login completo:
        *   Login com e-mail autorizado (deve ter sucesso).
        *   Login com e-mail não autorizado (deve ser negado).
        *   Login com e-mail já existente, mas via outro provedor (se `OAuthAccountNotLinked` for relevante).
3.  **Testes de Segurança:**
    *   Tentar manipular o token JWT no cliente para ver se as permissões são respeitadas.
    *   Verificar se as variáveis de ambiente estão seguras.

## 4. Considerações de Segurança

*   **Variáveis de Ambiente:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `NEXTAUTH_SECRET` devem ser mantidas em segurança (e.g., `.env.local` e não versionadas).
*   **`NEXTAUTH_SECRET`:** Deve ser uma string longa e aleatória para proteger os tokens JWT.
*   **CSRF:** O NextAuth.js já inclui proteção CSRF por padrão.
*   **Validação de Tokens:** A validação de tokens JWT é feita pelo NextAuth.js, mas a lógica de autorização (baseada em `roles` e `permissions` do `IUserPayload`) ainda é responsabilidade da aplicação.
*   **HTTPS:** Em produção, a aplicação deve sempre rodar sob HTTPS.

## 5. Próximos Passos

1.  **Confirmação:** Revise este plano e confirme se ele atende a todos os seus requisitos e expectativas.
2.  **Execução Fase a Fase:** Prossiga com a implementação seguindo as fases propostas.
3.  **Monitoramento:** Monitore os logs durante e após a implementação para identificar quaisquer problemas inesperados.
