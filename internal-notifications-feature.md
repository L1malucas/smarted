# Funcionalidade: Notificações Internas

## Descrição

Esta funcionalidade implementará um sistema de notificações internas para alertar os usuários sobre eventos importantes dentro da plataforma, como novas candidaturas, atualizações de vagas, atribuições de tarefas, etc. As notificações serão persistentes e acessíveis através da interface do usuário.

## Tarefas e Requisitos

### 1. Modelagem de Dados (Domain Layer)

*   **Descrição:** Criar um modelo para `Notification` que armazene todos os detalhes de uma notificação.
*   **Requisitos:**
    *   `_id`: ObjectId (identificador único)
    *   `recipientId`: String (ID do usuário que deve receber a notificação)
    *   `senderId`: String (ID do usuário ou sistema que enviou a notificação, opcional)
    *   `senderName`: String (Nome do remetente, opcional)
    *   `type`: String (e.g., "job_application", "job_update", "user_assigned", "system_alert")
    *   `message`: String (Conteúdo principal da notificação)
    *   `resourceType`: String (Tipo de recurso relacionado, e.g., "job", "candidate", "user")
    *   `resourceId`: String (ID do recurso relacionado, para navegação direta)
    *   `isRead`: Boolean (Status de leitura da notificação, padrão: `false`)
    *   `createdAt`: Date (Timestamp de criação)
    *   `readAt`: Date (Timestamp de leitura, opcional)
    *   `tenantId`: String (ID do tenant ao qual a notificação pertence)

### 2. Server Actions (Infrastructure Layer)

*   **Descrição:** Implementar as Server Actions para gerenciar o ciclo de vida das notificações.
*   **Requisitos (mínimo de 4 Server Actions):
    1.  **`createNotificationAction(notificationData)`:**
        *   **Descrição:** Cria e salva uma nova notificação no banco de dados.
        *   **Parâmetros:** `notificationData` (objeto contendo `recipientId`, `type`, `message`, `resourceType`, `resourceId`, etc.).
        *   **Retorno:** O objeto `Notification` criado.
        *   **Validação:** `recipientId`, `type` e `message` são obrigatórios. Validar tipos de dados.
        *   **Logging:** Registrar a criação da notificação.
    2.  **`listNotificationsAction(options)`:**
        *   **Descrição:** Lista as notificações para o usuário autenticado, com opções de filtro e paginação.
        *   **Parâmetros:** `options` (objeto com `isRead?`, `type?`, `page?`, `limit?`, `sortBy?`, `sortOrder?`).
        *   **Retorno:** Array de `Notification` (com metadados de paginação).
        *   **Validação:** Apenas o `recipientId` pode listar suas próprias notificações. Admins podem listar notificações de outros usuários (com permissão).
        *   **Logging:** Registrar a listagem de notificações.
    3.  **`markNotificationAsReadAction(notificationId)`:**
        *   **Descrição:** Marca uma ou mais notificações como lidas.
        *   **Parâmetros:** `notificationId` (string ou array de strings).
        *   **Retorno:** Sucesso/Erro.
        *   **Validação:** Apenas o `recipientId` ou um admin pode marcar como lida.
        *   **Logging:** Registrar a atualização do status de leitura.
    4.  **`deleteNotificationAction(notificationId)`:**
        *   **Descrição:** Remove uma ou mais notificações do banco de dados.
        *   **Parâmetros:** `notificationId` (string ou array de strings).
        *   **Retorno:** Sucesso/Erro.
        *   **Validação:** Apenas o `recipientId` ou um admin pode deletar.
        *   **Logging:** Registrar a exclusão da notificação.

### 3. Integração Frontend (App Layer)

*   **Descrição:** Desenvolver componentes de UI para exibir e interagir com as notificações.
*   **Requisitos:**
    *   **Ícone de Notificação (Bell Icon):**
        *   Um ícone de sino na barra de navegação principal que exibe um contador de notificações não lidas.
        *   Ao clicar, exibe um popover ou dropdown com as notificações mais recentes.
        *   Integrar com `listNotificationsAction` (filtrando por `isRead: false`).
    *   **Página de Notificações:**
        *   Uma página dedicada (`/dashboard/notifications` ou similar) que lista todas as notificações do usuário.
        *   Opções para filtrar (lidas/não lidas, por tipo) e paginar.
        *   Botões para marcar como lida (individualmente ou em massa) e excluir.
        *   Integrar com `listNotificationsAction`, `markNotificationAsReadAction` e `deleteNotificationAction`.
    *   **Componente de Notificação Individual:**
        *   Exibir o tipo, mensagem, remetente e data da notificação.
        *   Um link ou botão que direcione o usuário para o `resourceId` relacionado (e.g., para a página da vaga, perfil do candidato).
        *   Feedback visual para notificações lidas/não lidas.
    *   **Integração com Eventos do Sistema:**
        *   Identificar os principais eventos do sistema que devem gerar notificações (e.g., nova candidatura, mudança de status de vaga, atribuição de usuário).
        *   Chamar `createNotificationAction` nos pontos apropriados do backend (dentro de outras Server Actions ou serviços) para gerar as notificações.

### 4. Considerações de Segurança e Performance

*   **Autorização:** Garantir que um usuário só possa acessar, marcar como lida ou deletar suas próprias notificações, a menos que seja um admin com permissões específicas.
*   **Indexação:** Criar índices apropriados nas coleções de notificações para `recipientId`, `isRead`, `createdAt` para otimizar as consultas.
*   **Limpeza de Dados:** Considerar uma estratégia para arquivar ou remover notificações muito antigas para manter o banco de dados otimizado.
    *   **Exclusão Automática:** Implementar um processo em segundo plano (job agendado) que periodicamente:
        *   **Descrição da Implementação:** Será desenvolvido um script ou uma função de servidor (Serverless Function ou Cron Job) que será executada em intervalos regulares (e.g., diariamente, semanalmente). Este script consultará a coleção de notificações, identificará documentos que atendem aos critérios de exclusão (ex: `createdAt` anterior a X dias E `isRead: true`, ou `createdAt` anterior a Y dias independentemente do status de leitura) e os removerá do banco de dados.
        *   Exclua notificações que excederam o período de retenção E foram marcadas como lidas.
        *   Exclua notificações muito antigas, independentemente do status de leitura (para evitar acúmulo excessivo).
    *   **TTL (Time-To-Live) no Banco de Dados:** Se estiver usando MongoDB, pode-se usar índices TTL em campos de data (ex: `createdAt` ou `readAt`) para que o banco de dados exclua automaticamente os documentos após um período definido.
        *   **Descrição da Implementação:** Será criado um índice TTL na coleção de notificações no campo `createdAt` (ou `readAt`, dependendo da política de retenção). Este índice terá um `expireAfterSeconds` configurado para o período desejado (ex: 30 dias). O MongoDB se encarregará automaticamente de remover os documentos expirados, sem a necessidade de lógica de aplicação adicional para a exclusão.
*   **Tempo Real (Opcional):** Para uma experiência mais avançada, considerar a integração com WebSockets ou Server-Sent Events para notificações em tempo real, embora isso adicione complexidade.

### 5. Testes

*   **Descrição:** Escrever testes unitários e de integração para as Server Actions e componentes de UI.
*   **Requisitos:**
    *   Testar a criação de notificações e a persistência no banco de dados.
    *   Testar a listagem de notificações com diferentes filtros e paginação.
    *   Testar a marcação de notificações como lidas e a exclusão.
    *   Testar cenários de autorização (usuário tentando acessar notificações de outro).
