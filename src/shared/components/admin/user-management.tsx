
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Button } from "../ui/button";
import { PlusCircle, Edit, Trash2, Loader2, Badge, Table } from "lucide-react";
import { IUser } from "@/domain/models/User";
import { getTenantUsers, addUser, updateUser, deactivateUser } from "@/infrastructure/actions/admin-actions";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
import { Switch } from "@radix-ui/react-switch";
import { Input } from "@/shared/components/ui/input";
import { Label } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import { MultiSelect } from "../ui/multi-select";
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { useToast } from "../ui/use-toast";


const AVAILABLE_ROLES = [
  { label: "Administrador", value: "admin" },
  { label: "Recrutador", value: "recruiter" },
  { label: "Candidato", value: "candidate" },
  { label: "Super Admin", value: "super-admin" },
];

export default function UserManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(true);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [editRoles, setEditRoles] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditRoles(selectedUser.roles);
    } else {
      setEditRoles([]);
    }
  }, [selectedUser]);

  const fetchUsers = () => {
    setIsFetching(true);
    startTransition(async () => {
      const tenantUsers = await getTenantUsers();
      setUsers(tenantUsers);
      setIsFetching(false);
    });
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newUser = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      cpf: formData.get("cpf") as string,
      isAdmin: formData.get("isAdmin") === "on",
      roles: newRoles,
      permissions: [], // Add permissions field if needed
    };

    startTransition(async () => {
      const result = await addUser(newUser);
      if (result.success) {
        toast({ title: "Sucesso", description: "Usuário adicionado com sucesso." });
        fetchUsers();
        setIsAddUserDialogOpen(false);
        setNewRoles([]); // Clear selected roles after adding
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser?._id) return;

    const formData = new FormData(event.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      cpf: formData.get("cpf") as string,
      isAdmin: formData.get("isAdmin") === "on",
      roles: editRoles,
    };

    startTransition(async () => {
      const result = await updateUser(selectedUser._id.toString(), updates);
      if (result.success) {
        toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
        fetchUsers();
        setIsEditUserDialogOpen(false);
        setSelectedUser(null);
        setEditRoles([]); // Clear selected roles after updating
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleDeactivateUser = (userId: string) => {
    startTransition(async () => {
      const result = await deactivateUser(userId);
      if (result.success) {
        toast({ title: "Sucesso", description: "Usuário desativado com sucesso." });
        fetchUsers();
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Adicione, edite e gerencie usuários para o seu tenant.</CardDescription>
        </div>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Campos do formulário para novo usuário */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" name="cpf" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roles">Cargos</Label>
                <MultiSelect
                  options={AVAILABLE_ROLES}
                  selected={newRoles}
                  onSelectedChange={setNewRoles}
                  placeholder="Selecione os cargos"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isAdmin" name="isAdmin" />
                <Label htmlFor="isAdmin">Administrador</Label>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isPending}>{isPending ? "Adicionando..." : "Adicionar Usuário"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cargos</TableHead>
                <TableHead>Criado Em</TableHead>
                <TableHead>Atualizado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id.toString()}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? "default" : "destructive"}>{user.status === 'active' ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell>{user.roles.join(", ")}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Dialog open={isEditUserDialogOpen && selectedUser?._id === user._id} onOpenChange={(isOpen) => {
                      if (!isOpen) setSelectedUser(null);
                      setIsEditUserDialogOpen(isOpen);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}><Edit className="h-4 w-4" /></Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                          {/* Campos do formulário para edição de usuário */}
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input id="edit-name" name="name" defaultValue={selectedUser?.name} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" name="email" type="email" defaultValue={selectedUser?.email} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-cpf">CPF</Label>
                            <Input id="edit-cpf" name="cpf" defaultValue={selectedUser?.cpf} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-roles">Cargos</Label>
                            <MultiSelect
                              options={AVAILABLE_ROLES}
                              selected={editRoles}
                              onSelectedChange={setEditRoles}
                              placeholder="Selecione os cargos"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="edit-isAdmin" name="isAdmin" defaultChecked={selectedUser?.isAdmin} />
                            <Label htmlFor="edit-isAdmin">Administrador</Label>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={isPending}>{isPending ? "Atualizando..." : "Atualizar Usuário"}</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDeactivateUser(user._id.toString())} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

