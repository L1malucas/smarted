// components/admin/UserManagement.tsx
import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import { AllowedCPF } from "@/types/admin-interface"

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
    if (newCPF && newName && newEmail) {
      const newUser: AllowedCPF = {
        cpf: newCPF,
        name: newName,
        isAdmin: newIsAdmin,
        email: newEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await addCPF(newUser)
      setNewCPF("")
      setNewName("")
      setNewEmail("")
      setNewIsAdmin(false)
    }
  }

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
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Nome do usuário"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
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
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="admin" checked={newIsAdmin} onCheckedChange={setNewIsAdmin} />
              <Label htmlFor="admin">Permissão de Administrador</Label>
            </div>
          </div>
          <Button onClick={handleAddCPF} disabled={!newCPF || !newName || !newEmail}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
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
                  onClick={() => removeCPF(user.cpf)}
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