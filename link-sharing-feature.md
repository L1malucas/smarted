# Funcionalidade: Compartilhamento de Links

## Descrição

Esta funcionalidade permitirá aos usuários gerar links únicos e compartilháveis para recursos específicos do sistema (vagas, relatórios de candidatos, dashboards). Os links poderão ter configurações de expiração e proteção por senha, garantindo flexibilidade e segurança no compartilhamento de informações.

## Tarefas e Requisitos

### 1. Modelagem de Dados (Domain Layer)

*   **Descrição:** Criar um modelo para `ShareableLink` que armazene informações sobre o link, o recurso associado, configurações de segurança e metadados.
*   **Requisitos:**
    *   `_id`: ObjectId (identificador único)
    *   `resourceType`: String (e.g., "job", "candidate_report", "dashboard")
    *   `resourceId`: String (ID do recurso compartilhado)
    *   `resourceName`: String (Nome/título do recurso para exibição, e.g., título da vaga, nome do candidato)
    *   `hash`: String (hash único para o link, gerado aleatoriamente)
    *   `tenantId`: String (ID do tenant ao qual o link pertence)
    *   `expiresAt`: Date (opcional, data de expiração do link)
    *   `maxViews`: Number (opcional, número máximo de visualizações, 0 para ilimitado)
    *   `passwordHash`: String (opcional, hash da senha para links protegidos)
    *   `createdBy`: String (ID do usuário que criou o link)
    *   `createdByUserName`: String (Nome do usuário que criou o link)
    *   `createdAt`: Date
    *   `updatedAt`: Date
    *   `lastAccessedAt`: Date (opcional, última vez que o link foi acessado)
    *   `viewsCount`: Number (contador de visualizações)
    *   `isActive`: Boolean (para ativar/desativar o link)

### 2. Server Actions (Infrastructure Layer)

*   **Descrição:** Implementar as Server Actions para gerenciar o ciclo de vida dos links compartilháveis.
*   **Requisitos (mínimo de 8 Server Actions):**
    1.  **`generateShareableLinkAction(resourceType, resourceId, resourceName, options)`:**
        *   **Descrição:** Gera e salva um novo link compartilhável.
        *   **Parâmetros:** `resourceType`, `resourceId`, `resourceName`, `options` (objeto com `expiresAt`, `maxViews`, `password`).
        *   **Retorno:** O objeto `IShareableLink` completo do link gerado.
        *   **Validação:** `resourceType`, `resourceId` e `resourceName` são obrigatórios. Validar formato da data de expiração e senha. Aplicar configurações padrão do sistema (expiração, senha, etc.) se não fornecidas.
        *   **Logging:** Registrar a criação do link.
    2.  **`getShareableLinkDetailsAction(hash, password?)`:**
        *   **Descrição:** Retorna os detalhes de um link compartilhável, incluindo o recurso associado.
        *   **Parâmetros:** `hash`, `password` (opcional, se o link for protegido).
        *   **Retorno:** Objeto `IShareableLink` e o recurso associado (e.g., `IJob`, `ICandidate`, `IDashboardData`).
        *   **Validação:** Verificar se o link existe, não expirou e não excedeu `maxViews`. Se protegido por senha, verificar a senha fornecida. Se a senha estiver incorreta, retornar erro.
        *   **Lógica de Recurso Associado:** Implementar lógica para buscar o recurso real (Job, Candidate, Dashboard) com base em `resourceType` e `resourceId` (e.g., usando um `switch` ou um mapa de funções para diferentes coleções). Lidar com o caso de o recurso não ser encontrado.
        *   **Logging:** Registrar o acesso ao link.
    3.  **`updateShareableLinkAction(hash, updates)`:**
        *   **Descrição:** Atualiza as propriedades de um link existente (e.g., `expiresAt`, `maxViews`, `password`, `isActive`).
        *   **Parâmetros:** `hash`, `updates` (objeto parcial com as propriedades a serem atualizadas).
        *   **Retorno:** Sucesso/Erro.
        *   **Validação:** Apenas o criador ou admin pode atualizar. `resourceType`, `resourceId` e `hash` não devem ser atualizáveis. Se `password` for fornecida, deve ser hashed antes de salvar.
        *   **Logging:** Registrar a atualização do link.
    4.  **`deactivateShareableLinkAction(hash)`:**
        *   **Descrição:** Desativa um link compartilhável, tornando-o inacessível.
        *   **Parâmetros:** `hash`.
        *   **Retorno:** Sucesso/Erro.
        *   **Validação:** Apenas o criador ou admin pode desativar.
        *   **Logging:** Registrar a desativação do link.
    5.  **`deleteShareableLinkAction(hash)`:**
        *   **Descrição:** Remove permanentemente um link compartilhável do banco de dados.
        *   **Parâmetros:** `hash`.
        *   **Retorno:** Sucesso/Erro.
        *   **Validação:** Apenas o criador ou admin pode deletar.
        *   **Logging:** Registrar a exclusão do link.
    6.  **`listShareableLinksAction(options?)`:**
        *   **Descrição:** Lista todos os links compartilháveis para um tenant, opcionalmente filtrando, paginando e ordenando.
        *   **Parâmetros:** `options` (objeto com `resourceType?`, `resourceId?`, `isActive?`, `page?`, `limit?`, `sortBy?`, `sortOrder?`).
        *   **Retorno:** Array de `IShareableLink` (com metadados de paginação, se aplicável).
        *   **Validação:** Apenas admin/recrutador pode listar.
        *   **Logging:** Registrar a listagem de links.
    7.  **`verifyShareableLinkPasswordAction(hash, password)`:**
        *   **Descrição:** Verifica a senha de um link protegido.
        *   **Parâmetros:** `hash`, `password`.
        *   **Retorno:** `true` se a senha estiver correta, `false` caso contrário.
        *   **Logging:** Registrar tentativas de verificação de senha.
    8.  **`incrementLinkViewCountAction(hash)`:**
        *   **Descrição:** Incrementa o contador de visualizações de um link e atualiza `lastAccessedAt`.
        *   **Parâmetros:** `hash`.
        *   **Retorno:** Sucesso/Erro.
        *   **Observação:** Esta ação pode ser chamada internamente por `getShareableLinkDetailsAction` ou separadamente.

