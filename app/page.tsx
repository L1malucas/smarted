
import { redirect } from "next/navigation"

/**
 * Página inicial da aplicação que redireciona automaticamente para a rota de login.
 * 
 * @remarks
 * Esta é uma página assíncrona do Next.js que serve como ponto de entrada da aplicação.
 * Quando acessada, redireciona imediatamente o usuário para a rota "/login".
 * 
 * @returns {void} Não retorna nada explicitamente devido ao redirecionamento
 * 
 * @example
 * Este componente é automaticamente renderizado quando o usuário acessa a rota raiz "/"
 * 
 * @public
 * @async
 * 
 * @see {@link /login} - Página de login para onde o usuário é redirecionado
 * 
 * @modificação
 * Para modificar o comportamento:
 * - Altere a rota no parâmetro do redirect() para redirecionar para uma página diferente
 * - Remova o redirect() e adicione conteúdo JSX para criar uma página inicial
 */
export default async function HomePage() {

  redirect("/login")
}
