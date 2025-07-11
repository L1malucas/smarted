# Sistema de Recrutamento IA - SMARTED TECH SOLUTIONS

Este é um sistema de recrutamento inteligente projetado para otimizar e automatizar o processo de seleção de candidatos, utilizando inteligência artificial para análise de currículos e ranqueamento.

## Visão Geral

O sistema permite que recrutadores gerenciem vagas, processem candidaturas, avaliem candidatos com base em critérios ponderados e IA, e conduzam o processo de contato e contratação de forma eficiente. Possui um painel administrativo para gerenciamento de usuários, logs e configurações do sistema.

## Tecnologias Utilizadas

*   **Next.js 14 (App Router)**: Framework React para desenvolvimento full-stack.
*   **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
*   **MongoDB & Mongoose**: Banco de dados NoSQL e ODM (Object Data Modeling) para Node.js, utilizados para persistência de dados e modelagem de schemas.
*   **Tailwind CSS**: Framework CSS utility-first para estilização rápida, agora com sistema de temas baseado em variáveis CSS.
*   **shadcn/ui**: Coleção de componentes de UI reutilizáveis, construídos com Radix UI e Tailwind CSS.
*   **Lucide React**: Biblioteca de ícones SVG.
*   **Recharts**: Biblioteca de gráficos para visualização de dados.

## Estrutura do Projeto

O projeto segue uma estrutura de pastas organizada em camadas, alinhada com os princípios de Clean Architecture/DDD, adaptada para o Next.js App Router. Isso promove a separação de responsabilidades, modularidade e facilita a manutenção e escalabilidade.

