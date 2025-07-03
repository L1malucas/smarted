import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
      },
      async authorize(credentials, req) {
        await dbConnect();

        const user = await User.findOne({ cpf: credentials?.cpf });

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            tenantId: user.tenantId,
            roles: user.roles,
            isAdmin: user.isAdmin,
          };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.cpf = user.cpf;
        token.tenantId = user.tenantId;
        token.roles = user.roles;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.cpf = token.cpf;
        session.user.tenantId = token.tenantId;
        session.user.roles = token.roles;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
