import type { User } from "@/types"

export const authService = {
  login: async (cpf: string): Promise<User> => {
    await new Promise((resolve, reject) => setTimeout(() => {
      if (cpf === "123.456.789-00") {
        resolve({
          _id: "1",
          cpf,
          slug: "joao-silva-abc123",
          name: "João Silva",
          email: "joao.silva@empresa.com",
          roles: ["recruiter"],
          permissions: ["read:jobs", "write:jobs", "read:candidates"],
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        reject(new Error("CPF inválido"));
      }
    }, 1000));
    return {} as User; // Should not be reached
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  getCurrentUser: async (): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return null; // No user by default
  },
}