```
.
├── src/                     # Raiz do código-fonte da aplicação
│   ├── app/                 # Camada de Apresentação (Next.js Routing)
│   │   ├── [slug]/          # Rotas dinâmicas por tenant (ex: /tenant-id/dashboard)
│   │   ├── api/             # Rotas de API do Next.js (parte da Infraestrutura/Web)
│   │   ├── login/           # Página de login
│   │   ├── public/          # Páginas públicas (ex: vagas abertas)
│   │   ├── globals.css      # Estilos globais
│   │   ├── layout.tsx       # Layout raiz (HTML, body, provedores globais)
│   │   └── page.tsx         # Página raiz (ex: redirecionamento inicial)
│   │
│   ├── domain/              # Camada de Domínio (Core da Lógica de Negócio)
│   │   ├── models/          # Entidades de domínio (interfaces/tipos puros, regras de negócio)
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

### Visão Geral das Camadas:

*   **`app/` (Apresentação):** Contém o código específico do Next.js para roteamento e UI. As páginas e layouts são responsáveis por orquestrar os componentes e chamar as Server Actions.
*   **`domain/` (Domínio):** O coração da aplicação. Contém as entidades, regras de negócio e contratos (interfaces de repositórios) que são independentes de qualquer tecnologia ou framework.
*   **`application/` (Aplicação):** Define os casos de uso da aplicação. Orquestra as entidades do domínio e interage com a infraestrutura através das interfaces definidas no domínio. Contém os schemas de validação e DTOs.
*   **`infrastructure/` (Infraestrutura):** Contém as implementações concretas de tudo que é externo ao domínio e à aplicação, como acesso a banco de dados, autenticação, logging, e as Server Actions que atuam como adaptadores para a camada de apresentação.
*   **`shared/` (Compartilhado):** Contém código que é utilizado por múltiplas camadas e não pertence a nenhuma camada específica, como componentes de UI genéricos, hooks, tipos globais e utilitários.

## Funcionalidades Principais

### 1. Gerenciamento de Vagas
*   Criação de vagas com título, descrição detalhada.
*   Definição de **competências** com pesos (1-5), marcando as principais como obrigatórias.
*   Criação de **perguntas** abertas ou fechadas para os candidatos.
*   Opção de marcar vaga como **exclusiva para PCD**.
*   Opção de vaga por **indicação** (pula perguntas no processo de candidatura).
*   Gerenciamento de **status da vaga**: `aberta`, `recrutamento`, `triagem`, `avaliação`, `contato`, `vaga fechada`, `draft`.
*   Alteração manual do status da vaga com log de quem alterou.
*   Visualização de quem criou a vaga.
*   Filtros e buscas avançadas na listagem de vagas.

### 2. Processo de Recrutamento por Etapas
*   **Triagem (`/screening`)**:
    *   Visualização de candidatos que aplicaram para vagas em status inicial.
    *   Filtro por vaga.
    *   Busca por nome, email.
    *   Ordenação por nome, data de aplicação, match da IA.
    *   Ações: Aprovar para avaliação, reprovar, ver detalhes, download CV.
*   **Avaliação (`/evaluation`)**:
    *   Candidatos aprovados na triagem.
    *   Ordenação por nível de match (baixo, médio, alto).
    *   Visualização detalhada do candidato (modal):
        *   Anotações livres.
        *   Status PCD.
        *   Upload de testes e respostas (simulado).
    *   Remoção de candidatos da etapa.
    *   Paginação para controlar quantidade de candidatos visíveis.
*   **Contato (`/contact`)**:
    *   Candidatos aprovados na avaliação.
    *   Envio de e-mails personalizados com dados de entrevista (simulado).
    *   Botões para integração com plataformas de videoconferência (Google Meet, Zoom, Teams - simulado).
    *   Botões para integração com agendas (Google Calendar, Outlook Calendar - simulado).

### 3. Dashboard (`/dashboard`)
*   Métricas chave:
    *   Vagas criadas.
    *   Candidatos cadastrados.
    *   Contatos realizados.
    *   Matches gerados.
*   Gráficos de progresso mensal e atividade do usuário.
*   Filtro por período.

### 4. Painel Administrativo (`/admin`)
*   Gerenciamento de usuários (CPFs permitidos) e suas permissões (admin/recruiter).
*   Tela para gerenciar **vagas expiradas/inativas**.
*   Visualizador de **logs de auditoria** com filtros por data, usuário e tipo de ação.
*   Configurações gerais do sistema (placeholder).

### 5. Candidatura (`/apply/[jobSlug]`)
*   Processo de aplicação em formato stepper:
    *   Passo 1: Upload de currículo (PDF obrigatório).
    *   Passo 2: Resposta das perguntas da vaga (se não for indicação).

### 6. Funcionalidades Adicionais
*   **Compartilhamento de Links**:
    *   Vagas, relatórios de triagem/avaliação, dashboard podem ser compartilhados.
    *   Geração de links públicos com hash.
    *   Controle de expiração (simulado no frontend) e senha de acesso (a ser implementado).
*   **Notificações Internas**:
    *   Alertas (toasts, badges) para ações pendentes, novas candidaturas, etc., acessíveis pelo ícone de sino na navbar.
*   **Exportação de Relatórios**:
    *   Opções para exportar dados em PDF/Excel (simulado) por vaga, etapa ou geral.
*   **Segurança e Acesso**:
    *   Login com Google OAuth (apenas e-mails pré-autorizados no sistema).
    *   Controle de permissões por perfil de usuário (simulado, mas com `tenantId` no modelo `User` para multi-tenancy).
    *   **Atenção**: O controle de limite de usuários por tenant será implementado em uma etapa futura.
*   **Qualidade de Vida**:
    *   Tema escuro por padrão.
    *   Design responsivo.
    *   Imagens otimizadas com `next/image`.
    *   Busca e filtros em diversas telas operacionais.

## Ferramentas e Macros

*   **`withActionLogging`** (`shared/lib/actions.ts`): Um wrapper para ações assíncronas que automatiza o logging de auditoria e a exibição de toasts de sucesso/erro.
*   **Funções de Validação e Formatação (`shared/lib/validations.ts`):**
    *   `validateRequiredFields`: Valida se campos obrigatórios estão preenchidos.
    *   `validateCPF`: Validação de formato e dígitos de CPF.
    *   `formatCPF`: Formatação de strings de CPF.
    *   `sanitizeInput`: Sanitização de strings para prevenir XSS.
*   **Hooks Reutilizáveis (`shared/hooks/`):**
    *   `useAddressAutocomplete`: Hook para autocompletar endereços (usando Nominatim).
    *   `useJobValidation`: Hook para validação de formulários de vaga.
    *   `useToast`: Hook para exibir notificações toast.
*   **Funções de Exportação (`shared/lib/export-utils.ts`):**
    *   `exportToPDF`: Exporta dados para PDF.
    *   `exportToExcel`: Exporta dados para Excel.
## Configuração e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd <nome-do-projeto>
    ```

