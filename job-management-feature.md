# Funcionalidade: Gerenciamento de Vagas

## Descrição

Esta funcionalidade é o núcleo do sistema, permitindo que recrutadores criem, gerenciem e publiquem vagas de emprego. Ela abrange a definição de todos os aspectos de uma vaga, desde a descrição básica até competências ponderadas e perguntas de triagem. O sistema deve ser robusto, com validação de dados em todas as etapas e persistência direta no banco de dados, sem o uso de dados mockados.

## Tarefas e Requisitos

### 1. Modelagem de Dados (Domain e Infrastructure Layers)

*   **Descrição:** Definir e implementar os schemas do Mongoose e as interfaces do domínio para as coleções relacionadas a vagas.
*   **Collection `jobs`:**
    *   **Interface:** `src/domain/models/Job.ts`
    *   **Schema Mongoose:** (A ser criado em `src/infrastructure/persistence/schemas/job.schema.ts`)
    *   **Campos Principais:**
        *   `title`: String (obrigatório, min: 20, max: 200)
        *   `slug`: String (único, gerado a partir do título)
        *   `description`: String (obrigatório, min: 100, max: 5000)
        *   `department`: String (obrigatório)
        *   `location`: String (obrigatório)
        *   `salaryRange`: Object (`min`, `max`, `currency`)
        *   `employmentType`: Enum (`full_time`, `part_time`, `contract`, `internship`)
        *   `experienceLevel`: Enum (`junior`, `mid`, `senior`, `lead`)
        *   `tags`: Array de Strings
        *   `status`: Enum (`draft`, `aberta`, `recrutamento`, `triagem`, `avaliação`, `contato`, `fechada`)
        *   `isPCDExclusive`: Boolean
        *   `isReferralJob`: Boolean
        *   `isDraft`: Boolean
        *   `competencies`: Array de `ICompetency` (subdocumento)
        *   `questions`: Array de `IJobQuestion` (subdocumento)
        *   `statusChangeLog`: Array de `IStatusChangeLog` (subdocumento)
        *   `createdBy`: ObjectId (ref: `User`)
        *   `createdByName`: String
        *   `tenantId`: String (obrigatório, para multi-tenancy)
        *   `createdAt`, `updatedAt`: Timestamps

*   **Subdocumento `competencies`:**
    *   **Interface:** `src/domain/models/Competency.ts`
    *   **Campos:** `id` (UUID), `name` (String), `weight` (Number 1-5)

*   **Subdocumento `questions`:**
    *   **Interface:** `src/domain/models/JobQuestion.ts`
    *   **Campos:** `id` (UUID), `question` (String), `type` (Enum), `options` (Array de Strings), `required` (Boolean), `order` (Number)

### 2. Validação de Dados (Application Layer)

*   **Descrição:** Utilizar Zod para criar schemas de validação robustos para a criação e atualização de vagas.
*   **Localização:** `src/application/schemas/job.schema.ts`
*   **Schemas:**
    *   `jobSchema`: Validação para a criação de uma vaga completa (publicação).
        *   `title`: `string().min(20).max(200)`
        *   `description`: `string().min(100).max(5000)`
        *   `competencies`: `array(competencySchema).min(3)`
        *   Demais campos com validações apropriadas.
    *   `draftJobSchema`: Validação mais flexível para salvar um rascunho. A maioria dos campos será opcional.
    *   `updateJobSchema`: Schema para atualização, onde todos os campos são opcionais (`jobSchema.partial()`).

### 3. Server Actions (Infrastructure Layer)

