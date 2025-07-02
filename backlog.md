# Backlog de Melhorias e Tarefas - Projeto SmartED

Este documento detalha o backlog de tarefas técnicas e de negócio para o projeto SmartED. As tarefas estão priorizadas por criticidade para orientar o desenvolvimento, garantir a estabilidade da plataforma e aprimorar a experiência do usuário.

---

## 🔴 Criticidade Alta

*Tarefas que abordam bugs críticos, inconsistências arquiteturais ou falhas de segurança. Devem ser tratadas com prioridade máxima para evitar problemas em produção e garantir a integridade do sistema.*

### 1. Correção de Rotas Públicas Duplicadas e Inconsistentes
- **Descrição:** Atualmente, existem duas rotas para a listagem de vagas públicas: `app/[slug]/jobs/public/page.tsx` e `app/public/job/page.tsx`. Essa duplicidade gera confusão no fluxo de navegação do candidato, dificulta a manutenção e pode levar a comportamentos inesperados. A arquitetura multi-tenant do sistema, baseada no `[slug]`, é o padrão a ser seguido.
- **Ação Necessária:**
  1.  Analisar e definir qual das duas rotas é a canônica (provavelmente a que contém o `[slug]`).
  2.  Migrar qualquer lógica ou componente exclusivo da rota incorreta para a rota canônica.
  3.  Remover completamente a rota redundante (`app/public/job/page.tsx`) e seus componentes associados.
  4.  Garantir que todos os links internos apontem para a rota unificada.

