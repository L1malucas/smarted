/**
 * @description Página de login do sistema de recrutamento IA.
 * Gerencia autenticação via CPF e redirecionamento baseado em tenant_slug.
 * 
 * @component LoginPage
 * 
 * @hooks
 * - useState - Gerencia estados do CPF e loading
 * - useRouter - Navegação entre rotas
 * - useSearchParams - Acessa parâmetros da URL
 * 
 * @dependencies
 * - authService - Serviço responsável pela autenticação
 * - Card, CardHeader, CardTitle, etc - Componentes UI do shadcn/ui
 * - Building2 - Ícone do lucide-react
 * 
 * @params
 * - tenant_slug (URL) - Identificador único do tenant
 * - next (URL) - Caminho para redirecionamento após login
 * 
 * @flows
 * 1. Usuário insere CPF com formatação automática
 * 2. Submit do formulário chama authService.login
 * 3. Redirecionamento baseado em:
 *    - Se existe tenant_slug e next: redireciona para next
 *    - Se existe apenas tenant_slug: redireciona para dashboard do tenant
 *    - Caso contrário: redireciona para dashboard padrão
 * 
 * @modifications
 * Para modificar o comportamento do login:
 * - Alterar formatCPF() para mudar validação/formatação do CPF
 * - Modificar handleLogin() para alterar lógica de autenticação
 * - Ajustar rotas de redirecionamento em handleLogin()
 * - Customizar UI alterando componentes do Card
 * 
 * @error
 * Erros de login são logados no console, mas interface permanece funcional
 * 
 * @see
 * - authService.login()
 * - CandidateButton - Componente relacionado para acesso de candidatos
 */

import { Suspense } from "react"
import CustomLoading from "@/components/loading"
import LoginPage from "./LoginPage"

export default function Login() {
  return (
    <Suspense fallback={<CustomLoading />}>
      <LoginPage />
    </Suspense>
  )
}