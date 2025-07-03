// components/admin/UserManagement.tsx
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { AllowedCPF } from "@/types/admin-interface"
import { toast } from "@/components/ui/use-toast"
import { z } from "zod"

const newUserSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  isAdmin: z.boolean(),
});

interface UserManagementProps {
  allowedCPFs: AllowedCPF[]
  addCPF: (newUser: AllowedCPF) => Promise<void>
  removeCPF: (cpf: string) => Promise<void>
}

export default function UserManagement({ allowedCPFs, addCPF, removeCPF }: UserManagementProps) {
  const [newCPF, setNewCPF] = useState("")
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    if (formatted.length <= 14) {
      setNewCPF(formatted)
    }
  }

  const handleAddCPF = async () => {
    setValidationErrors({});
    try {
      const newUser: AllowedCPF = newUserSchema.parse({
        cpf: newCPF,
        name: newName,
        email: newEmail,
        isAdmin: newIsAdmin,
      }) as AllowedCPF;

      setIsAddingUser(true);
      await addCPF({
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast({
        title: "Usuário Adicionado",
        description: `O usuário ${newName} (${newCPF}) foi adicionado com sucesso.`, 
      });
      setNewCPF("");
      setNewName("");
      setNewEmail("");
      setNewIsAdmin(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          errors[err.path[0]] = err.message;
        });
        setValidationErrors(errors);
        toast({
          title: "Erro de Validação",
          description: "Por favor, corrija os erros no formulário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o usuário.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveCPF = async (cpf: string, name: string) => {
    try {
      await removeCPF(cpf);
      toast({
        title: "Usuário Removido",
        description: `O usuário ${name} (${cpf}) foi removido com sucesso.`, 
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Usuário</CardTitle>
          <CardDescription>Autorize novos usuários a acessar o sistema e defina permissões.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="000.000.000-00" value={newCPF} onChange={handleCPFChange} />
              {validationErrors.cpf && <p className="text-red-500 text-xs mt-1">{validationErrors.cpf}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Nome do usuário"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="admin" checked={newIsAdmin} onCheckedChange={setNewIsAdmin} />
              <Label htmlFor="admin">Permissão de Administrador</Label>
            </div>
          </div>
          <Button onClick={handleAddCPF} disabled={isAddingUser}>
            {isAddingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            {isAddingUser ? "Adicionando..." : "Adicionar Usuário"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usuários Autorizados ({allowedCPFs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allowedCPFs.map((user) => (
            <div key={user.cpf} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">
                  <span>{user.name}{" "}</span>
                  {user.isAdmin && (
                    <Badge variant="destructive" className="ml-2">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.cpf}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Criado em: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveCPF(user.cpf, user.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}