### 2. Eliminação de Lógica Duplicada no Hook `use-mobile`
- **Descrição:** O projeto contém duas implementações idênticas do hook `use-mobile` nos arquivos `hooks/use-mobile.tsx` e `components/ui/use-mobile.tsx`. Esta é uma violação direta do princípio DRY (Don't Repeat Yourself), aumentando o risco de inconsistências e o esforço de manutenção.
- **Ação Necessária:**
  1.  Eleger uma única fonte de verdade para o hook, preferencialmente em `/hooks/use-mobile.tsx`.
  2.  Remover o arquivo duplicado em `/components/ui/use-mobile.tsx`.
  3.  Atualizar todas as importações nos componentes que utilizavam o hook removido para que apontem para a localização centralizada.

### 3. Auditoria e Remoção Completa de Dados Mockados
- **Descrição:** A presença do arquivo `app/[slug]/mock.ts` indica um risco de que componentes ainda estejam utilizando dados estáticos em vez de consumir a API real através da camada de `services`. Isso é um bloqueador para a implantação em produção e pode mascarar bugs na integração com o backend.
- **Ação Necessária:**
  1.  Realizar uma busca global no código para identificar todos os componentes que importam de `app/[slug]/mock.ts`.
  2.  Refatorar cada um desses componentes para que obtenham seus dados dinamicamente, utilizando as funções apropriadas dos `services`.
  3.  Após garantir que não há mais dependências, remover o arquivo `mock.ts`.

### 4. Auditoria de Segurança e Controle de Acesso Multi-Tenant
- **Descrição:** Em uma aplicação multi-tenant, a falha mais crítica é a de permitir que dados de um tenant (empresa) sejam acessados por outro. É vital garantir que todas as queries e Server Actions validem rigorosamente se o usuário autenticado pertence ao `slug` (tenant) que está tentando acessar.
- **Ação Necessária:**
  1.  Revisar todas as chamadas de API e Server Actions, especialmente nos `services`, para garantir que o `tenantId` (ou `slug`) seja um parâmetro obrigatório e validado no backend.
  2.  Implementar testes automatizados que tentem "cruzar" os limites dos tenants, por exemplo, um usuário do `tenant-a` tentando acessar uma vaga do `tenant-b`.
  3.  Assegurar que os tokens de sessão ou autenticação estejam estritamente ligados ao tenant do usuário.

### 5. Configuração da Conexão com o Banco de Dados (MongoDB)
- **Descrição:** A aplicação precisa de uma conexão estável e otimizada com o MongoDB para persistir todos os dados. A configuração inicial deve seguir as melhores práticas para ambientes serverless, como o da Vercel, para evitar a criação excessiva de conexões.
- **Ação Necessária:**
  1.  Adicionar a variável de ambiente `MONGODB_URI` ao projeto.
  2.  Criar um arquivo utilitário em `lib/mongodb.ts` que exporta uma `Promise` de um cliente MongoDB, reutilizando a conexão em todo o aplicativo para otimizar a performance.
  3.  Garantir que o padrão de implementação lide corretamente com o Hot Module Replacement (HMR) em desenvolvimento.

### 6. Implementação do Wrapper Unificado para Feedback e Logs
- **Descrição:** Para garantir consistência e robustez, todas as Server Actions devem fornecer feedback ao usuário (via toasts) e registrar logs de auditoria de forma padronizada. A criação de um wrapper unificado para essa finalidade é a abordagem mais limpa e manutenível.
- **Ação Necessária:**
  1.  **Serviço de Log:** Desenvolver a função `createLog` em `services/audit.ts` para inserir registros na coleção de auditoria do MongoDB.
  2.  **Wrapper de Ação:** Criar uma função de ordem superior em `lib/actions.ts` que receba uma Server Action e um payload de log. Esta função deve executar a ação, disparar um toast de sucesso ou erro (`sonner`) e chamar o serviço de log correspondente.
  3.  **Padronização:** Estabelecer que toda a lógica de backend que interage com o cliente seja encapsulada por este wrapper.

---

## 🟡 Criticidade Média

*Tarefas relacionadas a débitos técnicos, refatorações importantes para escalabilidade e a finalização de funcionalidades-chave que não são bloqueadoras, mas são essenciais para a experiência completa do produto.*

### 1. Refatoração do Sistema de Temas para CSS Variables
- **Descrição:** O sistema de temas atual, baseado em múltiplos arquivos CSS (`/styles/themes/*.css`), não é escalável. Ele aumenta o tamanho do bundle e dificulta a criação de novos temas ou a customização de temas existentes.
- **Ação Necessária:**
  1.  Definir um conjunto de CSS variables (custom properties) para todas as cores, fontes, espaçamentos e outros elementos de design no arquivo de CSS global ou no `tailwind.config.ts`.
  2.  Refatorar os arquivos de tema (`brutalism.css`, etc.) para que apenas declarem os valores dessas variáveis dentro de um seletor de classe (ex: `.theme-brutalism`).
  3.  Utilizar o `ThemeContext` para aplicar a classe do tema correspondente ao elemento `<body>` ou `<html>`, ativando dinamicamente o conjunto de variáveis correto.

### 2. Centralização dos Esquemas de Validação com Zod
- **Descrição:** A validação de formulários, embora presente no `use-job-validation.tsx`, precisa ser centralizada para garantir consistência em toda a aplicação (criação de vagas, formulário de candidatura, login, etc.). Esquemas de validação espalhados pelo código são difíceis de manter.
- **Ação Necessária:**
  1.  Criar uma pasta `/lib/schemas` para armazenar todos os esquemas de validação do Zod.
  2.  Criar arquivos distintos por domínio (ex: `job.schema.ts`, `candidate.schema.ts`).
  3.  Refatorar todos os formulários gerenciados pelo React Hook Form para importar e utilizar esses esquemas centralizados.

### 3. Implementação Completa do Módulo de Administração
- **Descrição:** Os componentes do painel de administração (`UserManagement`, `AuditLogs`, `SystemSettings`) parecem ser apenas placeholders. É necessário implementar a lógica de UI e a integração com os serviços de backend para que se tornem funcionais.
- **Ação Necessária:**
  1.  **User Management:** Implementar a listagem, criação, edição e desativação de usuários.
  2.  **Audit Logs:** Integrar com o `services/audit.ts` para exibir um log de ações importantes no sistema, com filtros por data e usuário.
  3.  **System Settings:** Implementar o formulário para alterar configurações globais do sistema.

### 4. Melhoria de UX no Formulário de Aplicação de Vaga (`application-stepper`)
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

### 6. Auditoria e Implementação de Acessibilidade (a11y)
- **Descrição:** Acessibilidade não é uma feature, mas um requisito fundamental. O sistema deve ser utilizável por todos, incluindo pessoas que dependem de tecnologias assistivas como leitores de tela.
- **Ação Necessária:**
  1.  **HTML Semântico:** Revisar todo o JSX para garantir o uso correto de tags como `<main>`, `<nav>`, `<header>`, `<section>`, e `<button>`.
  2.  **Atributos ARIA:** Adicionar `aria-label`, `aria-describedby` e outros atributos ARIA em componentes complexos ou não-nativos para fornecer contexto aos leitores de tela.
  3.  **Navegação por Teclado:** Garantir que todos os elementos interativos sejam focáveis e operáveis via teclado, na ordem lógica.
  4.  **Contraste de Cores:** Auditar as paletas de cores nos temas para garantir que atendam às diretrizes do WCAG.
  5.  **Ferramentas Automatizadas:** Instalar e configurar o plugin `eslint-plugin-jsx-a11y` para capturar problemas de acessibilidade durante o desenvolvimento.

### 7. Implementação de Estados de Carregamento (Loading) Globais e Locais
- **Descrição:** A aplicação precisa de um feedback visual claro para o usuário durante o carregamento de dados, seja na navegação entre páginas ou durante a execução de uma ação assíncrona (Server Action). Isso melhora a percepção de performance e evita interações duplicadas.
- **Ação Necessária:**
  1.  **Loading de Navegação (Página Inteira):**
      - Criar um arquivo `loading.tsx` na raiz do diretório `app/`. O Next.js App Router usará este arquivo como um *Instant Loading State* envolto por um `React.Suspense`.
      - Desenvolver um componente de loading de tela cheia (ex: `components/loading.tsx`, que já existe mas pode ser aprimorado) com uma animação ou skeleton screen que corresponda ao layout principal da aplicação.
  2.  **Loading de Ações (Local):**
      - Utilizar o estado `isLoading` (ou o `useTransition` hook do React) nos componentes que disparam Server Actions (ex: `LoginPage`, `JobCreateForm`).
      - Desabilitar botões de submissão e exibir um ícone de carregamento (spinner) dentro do botão enquanto a ação estiver em andamento para fornecer feedback contextual e prevenir cliques múltiplos.
  3.  **Loading de Componentes (Suspense):**
      - Para componentes que fazem seu próprio fetch de dados, envolvê-los com o componente `<Suspense>` do React e fornecer um componente de fallback (ex: `components/ui/skeleton`) para evitar que o carregamento de uma parte da UI bloqueie a renderização da página inteira.

---

## 🟢 Criticidade Baixa

*Melhorias de qualidade de vida para desenvolvedores (DX), otimizações de performance e novas funcionalidades que agregam valor, mas não são essenciais para o funcionamento principal do produto.*

### 1. Implementação do Storybook para a Biblioteca de Componentes UI
- **Descrição:** O projeto possui uma rica biblioteca de componentes em `/components/ui`. A implementação do Storybook permitiria desenvolver, documentar e testar esses componentes de forma isolada, melhorando a reutilização e a velocidade de desenvolvimento.
- **Ação Necessária:**
  1.  Instalar e configurar o Storybook no projeto.
  2.  Criar "stories" para cada um dos componentes da pasta `/components/ui`.
  3.  Integrar o Storybook ao fluxo de trabalho de desenvolvimento da equipe.

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
