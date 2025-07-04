# Resumo da Refatoração do Projeto SMARTED

Este documento detalha as modificações realizadas na estrutura do projeto e as próximas etapas para alinhá-lo com os princípios de Clean Architecture/DDD, mantendo a compatibilidade com o Next.js App Router.

## 1. Estrutura de Pastas: De `Next.js Padrão` para `Clean Architecture/DDD`

**Estrutura Original (Simplificada):**

```
.
├── app/
├── actions/
├── components/
├── contexts/
├── hooks/
├── lib/
├── models/
├── public/
├── services/
├── styles/
├── types/
├── utils/
└── ...
```

**Nova Estrutura Proposta e Implementada (Simplificada):**

```
.
├── src/                     # Raiz do código-fonte da aplicação
│   ├── app/                 # Camada de Apresentação (Next.js Routing)
│   │   ├── [slug]/
│   │   ├── api/
│   │   ├── login/
│   │   ├── public/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── domain/              # Camada de Domínio (Core da Lógica de Negócio)
│   │   ├── models/          # Entidades de domínio (interfaces/tipos puros)
│   │   ├── repositories/    # Interfaces dos repositórios (contratos para acesso a dados)
│   │   └── services/        # Serviços de domínio (lógica de negócio pura)
│   │
│   ├── application/         # Camada de Aplicação (Casos de Uso)
│   │   ├── services/        # Serviços de aplicação (orquestram o domínio, chamam infraestrutura)
│   │   ├── schemas/         # Schemas de validação (Zod)
│   │   └── dtos/            # Data Transfer Objects
│   │
│   ├── infrastructure/      # Camada de Infraestrutura (Implementações Concretas)
│   │   ├── actions/         # Next.js Server Actions (ponte entre Apresentação e Aplicação)
│   │   ├── auth/            # Implementação de autenticação
│   │   ├── logging/         # Implementação de logging/auditoria
│   │   ├── persistence/     # Implementações de repositórios e conexão com DB
│   │   └── utils/           # Utilitários com dependências de infraestrutura
│   │
│   ├── shared/              # Utilitários, helpers e tipos comuns
│   │   ├── components/      # Componentes de UI reutilizáveis
│   │   ├── hooks/           # Hooks React reutilizáveis
│   │   ├── lib/             # Bibliotecas de propósito geral (ex: withActionLogging)
│   │   ├── types/           # Tipos gerais
│   │   └── assets/          # Arquivos estáticos (ex: templates PDF)
│   │
│   └── ... (outros arquivos de configuração de nível superior)
```

### 1.1. Passos de Reorganização Concluídos:

1.  **Criação do diretório `src/`:** Todos os diretórios de código-fonte foram movidos para dentro de `src/`.
2.  **Criação das camadas:** Os diretórios `domain/`, `application/`, `infrastructure/` e `shared/` foram criados dentro de `src/`.
3.  **Movimentação Inicial de Pastas:**
    *   `app/` -> `src/app/`
    *   `actions/` -> `src/infrastructure/actions/`
    *   `components/` -> `src/shared/components/`
    *   `contexts/` -> `src/shared/components/contexts/` (decidido agrupar contextos com componentes)
    *   `hooks/` -> `src/shared/hooks/`
    *   `lib/` -> `src/infrastructure/lib/` (temporário, para consolidação)
    *   `models/` -> `src/domain/models/`
    *   `services/` -> `src/application/services/`
    *   `styles/` -> `src/shared/styles/`
    *   `types/` -> `src/shared/types/`
    *   `utils/` -> `src/shared/lib/utils/` (temporário, para consolidação)
4.  **Consolidação de `lib/db.ts` e `lib/mongodb.ts`:** O conteúdo foi mesclado em `src/infrastructure/persistence/db.ts`, e os arquivos originais foram removidos.
5.  **Organização de `src/shared/lib/`:** Arquivos como `actions.ts`, `client-auth-utils.ts`, `export-utils.ts`, `validations.ts` foram movidos para `src/shared/lib/`. `jobs-constants.ts` foi movido para `src/shared/types/`. `pdf-template.tex` foi movido para `src/shared/assets/`.
6.  **Renomeação de Pastas Internas:**
    *   `src/domain/entities/` para `src/domain/models/`
    *   `src/application/use-cases/` para `src/application/services/`
    *   `src/application/validation/` para `src/application/schemas/`

## 2. Atualização de Caminhos de Importação:

Uma parte significativa da refatoração envolveu a atualização dos caminhos de importação em diversos arquivos para refletir a nova estrutura de pastas. Isso foi feito para:

