import type { User } from "@/types"

export const authService = {
  login: async (cpf: string): Promise<User> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful login
    return {
      _id: "1",
      cpf,
      slug: "joao-silva-abc123",
      name: "João Silva",
      email: "joao.silva@empresa.com",
      roles: ["recruiter"],
      permissions: ["read:jobs", "write:jobs", "read:candidates"],
      isAdmin: cpf === "123.456.789-00",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  logout: async (): Promise<void> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("User logged out")
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Stub implementation
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock current user
    return {
      _id: "1",
      cpf: "123.456.789-00",
      slug: "joao-silva-abc123",
      name: "João Silva",
      email: "joao.silva@empresa.com",
      roles: ["recruiter"],
      permissions: ["read:jobs", "write:jobs", "read:candidates"],
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },
}
