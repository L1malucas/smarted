# Backlog de Melhorias e Tarefas - Projeto SmartED

Este documento detalha o backlog de tarefas técnicas e de negócio para o projeto SmartED. As tarefas estão priorizadas por criticidade para orientar o desenvolvimento, garantir a estabilidade da plataforma e aprimorar a experiência do usuário.

---

## 🔴 Criticidade Alta

*Tarefas que abordam bugs críticos, inconsistências arquiteturais ou falhas de segurança. Devem ser tratadas com prioridade máxima para evitar problemas em produção e garantir a integridade do sistema.*

### 1. Correção de Rotas Públicas Duplicadas e Inconsistentes (Concluída)
- **Descrição:** As rotas para listagem de vagas públicas foram unificadas e organizadas para seguir a arquitetura multi-tenant, eliminando duplicidade e garantindo clareza no fluxo de navegação.
- **Ação Realizada:**
  1.  O conteúdo da antiga `app/public/job/page.tsx` foi movido para `app/public/page.tsx`, que agora serve como a listagem global de vagas de todos os tenants.
  2.  A rota `app/[slug]/public/jobs/page.tsx` foi confirmada/configurada como a listagem de vagas públicas para um tenant específico.
  3.  O arquivo `app/public/job/page.tsx` foi removido.
  4.  Um placeholder para `app/public/job/[hash]/page.tsx` foi criado para o compartilhamento de vagas específicas.
  5.  Links internos (`components/candidate-button.tsx`) foram atualizados para apontar para as novas rotas.

### 2. Eliminação de Lógica Duplicada no Hook `use-mobile` (Concluída)
- **Descrição:** O projeto continha duas implementações idênticas do hook `use-mobile`. Esta duplicidade foi eliminada.
- **Ação Realizada:**
  1.  O arquivo `components/ui/use-mobile.tsx` foi removido, mantendo `hooks/use-mobile.tsx` como a única fonte de verdade.

### 3. Auditoria e Remoção Completa de Dados Mockados (Concluída)
- **Descrição:** Todos os dados mockados foram removidos do sistema, preparando a aplicação para integração com um backend real. Os componentes agora exibem estados vazios ou mensagens de "sem dados" quando não há informações disponíveis.
- **Ação Realizada:**
  1.  Todos os serviços (`jobs.ts`, `candidates.ts`, `admin.ts`, `auth.ts`) foram limpos de dados mockados e ajustados para retornar valores padrão ou vazios.
  2.  Componentes e páginas que utilizavam mocks diretamente (`system-settings.tsx`, `expired-jobs.tsx`, `app/apply/[jobSlug]/page.tsx`, `app/[slug]/jobs/[jobId]/details/page.tsx`, `app/public/candidates/[hash]/page.tsx`) foram atualizados para não dependerem de dados mockados.
  3.  O tratamento de informações para quando não houver dados para exibir foi verificado e ajustado onde necessário.

### 4. Auditoria de Segurança e Controle de Acesso Multi-Tenant (Concluída - Contrato Frontend)
- **Descrição:** O contrato para a passagem do `tenantSlug` em operações sensíveis foi estabelecido no frontend, preparando a aplicação para a validação de segurança multi-tenant no backend.
- **Ação Realizada:**
  1.  Todos os métodos relevantes em `services/jobs.ts` foram atualizados para receber `tenantSlug` como um parâmetro obrigatório.
  2.  As chamadas a esses métodos em páginas e componentes (`app/[slug]/jobs/create/page.tsx`, `app/[slug]/jobs/page.tsx`, `app/apply/[jobSlug]/page.tsx`, `app/[slug]/jobs/[jobId]/details/page.tsx`) foram atualizadas para passar o `tenantSlug`.
  3.  O uso de `localStorage` para dados de administração em `app/[slug]/admin/page.tsx` foi removido, e as operações agora dependem exclusivamente do `adminService`.
- **Observação:** A validação de segurança multi-tenant real e a aplicação de controle de acesso devem ser implementadas no backend. Testes automatizados são cruciais para garantir a integridade dos dados entre tenants.