*   `src/app/layout.tsx`
*   `src/app/[slug]/layout.tsx`
*   `src/app/[slug]/dashboard/page.tsx`
*   `src/app/[slug]/admin/page.tsx`
*   `src/app/[slug]/screening/page.tsx`
*   `src/app/public/page.tsx`
*   `src/app/public/layout.tsx`
*   `src/app/login/page.tsx`
*   `src/app/apply/[jobSlug]/page.tsx`
*   `src/app/[slug]/jobs/[jobId]/details/page.tsx`
*   `src/app/[slug]/jobs/[jobId]/upload/page.tsx`
*   `src/app/public/candidates/[hash]/page.tsx`
*   `src/app/public/job/[hash]/page.tsx`
*   `middleware.ts`
*   `src/shared/components/navbar.tsx`
*   `src/shared/components/application-stepper.tsx`
*   `src/shared/components/candidate-button.tsx`
*   `src/shared/components/candidate-ranking.tsx`
*   `src/shared/components/login-theme-selector.tsx`
*   `src/shared/components/not-found.tsx`
*   `src/shared/components/share-dialog.tsx`
*   `src/shared/components/testimonial-carousel.tsx`
*   `src/shared/components/theme-provider.tsx`
*   `src/shared/components/theme-selector.tsx`
*   `src/shared/components/ui/*` (todos os componentes UI foram atualizados para usar `src/shared/lib/utils`)
*   `src/shared/hooks/use-address.tsx`
*   `src/shared/hooks/use-auth.ts`
*   `src/shared/hooks/use-job-validation.tsx`
*   `src/shared/hooks/use-public-jobs.ts`
*   `src/shared/hooks/use-toast.ts`
*   `src/domain/models/*` (todos os modelos de domínio foram atualizados)
*   `src/application/services/candidates.ts`
*   `src/application/services/admin.ts`
*   `src/application/services/jobs.ts`
*   `src/application/services/public-jobs.ts`
*   `src/application/services/share.ts`
*   `src/infrastructure/actions/admin-actions.ts`
*   `src/infrastructure/actions/auth-actions.ts`
*   `src/infrastructure/actions/candidate-actions.ts`
*   `src/infrastructure/actions/dashboard-actions.ts`
*   `src/infrastructure/actions/job-actions.ts`
*   `src/infrastructure/actions/public-actions.ts`
*   `src/infrastructure/auth/auth.ts`
*   `src/infrastructure/logging/audit.ts`
*   `src/infrastructure/persistence/db.ts`

## 3. Separação de Lógica Interna (`*Internal`) e Server Actions:

Um dos objetivos principais é separar a lógica de negócio pura (que reside na camada de `application/services/`) das Server Actions (que são a interface da camada de `infrastructure/actions/`).

### 3.1. O que foi feito:

*   **`src/application/services/admin.ts`:** A lógica interna foi movida para a classe `AdminService` em `src/application/services/AdminService.ts`. As Server Actions em `src/infrastructure/actions/admin-actions.ts` foram atualizadas para chamar os métodos desta classe.
*   **`src/application/services/candidates.ts`:** A lógica interna foi movida para a classe `CandidateService` em `src/application/services/CandidateService.ts`. As Server Actions em `src/infrastructure/actions/candidate-actions.ts` foram atualizadas para chamar os métodos desta classe.
*   **`src/application/services/jobs.ts`:** A lógica interna foi movida para a classe `JobService` em `src/application/services/JobService.ts`. As Server Actions em `src/infrastructure/actions/job-actions.ts` foram atualizadas para chamar os métodos desta classe.
*   **`src/application/services/public-jobs.ts`:** A lógica interna foi movida para a classe `PublicJobService` em `src/application/services/PublicJobService.ts`. As Server Actions em `src/infrastructure/actions/public-actions.ts` foram atualizadas para chamar os métodos desta classe.
*   **`src/application/services/share.ts`:** A lógica interna foi movida para a classe `ShareService` em `src/application/services/ShareService.ts`. As Server Actions em `src/infrastructure/actions/public-actions.ts` foram atualizadas para chamar os métodos desta classe.

### 3.2. O que falta fazer (Próximas Etapas):

1.  **Remover arquivos de serviço antigos:** Os arquivos originais em `src/application/services/` (ex: `admin.ts`, `candidates.ts`, `jobs.ts`, `public-jobs.ts`, `share.ts`) agora estão vazios ou contêm apenas as exportações das Server Actions. Eles devem ser removidos, pois a lógica interna foi movida para as novas classes de serviço.
2.  **Revisar e ajustar `src/infrastructure/actions/auth-actions.ts`:** Garantir que a `getSession` esteja correta e que as chamadas internas sejam para a camada de aplicação, se houver.
3.  **Atualizar `README.md`:** Atualizar o `README.md` do projeto para refletir a nova estrutura de pastas e as convenções de Clean Architecture/DDD.

## 4. Instruções para as Próximas Etapas:

Por favor, execute os seguintes comandos para finalizar a refatoração:

1.  **Remover os arquivos de serviço antigos:**
    ```bash
    rm src/application/services/admin.ts
    rm src/application/services/candidates.ts
    rm src/application/services/jobs.ts
    rm src/application/services/public-jobs.ts
    rm src/application/services/share.ts
    ```
2.  **Revisar e ajustar `src/infrastructure/actions/auth-actions.ts`:**
    *   Abra o arquivo `src/infrastructure/actions/auth-actions.ts`.
    *   Verifique a função `getSession()`. Se ela ainda estiver mockada ou não estiver obtendo a sessão de forma real, este é o momento de integrá-la com a solução de autenticação real do seu projeto (ex: NextAuth).
    *   Confirme que as chamadas internas (`loginActionInternal`, `logoutActionInternal`, `refreshTokenActionInternal`) estão corretas e que a lógica de `withActionLogging` as envolve adequadamente.

3.  **Atualizar `README.md`:**
    *   Abra o arquivo `README.md` na raiz do projeto.
    *   Atualize a seção de estrutura de pastas para refletir a nova organização (`src/app`, `src/domain`, `src/application`, `src/infrastructure`, `src/shared`).
    *   Adicione uma breve explicação sobre as camadas e suas responsabilidades, alinhadas com Clean Architecture/DDD.
    *   Atualize quaisquer instruções de desenvolvimento ou deploy que possam ter sido afetadas pela nova estrutura.

Após a conclusão dessas etapas, a refatoração da estrutura do projeto estará completa.
