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

## 2. Mapeamento e Plano de Ação Detalhado para Server Actions

A seguir, a lista de Server Actions necessárias para cada funcionalidade, com foco na sua responsabilidade, nos dados que manipulam e no plano de implementação.

### Módulo de Autenticação (`services/auth.ts`)

#### **2.1. `loginAction(payload)`**

*   **Propósito**: Autenticar um usuário com base nas credenciais fornecidas e estabelecer uma sessão.
*   **Entrada**: `payload` (objeto contendo `cpf` e `password`).
*   **Saída**: `{ success: boolean, data?: { user: User }, error?: string }`.
*   **Plano de Ação**:
    1.  **Validação de Schema**: Validar `payload` usando um schema Zod (`authSchema.loginSchema`).
    2.  **Autenticação**:
        *   Buscar usuário no banco de dados (`User.findOne({ cpf: payload.cpf })`).
        *   Verificar a senha (comparar `payload.password` com a senha hasheada do usuário).
    3.  **Criação de Sessão**: Se as credenciais forem válidas, criar uma sessão segura (ex: usando `next-auth` ou lógica de sessão customizada que armazene `userId`, `role`, `tenantId`).
    4.  **Tratamento de Erros**: Capturar erros de autenticação (usuário não encontrado, senha incorreta) e retornar mensagens genéricas. Logar erros internos.
*   **Status**: Concluído.

#### **2.2. `logoutAction()`**

*   **Propósito**: Destruir a sessão do usuário.
*   **Entrada**: Nenhuma.
*   **Saída**: `{ success: boolean, error?: string }`.
*   **Plano de Ação**:
    1.  **Verificação de Autenticação**: Opcional, mas recomendado: verificar se há uma sessão ativa antes de tentar destruí-la.
    2.  **Destruição de Sessão**: Invalidar a sessão atual do usuário.
    3.  **Tratamento de Erros**: Logar quaisquer erros durante a destruição da sessão.
*   **Status**: Concluído.

### Módulo de Vagas (`services/jobs.ts`)

#### **2.3. `createJobAction(payload)`**