### 5. Configuração da Conexão com o Banco de Dados (MongoDB) e Schemas Mongoose (Concluída)
- **Descrição:** A aplicação agora possui uma conexão estável e otimizada com o MongoDB, utilizando Mongoose para a definição de schemas para as principais entidades do sistema (Log, User, Job).
- **Ação Necessária:**
  1.  Adicionar a variável de ambiente `MONGODB_URI` ao projeto.
  2.  Criar um arquivo utilitário em `lib/mongodb.ts` que exporta uma `Promise` de um cliente MongoDB, reutilizando a conexão em todo o aplicativo para otimizar a performance.
  3.  Garantir que o padrão de implementação lide corretamente com o Hot Module Replacement (HMR) em desenvolvimento.
  4.  Definir schemas Mongoose para `Log` (em `models/Log.ts`), `User` (em `models/User.ts`) e `Job` (em `models/Job.ts`), incluindo sub-schemas para entidades aninhadas como `Competency`, `JobQuestion`, `CriteriaWeights` e `StatusChangeLog`.

### 6. Implementação do Wrapper Unificado para Feedback e Logs (Concluída)
- **Descrição:** Um wrapper unificado foi implementado para padronizar o feedback ao usuário (via toasts) e o registro de logs de auditoria para Server Actions.
- **Ação Realizada:**
  1.  O método `saveAuditLog` em `services/audit.ts` foi utilizado para registrar logs.
  2.  O arquivo `lib/actions.ts` foi criado com a função `withActionLogging`, que encapsula Server Actions, dispara toasts de sucesso/erro e registra logs.
  3.  A Server Action `JobService.saveJob` em `app/[slug]/jobs/create/page.tsx` foi integrada ao wrapper `withActionLogging` como exemplo.

---

## 🟡 Criticidade Média

*Tarefas relacionadas a débitos técnicos, refatorações importantes para escalabilidade e a finalização de funcionalidades-chave que não são bloqueadoras, mas são essenciais para a experiência completa do produto.*

### 1. Refatoração do Sistema de Temas para CSS Variables (Concluída e Corrigida)
- **Descrição:** O sistema de temas foi refatorado para usar variáveis CSS, tornando-o mais escalável e manutenível. A correção de um erro de build relacionado à ausência de diretivas `@tailwind` nos arquivos de tema individuais foi implementada.
- **Ação Necessária:**
  1.  Definir um conjunto de CSS variables (custom properties) para todas as cores, fontes, espaçamentos e outros elementos de design no arquivo de CSS global (`app/globals.css`).
  2.  Refatorar os arquivos de tema (`brutalism.css`, `friendly.css`, `neo-clean.css`, `system.css`) para que apenas declarem os valores dessas variáveis dentro de um seletor de classe (ex: `.theme-brutalism`) e incluam as diretivas `@tailwind base;`, `@tailwind components;`, e `@tailwind utilities;`.
  3.  Atualizar o `ThemeProvider` (`components/theme-provider.tsx`) para aplicar a classe do tema selecionado ao elemento `<html>`, ativando dinamicamente o conjunto de variáveis correto.

### 2. Centralização dos Esquemas de Validação com Zod (Concluída)
- **Descrição:** A validação de formulários foi centralizada para garantir consistência em toda a aplicação. Esquemas de validação espalhados pelo código eram difíceis de manter.
- **Ação Realizada:**
  1.  Criada a pasta `/lib/schemas` para armazenar todos os esquemas de validação do Zod.
  2.  Criado o arquivo `lib/schemas/job.schema.ts` e movidos os esquemas Zod relacionados a vagas para lá.
  3.  Atualizado `hooks/use-job-validation.tsx` para importar e utilizar os esquemas centralizados.

### 3. Implementação Completa do Módulo de Administração (Concluída)
- **Descrição:** Os componentes do painel de administração foram implementados com lógica de UI e integração com serviços de backend mockados, tornando-os funcionais.
- **Ação Realizada:**
  1.  **User Management (`components/admin/user-management.tsx`):** Implementado com validação de inputs, estados de carregamento e notificações toast para adicionar/remover usuários.
  2.  **Audit Logs (`components/admin/audit-logs.tsx`):** O `app/[slug]/admin/page.tsx` foi atualizado para gerenciar o carregamento dos logs, exibindo skeletons e toasts em caso de erro.
  3.  **System Settings (`components/admin/system-settings.tsx`):** Adicionados campos de formulário para configurações de exemplo, com estados de carregamento e notificações toast para salvar.
  4.  **Expired Jobs (`components/admin/expired-jobs.tsx`):** Implementado com dados mockados, exibição em tabela, estados de carregamento e funcionalidade de reativação (mockada) com toasts.
  5.  **Support (`components/admin/support.tsx`):** Adicionado um formulário de contato simples com estados de carregamento e notificações toast para envio.

