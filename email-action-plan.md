# Plano de Ação: Implementação de Ação de Envio de E-mail

## 1. Objetivo

Implementar uma nova "action" para envio de e-mails no projeto Smarted, com as seguintes capacidades:
- **Encapsulamento:** A função de envio de e-mail será uma unidade coesa, com lógica interna para formatação padrão.
- **Templates Padrão:** O corpo do e-mail incluirá um cabeçalho e rodapé padrão, permitindo que o usuário forneça apenas o conteúdo central.
- Suporte a envio de e-mails com anexos.
- Personalização do corpo da mensagem utilizando dados do tenant.
- Reutilização em diversas partes do sistema (ex: confirmação de inscrição, avanço de vaga).
- **Conformidade com Padrões:** Seguir os padrões de interface (`I...`) e incluir logs, assim como as outras actions do projeto.

## 2. Análise do Projeto (Revisão)

- **Localização de Actions:** A pasta `src/infrastructure/actions/` é o local padrão para novas actions.
- **Serviço de E-mail Existente:** Verificado o `package.json`, não há bibliotecas de envio de e-mails configuradas.
- **Acesso a Dados do Tenant:** O `tenantSlug` é amplamente utilizado, indicando que o acesso aos dados do tenant é viável.
- **Personalização e Anexos:** A action precisará de parâmetros flexíveis para o corpo do e-mail (string, possivelmente HTML) e para os anexos (array de objetos de arquivo).
- **Encapsulamento e Padrões:** A action será projetada para ser encapsulada, com templates internos para cabeçalho/rodapé e integração com o sistema de logs existente.

## 3. Ferramentas e Tecnologias

- **Nodemailer:** Biblioteca para envio de e-mails em Node.js. Será instalada como nova dependência.
- **TypeScript:** Para tipagem e segurança de código.

## 4. Plano de Ação Detalhado

### 4.1. Instalação de Dependências

- **Ação:** Instalar `nodemailer` e seus tipos (`@types/nodemailer`).
- **Comando:** `yarn add nodemailer @types/nodemailer`

### 4.2. Definição da Interface de Entrada (`IEmailPayload`)

- **Ação:** Criar a interface `IEmailPayload` em `src/shared/types/types/email-types.ts` (ou similar, se houver uma pasta mais específica para interfaces de payload).
- **Estrutura Proposta para `IEmailPayload`:**
    ```typescript
    interface IEmailPayload {
      to: string | string[];
      subject: string;
      bodyContent: string; // Conteúdo central do e-mail, sem cabeçalho/rodapé
      tenantData: { // Dados do tenant para personalização do template
        companyName: string;
        logoUrl?: string; // Opcional, se houver logo do tenant
        // Outros dados relevantes do tenant
      };
      attachments?: Array<{ // Opcional: array de anexos
        filename: string;
        content: Buffer | string; // Conteúdo do arquivo (Buffer para binário, string para texto)
        contentType: string; // Tipo MIME do arquivo (ex: 'application/pdf')
      }>;
    }
    ```

### 4.3. Criação do Arquivo da Action

- **Ação:** Criar o arquivo `src/infrastructure/actions/email-actions.ts`.

### 4.4. Implementação da Lógica de Envio de E-mail (`sendEmailAction`)

- **Ação:** Configurar o transportador do Nodemailer e implementar a função de envio.
- **Detalhes:**
    - **Encapsulamento:** A função `sendEmailAction` receberá um objeto do tipo `IEmailPayload`.
    - **Template Padrão:** Internamente, a action construirá o HTML final do e-mail, envolvendo `bodyContent` com um cabeçalho e rodapé padrão. Este template pode usar os `tenantData` para personalização (ex: logo da empresa, nome da empresa no rodapé).
    - **Variáveis de Ambiente:** Utilizar variáveis de ambiente para as credenciais do SMTP (host, port, user, pass) e o endereço de e-mail do remetente (`EMAIL_FROM`).
    - **Logging:** Integrar o sistema de logs do projeto (`src/infrastructure/logging/audit.ts` ou similar) para registrar o sucesso ou falha do envio de e-mails, incluindo detalhes relevantes (ex: destinatário, assunto, erro).
    - Montar o objeto `mailOptions` com `from`, `to`, `subject`, `html` e `attachments`.
    - Chamar `transporter.sendMail(mailOptions)`.
    - Tratar sucesso e erro do envio, retornando um objeto de resultado padronizado (ex: `{ success: boolean, message?: string, error?: string }`).

### 4.5. Configuração de Variáveis de Ambiente

- **Ação:** Orientar sobre a necessidade de configurar as seguintes variáveis de ambiente no arquivo `.env` (ou similar):
    - `EMAIL_HOST`
    - `EMAIL_PORT`
    - `EMAIL_USER`
    - `EMAIL_PASS`
    - `EMAIL_FROM` (endereço de e-mail do remetente)

### 4.6. Teste e Verificação

- **Ação:** Após a implementação, sugerir um teste manual ou a criação de um teste unitário simples para validar o envio de e-mails.

## 5. Próximos Passos (Após a Criação deste MD)

1.  **Confirmação do Usuário:** Aguardar a confirmação do usuário para prosseguir com a instalação do Nodemailer.
2.  **Execução:** Seguir os passos do plano de ação, começando pela instalação das dependências.