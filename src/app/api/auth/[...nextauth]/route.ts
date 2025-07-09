// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUsersCollection } from "@/infrastructure/persistence/db";
import { IUser } from "@/domain/models/User";
import { IUserPayload } from "@/shared/types/types/auth"; // Certifique-se de que IUserPayload está atualizado

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const usersCollection = await getUsersCollection();
        const user = await usersCollection.findOne({ email: profile?.email }) as IUser;

        if (user) {
          // Usuário pré-aprovado encontrado no banco de dados
          return true;
        } else {
          // Usuário não encontrado, negar login
          console.warn(`Tentativa de login com e-mail não autorizado: ${profile?.email}`);
          return false; // Nega o login
        }
      }
      return false; // Nega login para outros provedores ou casos não tratados
    },
    async jwt({ token, user }) {
      // 'user' aqui é o objeto retornado pelo 'signIn' (se for true)
      // ou o objeto do provedor (se não houver 'signIn' customizado)
      if (user) {
        const usersCollection = await getUsersCollection();
        const dbUser = await usersCollection.findOne({ email: user.email }) as IUser;

        if (dbUser) {
          // Popula o token com os dados completos do nosso usuário
          const userPayload: IUserPayload = {
            userId: dbUser._id.toHexString(),
            cpf: dbUser.cpf,
            email: dbUser.email,
            name: dbUser.name,
            roles: dbUser.roles,
            permissions: dbUser.permissions,
            isAdmin: dbUser.isAdmin,
            tenantId: dbUser.tenantId,
            tenantName: dbUser.tenantName,
            slug: dbUser.slug, // Adicionar slug aqui
          };
          token.user = userPayload;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expõe os dados do usuário para o cliente
      session.user = token.user as IUserPayload;
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redireciona para sua página de login customizada
    error: "/login", // Redireciona para a página de login em caso de erro
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