*   **Descrição:** Implementar Server Actions para todas as operações CRUD e de gerenciamento de status, com integração direta ao banco de dados e logging de auditoria. Todas as ações devem obter o usuário da sessão para garantir a segurança e o `tenantId`.
*   **Localização:** `src/infrastructure/actions/job-actions.ts`
*   **Ações Requeridas:**
    1.  **`createJobAction(jobData, isDraft)`:**
        *   **Descrição:** Cria uma nova vaga. Se `isDraft` for `true`, usa `draftJobSchema` para validação; caso contrário, usa `jobSchema`.
        *   **Lógica:** Gera o `slug`, associa o `createdBy` e `tenantId` da sessão, e salva no banco.
        *   **Retorno:** O objeto `IJob` criado.
    2.  **`updateJobAction(jobId, jobData)`:**
        *   **Descrição:** Atualiza os dados de uma vaga existente.
        *   **Validação:** Usa `updateJobSchema`. Garante que o usuário tem permissão para editar a vaga.
        *   **Retorno:** O objeto `IJob` atualizado.
    3.  **`deleteJobAction(jobId)`:**
        *   **Descrição:** Remove uma vaga do banco de dados.
        *   **Validação:** Apenas o criador ou um admin pode deletar.
        *   **Retorno:** `{ success: true }`.
    4.  **`getJobByIdAction(jobId)`:**
        *   **Descrição:** Busca uma vaga específica pelo seu `_id`.
        *   **Validação:** Verifica se a vaga pertence ao `tenantId` do usuário.
        *   **Retorno:** O objeto `IJob` ou `null` se não encontrada.
    5.  **`getJobBySlugAction(slug)`:**
        *   **Descrição:** Busca uma vaga pelo seu `slug` (para páginas públicas).
        *   **Retorno:** O objeto `IJob` ou `null`.
    6.  **`listJobsAction(filters)`:**
        *   **Descrição:** Lista vagas para o tenant, com suporte a filtros, paginação e ordenação.
        *   **Parâmetros:** `filters` (objeto com `status?`, `searchQuery?`, `page?`, `limit?`, `sortBy?`).
        *   **Retorno:** `{ data: IJob[], total: number }`.
    7.  **`updateJobStatusAction(jobId, newStatus)`:**
        *   **Descrição:** Altera o status de uma vaga.
        *   **Lógica:** Adiciona um registro ao `statusChangeLog` com o usuário que realizou a alteração.
        *   **Retorno:** O objeto `IJob` atualizado.

### 4. Integração Frontend (App e Shared Layers)

*   **Descrição:** Desenvolver os componentes React para interagir com as Server Actions de gerenciamento de vagas. Os componentes devem ser agnósticos a dados mockados, gerenciando seus próprios estados de carregamento e erro.
*   **Componentes:**
    *   **`JobCreateForm` (`src/shared/components/jobs/job-create-form.tsx`):**
        *   Formulário completo para criação e edição de vagas.
        *   Utiliza o hook `useJobValidation` para validação em tempo real no cliente antes de submeter.
        *   Chama `createJobAction` ou `updateJobAction`.
        *   Gerencia o estado de `isSubmitting` para desabilitar botões e fornecer feedback visual.
        *   Se em modo de edição, busca os dados iniciais com `getJobByIdAction`.
    *   **`JobsListView` (`src/shared/components/jobs/jobs-view.tsx`):**
        *   Exibe a lista de vagas obtidas de `listJobsAction`.
        *   Inclui componentes de filtro (`JobsListFilters`) e cabeçalho (`JobsListHeader`).
        *   Gerencia estados de carregamento (exibindo skeletons de `JobCard`) e de lista vazia.
        *   Implementa paginação e ordenação.
    *   **`JobDetailsPage` (`src/app/[slug]/jobs/[jobId]/page.tsx`):**
        *   Página que exibe todos os detalhes de uma vaga.
        *   Busca os dados utilizando `getJobByIdAction`.
        *   Apresenta os dados de forma clara e organizada, incluindo competências, perguntas e histórico de status.
        *   Permite o acesso a ações como editar, alterar status ou deletar.

### 5. Segurança e Qualidade

*   **Autorização:** Todas as Server Actions devem verificar se o usuário autenticado tem permissão para realizar a operação no `tenantId` especificado.
*   **Tratamento de Erros:** As Server Actions devem usar o wrapper `withActionLogging` para capturar erros, registrar logs de auditoria e retornar feedback padronizado para a UI (via `toast`).
*   **Estado da UI:** Os componentes de frontend devem usar `try-catch` ao chamar Server Actions e atualizar seu estado (`loading`, `error`) adequadamente para fornecer feedback claro ao usuário.
*   **Navegação:** Após a criação ou edição bem-sucedida, o usuário deve ser redirecionado para a lista de vagas ou para a página de detalhes da vaga.

### 6. Exemplo de Query para Popular o Banco (`mongosh`)

