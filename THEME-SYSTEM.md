# Sistema de Temas - Guia de Implementação

## Visão Geral

O sistema de temas permite aos usuários personalizar a aparência da aplicação escolhendo entre três temas distintos e três modos de cor. O sistema é baseado em CSS variables e React Context para gerenciamento de estado.

## Temas Disponíveis

### 1. **Soft Elegant** (`brutalism`)
- **Estilo**: Elegante e minimalista
- **Cores**: Tons suaves com roxo/violeta como cor primária
- **Fonte**: DM Sans, Inter
- **Uso**: Ideal para ambientes profissionais que valorizam elegância

### 2. **Friendly Humanist** (`friendly`)
- **Estilo**: Caloroso e acolhedor
- **Cores**: Tons verdes e amarelos naturais
- **Fonte**: Nunito, Work Sans
- **Uso**: Perfeito para criar uma atmosfera mais humana e acessível

### 3. **Neo Brutalism** (`neo-clean`)
- **Estilo**: Ousado e impactante
- **Cores**: Contrastes fortes (preto, vermelho, azul)
- **Fonte**: Bebas Neue, IBM Plex Mono
- **Uso**: Para destacar-se com um visual moderno e impactante

## Modos de Cor

- **Claro**: Interface com fundo claro
- **Escuro**: Interface com fundo escuro  
- **Sistema**: Segue a preferência do sistema operacional

## Arquitetura

### Estrutura de Arquivos

\`\`\`
├── contexts/
│   └── theme-context.tsx          # Contexto principal de tema
├── components/
│   ├── theme-selector.tsx         # Componente seletor de tema
│   └── login-theme-selector.tsx   # Seletor específico para login
├── styles/
│   └── themes/
│       ├── brutalism.css          # Tema Soft Elegant
│       ├── friendly.css           # Tema Friendly Humanist  
│       └── neo-clean.css          # Tema Neo Brutalism
└── hooks/
    └── use-theme.tsx              # Hook personalizado (opcional)
\`\`\`

### Componentes Principais

#### 1. ThemeContext (`contexts/theme-context.tsx`)
- Gerencia o estado global do tema
- Persiste preferências no localStorage
- Aplica temas dinamicamente ao documento
- Escuta mudanças na preferência do sistema

#### 2. ThemeSelector (`components/theme-selector.tsx`)
- Interface para seleção de tema e modo de cor
- Dropdown com opções visuais
- Adaptável para diferentes contextos (navbar, mobile, etc.)

#### 3. Arquivos CSS (`styles/themes/*.css`)
- Definem variáveis CSS para cada tema
- Incluem variantes para modo claro e escuro
- Mantêm compatibilidade com shadcn/ui

## Como Funciona

### 1. Inicialização
\`\`\`tsx
// app/layout.tsx
<CustomThemeProvider>
  {children}
</CustomThemeProvider>
\`\`\`

### 2. Aplicação de Tema
- O tema é aplicado via classes CSS no `<html>`
- Classes: `theme-brutalism`, `theme-friendly`, `theme-neo-clean`
- Modo escuro: classe `dark`

### 3. Persistência
- Tema salvo em: `localStorage.getItem('recruitment-app-theme')`
- Modo de cor salvo em: `localStorage.getItem('recruitment-app-color-mode')`

### 4. CSS Variables
Cada tema define suas próprias variáveis:
\`\`\`css
:root {
  --background: 300 20% 98%;
  --foreground: 240 10% 10%;
  --primary: 267 77% 65%;
  /* ... outras variáveis */
}
\`\`\`

## Implementação Passo a Passo

### Passo 1: Adicionar os Arquivos CSS
1. Criar pasta `styles/themes/`
2. Adicionar os três arquivos CSS dos temas
3. Cada arquivo define variáveis para modo claro e escuro

### Passo 2: Criar o Contexto de Tema
\`\`\`tsx
// contexts/theme-context.tsx
export function ThemeProvider({ children }) {
  // Lógica de gerenciamento de tema
}

export function useTheme() {
  // Hook para acessar contexto
}
\`\`\`

### Passo 3: Criar Componente Seletor
\`\`\`tsx
// components/theme-selector.tsx
export function ThemeSelector({ variant, size }) {
  const { theme, setTheme } = useTheme()
  // Interface de seleção
}
\`\`\`

### Passo 4: Integrar nos Layouts
\`\`\`tsx
// Envolver layouts com ThemeProvider
<CustomThemeProvider>
  <YourApp />
</CustomThemeProvider>
\`\`\`

### Passo 5: Adicionar Seletores
- Navbar: Para usuários autenticados
- Login: Para visitantes
- Páginas públicas: Para candidatos

## Customização

### Adicionar Novo Tema
1. Criar arquivo CSS em `styles/themes/novo-tema.css`
2. Definir todas as variáveis CSS necessárias
3. Adicionar ao array `availableThemes` no contexto
4. Tema será automaticamente disponível

### Modificar Tema Existente
1. Editar arquivo CSS correspondente
2. Ajustar variáveis conforme necessário
3. Mudanças são aplicadas automaticamente

### Adicionar Nova Variável CSS
1. Definir em todos os arquivos de tema
2. Usar em componentes via `bg-background`, `text-foreground`, etc.
3. Seguir convenções do Tailwind CSS

## Benefícios

### Para Usuários
- **Personalização**: Escolha visual que reflete preferências
- **Acessibilidade**: Modo escuro para melhor experiência
- **Consistência**: Tema aplicado em toda a aplicação

### Para Desenvolvedores
- **Manutenibilidade**: Sistema centralizado de temas
- **Escalabilidade**: Fácil adição de novos temas
- **Performance**: CSS variables são eficientes
- **Compatibilidade**: Funciona com shadcn/ui

## Considerações Técnicas

### Performance
- CSS é carregado dinamicamente via `import()`
- Variáveis CSS são mais performáticas que JavaScript
- LocalStorage evita re-renders desnecessários

### Acessibilidade
- Respeita preferência `prefers-color-scheme`
- Mantém contraste adequado em todos os temas
- Suporte a tecnologias assistivas

### Compatibilidade
- Funciona em todos os browsers modernos
- Graceful degradation para browsers antigos
- SSR-friendly com hydration adequada

## Troubleshooting

### Tema não aplica
- Verificar se ThemeProvider está envolvendo a aplicação
- Confirmar se arquivo CSS está sendo importado
- Checar console para erros de importação

### Persistência não funciona
- Verificar se localStorage está disponível
- Confirmar se keys estão corretas
- Testar em modo incógnito

### Styles conflitantes
- Verificar ordem de importação dos CSS
- Confirmar especificidade das regras
- Usar !important apenas quando necessário

## Próximos Passos

1. **Temas Adicionais**: Implementar mais variações visuais
2. **Tema Builder**: Interface para criar temas customizados
3. **Exportar/Importar**: Permitir compartilhamento de temas
4. **A/B Testing**: Testar preferências de usuários
5. **Analytics**: Monitorar uso de cada tema