### 4. Melhoria de UX no Formulário de Aplicação de Vaga (`application-stepper`) (concluída)
- **Descrição:** Um formulário de múltiplos passos pode ser uma fonte de frustração para o usuário se não for bem implementado. É crucial fornecer feedback claro, lidar com estados de carregamento e validar os dados de forma inteligente.
- **Ação Necessária:**
  1.  Adicionar indicadores de carregamento (loading spinners) nos botões de "Avançar" e "Enviar" para desabilitá-los durante a submissão e evitar cliques duplos.
  2.  Garantir que os erros de validação sejam exibidos de forma clara e próximos aos campos correspondentes.
  3.  Salvar o progresso do usuário no `localStorage` para que ele possa continuar de onde parou caso feche a aba acidentalmente.
  4.  Assegurar que o componente seja totalmente responsivo e acessível (a11y).

### 5. Centralização de Tipagens e Análise de Modelos de Dados
- **Descrição:** Atualmente, as definições de tipos e interfaces podem estar espalhadas pelos componentes e hooks, em vez de estarem centralizadas na pasta `/types`. Isso leva à duplicação, inconsistências (ex: duas interfaces para 'Job' com propriedades diferentes) e dificulta a manutenção. Além disso, o sistema se beneficiaria da criação de modelos de dados (classes) para entidades complexas como 'User' ou 'Job', que poderiam encapsular regras de negócio e lógica de estado.
- **Ação Necessária:**
  1.  **Mapeamento e Migração:** Realizar uma varredura completa no projeto para encontrar todas as definições de 'type' e 'interface' que estão fora da pasta `/types`.
  2.  **Centralização:** Mover todas as interfaces encontradas para seus respectivos arquivos modulares dentro de `/types` (ex: tipos de admin para `admin-interface.ts`, tipos de vagas para `jobs-interface.ts`).
  3.  **Consolidação:** Identificar e remover interfaces duplicadas ou conflitantes, criando uma única fonte de verdade para cada entidade de dados.
  4.  **Análise de Modelos:** Avaliar as entidades 'User', 'Job' e 'Candidate'. Para cada uma, determinar se a criação de uma classe TypeScript (Model) seria vantajosa para encapsular lógica de negócio (ex: um método `job.isExpired()` ou `user.hasPermission('admin')`).
  5.  **Implementação de Modelos (se aplicável):** Implementar as classes de modelo decididas na etapa anterior e refatorar o código para utilizá-las, simplificando a lógica nos componentes e serviços.

### 6. Auditoria e Implementação de Acessibilidade (a11y) (Em Progresso)
- **Descrição:** Acessibilidade não é uma feature, mas um requisito fundamental. O sistema deve ser utilizável por todos, incluindo pessoas que dependem de tecnologias assistivas como leitores de tela.
- **Ação Necessária:**
  1.  **HTML Semântico:** Revisar todo o JSX para garantir o uso correto de tags como `<main>`, `<nav>`, `<header>`, `<section>`, e `<button>`.
  2.  **Atributos ARIA:** Adicionar `aria-label`, `aria-describedby` e outros atributos ARIA em componentes complexos ou não-nativos para fornecer contexto aos leitores de tela.
  3.  **Navegação por Teclado:** Garantir que todos os elementos interativos sejam focáveis e operáveis via teclado, na ordem lógica.
  4.  **Contraste de Cores:** Auditar as paletas de cores nos temas para garantir que atendam às diretrizes do WCAG.
  5.  **Ferramentas Automatizadas (Concluída):** Instalado e configurado o plugin `eslint-plugin-jsx-a11y` para capturar problemas de acessibilidade durante o desenvolvimento. Este plugin agora está ativo e ajudará a identificar automaticamente muitos problemas de acessibilidade no código JSX.