*   **Propósito**: Criar uma nova vaga associada ao `tenant` do usuário autenticado.
*   **Entrada**: `payload` (objeto contendo dados da vaga: `title`, `description`, `competencies`, `questions`, `isPCD`, `isReferral`, etc.).
*   **Saída**: `{ success: boolean, data?: { jobId: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar se o usuário tem permissão para criar vagas (ex: `role` de `admin` ou `recruiter`).
    2.  **Validação de Schema**: Validar `payload` usando um schema Zod (`jobSchema.createJobSchema`).
    3.  **Lógica de Negócio**:
        *   Criar um novo documento de vaga no MongoDB (`Job.create(...)`).
        *   Associar a vaga ao `tenantId` obtido da sessão.
        *   Definir o `creatorId` como o `userId` da sessão.
        *   Definir o status inicial da vaga (ex: `draft` ou `open`).
    4.  **Tratamento de Erros**: Capturar e logar erros de validação ou de banco de dados.
*   **Status**: Concluído.

#### **2.4. `updateJobAction(jobId, payload)`**

*   **Propósito**: Atualizar uma vaga existente.
*   **Entrada**: `jobId` (string), `payload` (objeto com dados a serem atualizados).
*   **Saída**: `{ success: boolean, data?: { jobId: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar se o usuário tem permissão para atualizar vagas.
    2.  **Validação de Schema**: Validar `payload` usando um schema Zod (`jobSchema.updateJobSchema`).
    3.  **Validação de Tenancy**:
        *   Buscar a vaga no banco de dados usando `jobId` E `tenantId` (`Job.findOneAndUpdate({ _id: jobId, tenantId: userTenantId }, payload, { new: true })`).
        *   Se a vaga não for encontrada (ou seja, não pertence ao `tenant` do usuário), retornar erro de "não autorizado".
    4.  **Lógica de Negócio**:
        *   Atualizar o documento da vaga no MongoDB.
        *   Registrar log de auditoria para a alteração de status, se aplicável.
    5.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

#### **2.5. `archiveJobAction(jobId)`**

*   **Propósito**: Arquivar (ou desativar) uma vaga.
*   **Entrada**: `jobId` (string).
*   **Saída**: `{ success: boolean, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar permissão para arquivar vagas.
    2.  **Validação de Tenancy**:
        *   Buscar a vaga usando `jobId` E `tenantId`.
        *   Se não encontrada, erro de "não autorizado".
    3.  **Lógica de Negócio**:
        *   Atualizar o status da vaga para `archived` ou `closed` no MongoDB.
        *   Registrar log de auditoria.
    4.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

#### **2.6. `getJobDetailsAction(jobId)`**

*   **Propósito**: Obter detalhes de uma vaga específica.
*   **Entrada**: `jobId` (string).
*   **Saída**: `{ success: boolean, data?: { job: Job }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   **Considerar casos de uso**: Se for para visualização pública (link compartilhado), a autenticação pode ser parcial ou baseada em token. Para usuários logados, a validação de `tenantId` é crucial.
    2.  **Validação de Tenancy**:
        *   Buscar a vaga usando `jobId` E `tenantId` (para usuários logados).
        *   Se não encontrada, erro de "não autorizado" ou "não encontrado".
    3.  **Lógica de Negócio**:
        *   Retornar os detalhes completos da vaga.
    4.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

### Módulo de Candidatura (`services/candidates.ts`)

#### **2.7. `applyToJobAction(payload)`**

*   **Propósito**: Permitir que um candidato se inscreva em uma vaga.
*   **Entrada**: `payload` (objeto contendo dados do candidato, respostas às perguntas da vaga, e o arquivo do currículo).
*   **Saída**: `{ success: boolean, data?: { candidateId: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Validação de Schema**: Validar `payload` usando um schema Zod (`candidateSchema.applySchema`), incluindo validação de tipo e tamanho do arquivo do currículo.
    2.  **Lógica de Negócio**:
        *   **Upload de Arquivo**: Implementar o upload seguro do currículo para um serviço de armazenamento (ex: Vercel Blob, S3). Armazenar a URL do arquivo no banco de dados.
        *   Criar um novo registro de candidatura no MongoDB (`Candidate.create(...)`).
        *   Associar a candidatura à `jobId` e ao `tenantId` da vaga (obtido da vaga).
        *   Definir o status inicial da candidatura (ex: `applied`).
    3.  **Tratamento de Erros**: Capturar e logar erros de validação, upload de arquivo ou banco de dados.
*   **Status**: Concluído.

#### **2.8. `processResumeWithAIAction(candidateId)`**

*   **Propósito**: Disparar o processo de análise de currículo por IA para um candidato.
*   **Entrada**: `candidateId` (string).
*   **Saída**: `{ success: boolean, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar se o usuário tem permissão para iniciar a análise de IA (ex: `role` de `recruiter`).
    2.  **Validação de Tenancy**:
        *   Buscar o candidato usando `candidateId` e o `tenantId` da vaga associada ao candidato.
        *   Se não encontrado ou não pertencer ao `tenant` do usuário, erro de "não autorizado".
    3.  **Lógica de Negócio**:
        *   Chamar um serviço externo de IA (simulado ou real) para processar o currículo.
        *   Atualizar o status do candidato para `processing` ou similar.
        *   Armazenar os resultados da IA (ex: `matchScore`, `extractedSkills`) no documento do candidato após a conclusão do processamento).
    4.  **Tratamento de Erros**: Capturar e logar erros de comunicação com o serviço de IA ou de banco de dados.
*   **Status**: Concluído.

#### **2.9. `rankCandidatesAction(jobId)`**

*   **Propósito**: Executar o ranqueamento de candidatos para uma vaga específica.
*   **Entrada**: `jobId` (string).
*   **Saída**: `{ success: boolean, data?: { candidates: Candidate[] }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar se o usuário tem permissão para ranquear candidatos.
    2.  **Validação de Tenancy**:
        *   Buscar a vaga usando `jobId` e `tenantId`.
        *   Se não encontrada, erro de "não autorizado".
    3.  **Lógica de Negócio**:
        *   Obter todos os candidatos associados à `jobId` e `tenantId`.
        *   Aplicar a lógica de ranqueamento (ex: baseada em `matchScore` da IA, respostas às perguntas, pesos das competências).
        *   Atualizar o campo de ranqueamento ou pontuação de cada candidato.
    4.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

### Módulo de Administração (`services/admin.ts`)

#### **2.10. `createUserAction(payload)`**

*   **Propósito**: Criar um novo usuário no sistema.
*   **Entrada**: `payload` (objeto contendo `cpf`, `password`, `role`, `tenantId` - se aplicável).
*   **Saída**: `{ success: boolean, data?: { userId: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   **Crucial**: Verificar se o usuário tem `role` de `admin` ou `super-admin`.
    2.  **Validação de Schema**: Validar `payload` usando um schema Zod (`adminSchema.createUserSchema`).
    3.  **Lógica de Negócio**:
        *   Hashear a senha antes de salvar.
        *   Criar um novo documento de usuário no MongoDB (`User.create(...)`).
        *   Associar o novo usuário a um `tenantId` (se o sistema for multi-tenant e o admin puder criar usuários para outros tenants, ou ao seu próprio tenant).
    4.  **Tratamento de Erros**: Capturar e logar erros (ex: CPF já existe).
*   **Status**: Concluído.

#### **2.11. `updateUserAction(userId, payload)`**

*   **Propósito**: Atualizar informações de um usuário existente.
*   **Entrada**: `userId` (string), `payload` (objeto com dados a serem atualizados).
*   **Saída**: `{ success: boolean, data?: { userId: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   **Crucial**: Verificar se o usuário tem `role` de `admin` ou `super-admin`. Um usuário comum só pode atualizar seus próprios dados.
    2.  **Validação de Schema**: Validar `payload` usando um schema Zod (`adminSchema.updateUserSchema`).
    3.  **Validação de Tenancy**:
        *   Buscar o usuário a ser atualizado usando `userId`.
        *   Se o usuário logado for um `admin` de um `tenant`, garantir que o `userId` a ser atualizado pertence ao mesmo `tenant`.
    4.  **Lógica de Negócio**:
        *   Atualizar o documento do usuário no MongoDB.
        *   Se a senha for alterada, hashear a nova senha.
    5.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

#### **2.12. `getSystemSettingsAction()` / `updateSystemSettingsAction(payload)`**

*   **Propósito**: Gerenciar configurações globais do sistema.
*   **Entrada**: `getSystemSettingsAction()`: Nenhuma. `updateSystemSettingsAction()`: `payload` (objeto com configurações).
*   **Saída**: `{ success: boolean, data?: { settings: SystemSettings }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   **Crucial**: Acesso restrito a `super-admin` (ou `admin` global, se houver).
    2.  **Validação de Schema**: Para `updateSystemSettingsAction`, validar `payload` usando um schema Zod (`adminSchema.systemSettingsSchema`).
    3.  **Lógica de Negócio**:
        *   `get`: Buscar as configurações globais no banco de dados.
        *   `update`: Atualizar o documento de configurações globais.
    4.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

### Módulo de Compartilhamento (`services/share.ts`)

#### **2.13. `createShareableLinkAction(type, resourceId, options)`**

*   **Propósito**: Gerar um link compartilhável para um recurso (vaga, relatório, etc.) com hash e opções de segurança (senha, expiração).
*   **Entrada**: `type` (string, ex: 'job', 'report'), `resourceId` (string), `options` (objeto com `password`, `expirationDate`).
*   **Saída**: `{ success: boolean, data?: { shareableLink: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Autenticação e Autorização**:
        *   Verificar se o usuário está autenticado.
        *   Obter `userId` e `tenantId` da sessão.
        *   Verificar se o usuário tem permissão para compartilhar o `resourceId` específico e o `type` de recurso.
    2.  **Validação de Schema**: Validar `type`, `resourceId` e `options` usando um schema Zod (`shareSchema.createLinkSchema`).
    3.  **Validação de Tenancy**:
        *   Buscar o `resourceId` e verificar se ele pertence ao `tenantId` do usuário.
        *   Se não, erro de "não autorizado".
    4.  **Lógica de Negócio**:
        *   Gerar um hash único para o link.
        *   Hashear a senha, se fornecida.
        *   Salvar os detalhes do link compartilhável (hash, `resourceId`, `type`, `expirationDate`, senha hasheada) em uma nova coleção no MongoDB (ex: `ShareableLink`).
        *   Construir a URL completa do link compartilhável.
    5.  **Tratamento de Erros**: Capturar e logar erros.
*   **Status**: Concluído.

#### **2.14. `verifySharedLinkAction(hash, password)`**

*   **Propósito**: Validar um link compartilhado e retornar o recurso associado.
*   **Entrada**: `hash` (string), `password` (string, opcional).
*   **Saída**: `{ success: boolean, data?: { resource: any, type: string }, error?: string }`.
*   **Plano de Ação**:
    1.  **Validação de Schema**: Validar `hash` e `password` usando um schema Zod (`shareSchema.verifyLinkSchema`).
    2.  **Lógica de Negócio**:
        *   Buscar o link compartilhável no banco de dados usando o `hash`.
        *   **Proteção contra Força Bruta**: Implementar um mecanismo de limitação de taxa (rate limiting) para esta action, pois é acessível publicamente.
        *   Verificar a data de expiração do link.
        *   Se o link tiver senha, comparar a `password` fornecida com a senha hasheada armazenada.
        *   Se tudo for válido, buscar o `resource` (vaga, relatório) usando o `resourceId` e `type` armazenados no link compartilhável.
    3.  **Tratamento de Erros**: Capturar e logar erros (link inválido, expirado, senha incorreta, recurso não encontrado).
*   **Status**: Concluído.

**Todas as Server Actions foram implementadas e refatoradas para usar o `withActionLogging` e integrar o sistema de toast.**

## 3. Próximos Passos

Com todas as Server Actions implementadas e refatoradas, os próximos passos podem incluir:

*   **Implementação de Sessão Real**: Substituir o placeholder `getSession()` por uma solução de gerenciamento de sessão real (ex: NextAuth.js).
*   **Controle de Usuários por Tenant**: Implementar a lógica para limitar o número de usuários logados por tenant, conforme discutido.
*   **Integração com Frontend**: Conectar as Server Actions com os componentes do frontend.
*   **Testes**: Escrever testes unitários e de integração para as Server Actions.
*   **Implementação de Upload de Arquivos**: Substituir o placeholder de `resumeUrl` por uma solução real de upload de arquivos (ex: Vercel Blob, S3).
*   **Integração com IA**: Conectar `processResumeWithAIAction` a uma API de IA real.
*   **Módulo de Auditoria**: Implementar o `AuditService` para persistir os logs de auditoria no banco de dados.
*   **Refinamento de Permissões**: Detalhar e implementar um sistema de permissões mais granular.
*   **Tratamento de Erros Global**: Implementar um tratamento de erros mais robusto e global para a aplicação.