db.jobs.insertMany([
  {
    title: "Desenvolvedor(a) Frontend Pleno (React & Next.js)",
    slug: "desenvolvedor-frontend-pleno-react-next-js",
    description: "Buscamos um(a) Desenvolvedor(a) Frontend Pleno com experiência em React e Next.js para se juntar à nossa equipe de produtos digitais. Você será responsável por criar interfaces de usuário ricas e responsivas, colaborar com designers e desenvolvedores backend, e garantir a qualidade e performance das nossas aplicações.",
    department: "Tecnologia",
    location: "Remoto",
    salaryRange: {
      min: 8000,
      max: 12000,
      currency: "BRL"
    },
    employmentType: "full_time",
    experienceLevel: "mid",
    tags: ["React", "Next.js", "TypeScript", "Frontend"],
    status: "aberta",
    isPCDExclusive: false,
    isReferralJob: false,
    isDraft: false,
    competencies: [
      { id: "c1-uuid", name: "React", weight: 5 },
      { id: "c2-uuid", name: "Next.js", weight: 5 },
      { id: "c3-uuid", name: "TypeScript", weight: 4 },
      { id: "c4-uuid", name: "Comunicação", weight: 3 }
    ],
    questions: [
      { id: "q1-uuid", question: "Descreva um projeto complexo que você construiu com Next.js.", type: "text", required: true, order: 1 },
      { id: "q2-uuid", question: "Qual sua experiência com testes de frontend?", type: "text", required: true, order: 2 }
    ],
    statusChangeLog: [
      { status: "draft", changedAt: new Date("2025-07-06T10:00:00Z"), changedBy: ObjectId("6865e95b6dbc20664fa360dd"), changedByName: "USUÁRIO" },
      { status: "aberta", changedAt: new Date("2025-07-07T09:00:00Z"), changedBy: ObjectId("6865e95b6dbc20664fa360dd"), changedByName: "USUÁRIO" }
    ],
    createdBy: ObjectId("6865e95b6dbc20664fa360dd"),
    createdByName: "USUÁRIO",
    tenantId: "default-tenant",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Engenheiro(a) de Dados Sênior (Python & AWS)",
    slug: "engenheiro-de-dados-senior-python-aws",
    description: "Estamos à procura de um(a) Engenheiro(a) de Dados Sênior para projetar, construir e manter pipelines de dados escaláveis e robustos na AWS. O candidato ideal terá forte experiência com Python, SQL, e serviços da AWS como Glue, Redshift e S3.",
    department: "Dados",
    location: "São Paulo, SP (Híbrido)",
    salaryRange: {
      min: 14000,
      max: 18000,
      currency: "BRL"
    },
    employmentType: "full_time",
    experienceLevel: "senior",
    tags: ["Python", "AWS", "ETL", "SQL", "Big Data"],
    status: "recrutamento",
    isPCDExclusive: false,
    isReferralJob: false,
    isDraft: false,
    competencies: [
      { id: "c5-uuid", name: "Python para Dados", weight: 5 },
      { id: "c6-uuid", name: "AWS Glue", weight: 4 },
      { id: "c7-uuid", name: "Arquitetura de Dados", weight: 5 },
      { id: "c8-uuid", name: "SQL Avançado", weight: 4 }
    ],
    questions: [],
    statusChangeLog: [
       { status: "aberta", changedAt: new Date("2025-07-01T11:00:00Z"), changedBy: ObjectId("6865e95b6dbc20664fa360dd"), changedByName: "USUÁRIO" },
       { status: "recrutamento", changedAt: new Date("2025-07-05T15:00:00Z"), changedBy: ObjectId("6865e95b6dbc20664fa360dd"), changedByName: "USUÁRIO" }
    ],
    createdBy: ObjectId("6865e95b6dbc20664fa360dd"),
    createdByName: "USUÁRIO",
    tenantId: "default-tenant",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Designer de Produto (UI/UX) - Rascunho",
    slug: "designer-de-produto-ui-ux-rascunho",
    description: "Vaga para designer de produto com foco em UI/UX para trabalhar em um novo app mobile.",
    department: "Produto",
    location: "A definir",
    employmentType: "contract",
    experienceLevel: "junior",
    tags: ["UI", "UX", "Figma"],
    status: "draft",
    isPCDExclusive: true,
    isReferralJob: false,
    isDraft: true,
    competencies: [
      { id: "c9-uuid", name: "Figma", weight: 5 },
      { id: "c10-uuid", name: "User Research", weight: 4 }
    ],
    questions: [],
    statusChangeLog: [],
    createdBy: ObjectId("6865e95b6dbc20664fa360dd"),
    createdByName: "USUÁRIO",
    tenantId: "default-tenant",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
