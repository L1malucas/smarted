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

O projeto segue a estrutura padrão do Next.js App Router:

*   `app/`: Contém todas as rotas, layouts e páginas da aplicação.
    *   `app/api/`: Para rotas de API (atualmente simuladas).
    *   `app/(authenticated)/`: Agrupa rotas que requerem autenticação.
        *   `dashboard/`: Página principal com métricas.
        *   `jobs/`: Gerenciamento de vagas (listar, criar, editar).
            *   `[slug]/details/`: Detalhes da vaga.
            *   `[slug]/candidates/`: Ranking de candidatos para uma vaga (substituído/integrado com Avaliação).
        *   `screening/`: Nova página para triagem de candidatos.
        *   `evaluation/`: Nova página para avaliação detalhada de candidatos.
        *   `contact/`: Nova página para gerenciar o contato com candidatos.
        *   `admin/`: Painel administrativo.
    *   `app/login/`: Página de login.
    *   `app/public/`: Layout e páginas para visualização pública de recursos compartilhados.
    *   `app/apply/[jobSlug]/`: Fluxo de candidatura para uma vaga específica.
*   `components/`: Componentes React reutilizáveis.
    *   `ui/`: Componentes do shadcn/ui (geralmente não modificados diretamente).
    *   `navbar.tsx`: Componente da barra de navegação principal.
    *   `share-dialog.tsx`: Modal para compartilhamento de links.
*   `services/`: Contém a lógica de "backend" simulada para autenticação, vagas, candidatos, etc.
*   `types/`: Definições de tipos TypeScript para a aplicação.
*   `public/`: Arquivos estáticos, como imagens (ex: `logo.png`).
*   `lib/`: Utilitários, como `cn` para classnames.

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
    *   Login por CPF (simulado).
    *   Controle de permissões por perfil de usuário (simulado).
*   **Qualidade de Vida**:
    *   Tema escuro por padrão.
    *   Design responsivo.
    *   Imagens otimizadas com `next/image`.
    *   Busca e filtros em diversas telas operacionais.

## Configuração e Execução

1.  **Clone o repositório:**
    \`\`\`bash
    git clone <url-do-repositorio>
    cd <nome-do-projeto>
    \`\`\`

2.  **Instale as dependências:**
    \`\`\`bash
    npm install
    # ou
    yarn install
    # ou
    pnpm install
    # ou
    bun install
    \`\`\`

3.  **Variáveis de Ambiente:**
    *   Crie um arquivo `.env.local` na raiz do projeto, se necessário, para configurar variáveis de ambiente (atualmente não são estritamente necessárias para a versão mockada).

4.  **Execute o servidor de desenvolvimento:**
    \`\`\`bash
    npm run dev
    # ou
    yarn dev
    # ou
    pnpm dev
    # ou
    bun run dev
    \`\`\`
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

5.  **Build para Produção:**
    \`\`\`bash
    npm run build
    # ou
    yarn build
    # ou
    pnpm build
    # ou
    bun run build
    \`\`\`

## Próximos Passos e Melhorias (Sugestões)

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