### 7. Implementação de Estados de Carregamento (Loading) Globais e Locais (Concluída)
- **Descrição:** A aplicação agora fornece feedback visual claro para o usuário durante o carregamento de dados, seja na navegação entre páginas ou durante a execução de uma ação assíncrona (Server Action). Isso melhora a percepção de performance e evita interações duplicadas.
- **Ação Realizada:**
  1.  **Loading de Navegação (Página Inteira):** Implementado `loading.tsx` na raiz do diretório `app/` e aprimorado `components/loading.tsx` para um feedback visual proeminente durante as transições de rota.
  2.  **Loading de Ações (Local):** Utilizado `useTransition` em `LoginPage` para desabilitar botões de submissão e exibir um indicador de carregamento.
  3.  **Loading de Componentes (Suspense):** Demonstrado o uso de `React.Suspense` com `Skeleton` como fallback em `app/page.tsx` para carregamento de dados em nível de componente.
  4.  **Consistência:** `LoadingProvider` atualizado para usar `CustomLoading` e layouts (`app/layout.tsx`, `app/public/layout.tsx`, `app/global-layout.tsx`) configurados com `Suspense` para garantir feedback visual em todas as transições.

---

## 🟢 Criticidade Baixa

*Melhorias de qualidade de vida para desenvolvedores (DX), otimizações de performance e novas funcionalidades que agregam valor, mas não são essenciais para o funcionamento principal do produto.*


### 2. Otimização de Imagens e Ativos Estáticos (Concluída)
- **Descrição:** As imagens na pasta `/public` (logos, placeholders) devem ser otimizadas para a web e servidas através do componente `next/image` para aproveitar o lazy loading e a otimização automática de formato e tamanho.
- **Ação Necessária:**
  1.  Substituir todas as tags `<img>` por `<Image>` do Next.js.
  2.  Converter imagens para formatos modernos e eficientes, como `.webp`.
  3.  Verificar o tamanho dos bundles de CSS e JavaScript e analisar oportunidades de code-splitting.

### 3. Desenvolvimento de Funcionalidade de Notificação por E-mail
- **Descrição:** Para melhorar a comunicação, o sistema poderia enviar e-mails automáticos em eventos-chave.
- **Ação Necessária:**
  1.  **Para Candidatos:** Enviar um e-mail de confirmação após a aplicação a uma vaga.
  2.  **Para Recrutadores:** Enviar uma notificação quando um novo candidato se inscreve em uma de suas vagas.
  3.  Integrar um serviço de e-mail transacional (ex: Resend, SendGrid).

### 4. Melhoria na Ferramenta de Busca de Vagas e Candidatos
- **Descrição:** A funcionalidade de busca atual é básica. Poderia ser aprimorada com filtros mais avançados para melhorar a experiência do recrutador e do candidato.
- **Ação Necessária:**
  1.  **Busca Pública:** Adicionar filtros por localidade, tipo de contrato (remoto, híbrido), e faixa salarial.
  2.  **Busca de Candidatos (Recrutador):** Implementar uma busca por palavras-chave nos currículos e filtros por competências ou status no processo seletivo.

### 5. Criação de Página 404 Personalizada e Temática (Concluída)
- **Descrição:** Atualmente, o Next.js renderiza uma página 404 padrão, que não está alinhada com a identidade visual do sistema. Uma página de "Não Encontrado" personalizada melhora a experiência do usuário, retém o visitante no site e reforça a marca.
- **Ação Necessária:**
  1.  **Criar o Arquivo:** No diretório `app/`, crie um novo arquivo chamado `not-found.tsx`. O App Router do Next.js irá automaticamente utilizar este arquivo para renderizar todas as rotas 404.
  2.  **Design da Página:** Desenvolver um componente visualmente agradável que se alinhe com o tema da aplicação. A página deve conter:
      - Uma mensagem clara e amigável (ex: "Página Não Encontrada").
      - Uma ilustração ou ícone relacionado ao tema do sistema (um robô perdido, um currículo voando, etc.).
      - Um botão (componente `Button`) com um `Link` do Next.js para que o usuário possa retornar à página inicial (`/`) ou ao dashboard.
  3.  **Componente Reutilizável:** Construir a UI da página 404 como um componente separado (ex: `components/not-found-page.tsx`) para manter o arquivo `app/not-found.tsx` limpo e apenas responsável pela lógica de roteamento.
