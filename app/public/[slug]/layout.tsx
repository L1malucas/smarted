import type React from "react"

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
