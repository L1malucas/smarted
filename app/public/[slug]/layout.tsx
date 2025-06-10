import type React from "react"

/**
 * Layout padrão para páginas públicas do tenant (inquilino)
 * 
 * @component PublicTenantLayout
 * @description Este componente provê o layout base para todas as páginas públicas específicas de um tenant.
 * Inclui um cabeçalho com branding e uma área principal para conteúdo.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo filho a ser renderizado dentro do layout
 * @param {Object} props.params - Parâmetros da rota
 * @param {string} props.params.slug - Identificador único do tenant na URL
 * 
 * @layout
 * O layout é composto por:
 * - Um container principal com gradiente de fundo
 * - Header com:
 *   - Logo (iniciais "ST")
 *   - Título "Portal de Vagas"
 *   - Subtítulo informativo
 *   - Marca "SMARTED TECH"
 * - Área principal (main) que recebe o conteúdo filho
 * 
 * @styling
 * - Usa Tailwind CSS para estilização
 * - Responsivo com breakpoints sm, lg
 * - Sistema de cores usando tons de azul e índigo
 * 
 * @usage
 * Este layout deve ser usado como wrapper para todas as páginas públicas específicas de um tenant.
 * O slug do tenant é passado automaticamente pelo sistema de roteamento do Next.js.
 * 
 * @extends {React.Component}
 * @example
 * // Em uma página pública do tenant:
 * export default function TenantPage() {
 *   return (
 *     <PublicTenantLayout>
 *       <div>Conteúdo da página</div>
 *     </PublicTenantLayout>
 *   )
 * }
 */
export default function PublicTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal de Vagas</h1>
                <p className="text-sm text-gray-500">Encontre sua próxima oportunidade</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-blue-600">SMARTED TECH</span>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