2.  **Instale as dependências:**
    ```bash
    yarn install
    ```

3.  **Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto com a seguinte variável:
        ```
        MONGODB_URI="mongodb://localhost:27017/SMARTED"
        ```
        Substitua `mongodb://localhost:27017` pela sua string de conexão do MongoDB, se for diferente.

4.  **Variáveis de Ambiente para Google OAuth:**
    *   Adicione as seguintes variáveis ao seu `.env.local`:
        ```
        GOOGLE_CLIENT_ID="SEU_CLIENT_ID_GOOGLE"
        GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET_GOOGLE"
        NEXTAUTH_SECRET="UMA_STRING_LONGA_E_ALEATORIA"
        NEXTAUTH_URL="http://localhost:3004" # Ou a URL da sua aplicação
        ```
        Substitua os valores pelos seus próprios.

5.  **Popule o Banco de Dados (Opcional, para desenvolvimento/testes):**
    *   Certifique-se de que o e-mail da sua conta Google de teste esteja cadastrado na coleção `users` do MongoDB para poder fazer login.
    ```bash
    yarn populate-db
    ```
    Este script irá inserir um usuário administrador, uma vaga de exemplo e um log inicial no banco de dados `SMARTED`.

6.  **Execute o servidor de desenvolvimento:**
    ```bash
    yarn dev
    ```
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

7.  **Build para Produção:**
    ```bash
    yarn build
    ```

## Próximos Passos e Melhorias (Sugestões)

*   **Melhorias Recentes:**
    *   Implementação de Estados de Carregamento (Loading) Globais e Locais.
    *   Centralização dos Esquemas de Validação com Zod.
    *   Configuração de Ferramentas Automatizadas para Acessibilidade (`eslint-plugin-jsx-a11y`).
    *   Correção de Rotas Públicas Duplicadas e Inconsistentes.
    *   Eliminação de Lógica Duplicada no Hook `use-mobile`.
    *   Auditoria e Remoção Completa de Dados Mockados.
    *   Implementação do Wrapper Unificado para Feedback e Logs.
    *   Implementação Completa do Módulo de Administração.
    *   Auditoria de Segurança e Controle de Acesso Multi-Tenant (Contrato Frontend).
*   Implementar backend real com banco de dados (Supabase, Neon, MongoDB, etc.).
*   Integrar com uma API de IA real para análise de currículos.
*   Desenvolver o módulo completo de envio de e-mails.
*   Implementar as integrações com WhatsApp, plataformas de videoconferência e agendas.
*   Construir o módulo de suporte/reporte de problemas.
*   Refinar o sistema de rotas por slug de usuário e controle de acesso a rotas públicas (com backend).
*   Expandir os logs de auditoria com mais detalhes e persistência.
*   Aprimorar o controle de permissões e perfis de usuário.
*   Adicionar testes unitários e de integração.

Este README provê uma visão geral da aplicação SMARTED TECH SOLUTIONS para recrutamento. Para detalhes específicos sobre componentes ou fluxos, consulte o código-fonte e os comentários.