### 3. Integração Frontend (App Layer)

*   **Descrição:** Desenvolver componentes de UI para interagir com as Server Actions de compartilhamento de links.
*   **Requisitos:**
    *   **Componente `ShareDialog`:**
        *   Permitir ao usuário selecionar o tipo de recurso e o ID (e.g., usando dropdowns populados com dados de vagas/candidatos existentes).
        *   Opções para definir data de expiração, número máximo de visualizações e senha.
        *   Exibir o link gerado e permitir copiá-lo.
        *   Integrar com `generateShareableLinkAction`.
    *   **Página de Visualização de Link Compartilhado:**
        *   Uma rota pública (`/share/[hash]`) que utiliza `getShareableLinkDetailsAction`.
        *   Se o link for protegido por senha, exibir um formulário de senha.
        *   Exibir o conteúdo do recurso compartilhado (e.g., detalhes da vaga, relatório). Isso exigirá uma estratégia de renderização dinâmica (e.g., um mapeamento de componentes React baseado no `resourceType` retornado).
        *   Lidar com links expirados, inválidos ou com acesso negado (senha incorreta).
    *   **Gerenciamento de Links (Painel Admin/Recrutador):**
        *   Tabela listando links compartilhados (usando `listShareableLinksAction`), com opções de paginação, filtro e ordenação.
        *   Botões para editar (`updateShareableLinkAction`), desativar (`deactivateShareableLinkAction`) e deletar (`deleteShareableLinkAction`) links.

### 4. Considerações de Segurança

*   **Autenticação/Autorização:** Garantir que apenas usuários autorizados possam gerar, gerenciar e acessar links (exceto links públicos). Implementar verificações de permissão dentro de cada Server Action.
*   **Hashing de Senhas:** Utilizar um algoritmo de hashing seguro (e.g., bcrypt) para armazenar senhas de links.
*   **Validação de Entrada:** Validar todos os inputs do usuário para prevenir ataques (e.g., Zod).

### 5. Testes

*   **Descrição:** Escrever testes unitários e de integração para as Server Actions e componentes de UI.
*   **Requisitos:**
    *   Testar a geração de links com diferentes opções (expiração, visualizações, senha).
    *   Testar o acesso a links válidos, expirados, com limite de visualizações atingido, com senha correta/incorreta.
    *   Testar a atualização e exclusão de links, incluindo validações de permissão.
