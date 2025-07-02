# Plano de Arquitetura para Server Actions

Este documento detalha a arquitetura, os princípios de segurança e o mapeamento completo das Server Actions para o projeto SmartED. Ele serve como um guia técnico para a implementação da lógica de negócio do lado do servidor.

---

## 1. Princípios Fundamentais de Segurança

Toda Server Action deve, obrigatoriamente, seguir estes princípios de segurança. A violação de qualquer um deles representa uma falha crítica na arquitetura.

1.  **Autenticação e Autorização:**
    -   Toda action deve, como primeiro passo, verificar se o usuário está autenticado e se possui a sessão válida.
    -   Deve-se extrair o `userId` e as `permissions` (ou `role`) diretamente da sessão, nunca confiar em dados enviados pelo cliente.

2.  **Validação de Schema com Zod:**
    -   Toda action que recebe dados do cliente (`payload`) deve validar esses dados contra um schema Zod centralizado (localizado em `/lib/schemas`).
    -   Isso previne ataques de injeção de dados e garante a integridade dos dados antes de chegarem ao banco.

3.  **Validação de Tenancy (Multi-Tenant):**
    -   Esta é a regra mais importante para este projeto. Toda action que manipula um recurso (vaga, candidato, etc.) deve verificar se o usuário autenticado pertence ao `tenant` (empresa) daquele recurso.
    -   **Exemplo:** Ao editar uma vaga (`updateJobAction`), a lógica deve ser: `SELECT * FROM jobs WHERE id = jobId AND tenantId = user.tenantId`. Se a consulta não retornar nada, a ação deve falhar com um erro de "não autorizado".

4.  **Tratamento de Erros e Retorno Padronizado:**
    -   As actions não devem vazar erros internos do banco de dados ou da aplicação para o cliente. Erros devem ser capturados, logados (usando o wrapper do backlog) e uma mensagem genérica deve ser retornada.
    -   O retorno deve ser sempre um objeto padronizado: `{ success: boolean, data?: any, error?: string }`.

---

## 2. Mapeamento de Server Actions por Módulo

A seguir, a lista de Server Actions necessárias para cada funcionalidade, com foco na sua responsabilidade e nos dados que manipulam.

### Módulo de Autenticação (`services/auth.ts`)
-   **`loginAction(payload)`**: Valida credenciais, cria sessão.
-   **`logoutAction()`**: Destrói a sessão.

### Módulo de Vagas (`services/jobs.ts`)
-   **`createJobAction(payload)`**: Cria uma nova vaga associada ao tenant do usuário logado.
-   **`updateJobAction(jobId, payload)`**: Atualiza uma vaga após verificar se o usuário tem permissão sobre ela.
-   **`archiveJobAction(jobId)`**: Arquiva uma vaga, verificando a permissão.
-   **`getJobDetailsAction(jobId)`**: Busca detalhes de uma vaga (pode ter lógica de permissão diferente para recrutadores e candidatos).

### Módulo de Candidatura (`services/candidates.ts`)
-   **`applyToJobAction(payload)`**: Cria um registro de candidatura. Lida com o upload seguro de arquivos (ex: para Vercel Blob ou S3), validando tipo e tamanho do arquivo no servidor.
-   **`processResumeWithAIAction(candidateId)`**: Dispara um processo de análise de currículo. Deve ser uma ação segura que só pode ser iniciada por um recrutador autorizado.
-   **`rankCandidatesAction(jobId)`**: Executa o ranqueamento. Acesso restrito a recrutadores do tenant.

### Módulo de Administração (`services/admin.ts`)
-   **`createUserAction(payload)`**: Cria um novo usuário. Acesso restrito a administradores.
-   **`updateUserAction(userId, payload)`**: Atualiza um usuário. Acesso restrito a administradores.
-   **`getSystemSettingsAction()` / `updateSystemSettingsAction(payload)`**: Gerencia configurações globais. Acesso restrito a super administradores.

### Módulo de Compartilhamento (`services/share.ts` - *a ser criado*)
-   **`createShareableLinkAction(type, resourceId, options)`**: Gera um link compartilhável com hash e senha (opcional). Verifica se o usuário tem permissão para compartilhar o recurso.
-   **`verifySharedLinkAction(hash, password)`**: Valida um link compartilhado. Esta é uma das poucas actions que pode ser parcialmente pública, mas deve ser protegida contra ataques de força bruta.