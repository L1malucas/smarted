"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Loader2, PlusCircle, Edit, Trash2, EyeOff } from "lucide-react";
import { toast } from "@/shared/components/ui/use-toast";
import { listShareableLinksAction, updateShareableLinkAction, deactivateShareableLinkAction, deleteShareableLinkAction } from "@/infrastructure/actions/share-actions";
import { IShareableLink } from "@/domain/models/ShareableLink";
import { ShareDialog } from "@/shared/components/share-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

export default function ShareableLinksPage() {
  const params = useParams();
  const tenantSlug = params.slug as string;

  const [links, setLinks] = useState<IShareableLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedLink, setSelectedLink] = useState<IShareableLink | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Edit form states
  const [editExpiresAt, setEditExpiresAt] = useState<string>("");
  const [editMaxViews, setEditMaxViews] = useState<number | undefined>(undefined);
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsPasswordProtected, setEditIsPasswordProtected] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    startTransition(async () => {
      const result = await listShareableLinksAction();
      if (result.success && result.data) {
        setLinks(result.data.links);
      } else {
        toast({
          title: "Erro",
          description: result.error || "Não foi possível carregar os links compartilháveis.",
          variant: "destructive",
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (selectedLink) {
      setEditExpiresAt(selectedLink.expiresAt ? new Date(selectedLink.expiresAt).toISOString().split('T')[0] : "");
      setEditMaxViews(selectedLink.maxViews || undefined);
      setEditIsActive(selectedLink.isActive);
      setEditIsPasswordProtected(!!selectedLink.passwordHash);
      setEditPassword(""); // Never pre-fill password
    }
  }, [selectedLink]);

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLink) return;

    startTransition(async () => {
      const updates: Partial<IShareableLink> & { password?: string } = {
        isActive: editIsActive,
        expiresAt: editExpiresAt ? new Date(editExpiresAt) : undefined,
        maxViews: editMaxViews,
      };

      if (editIsPasswordProtected) {
        updates.password = editPassword; // Only send password if it's being set/updated
      }

      const result = await updateShareableLinkAction(selectedLink.hash, updates);
      if (result.success) {
        toast({ title: "Sucesso", description: "Link atualizado com sucesso." });
        fetchLinks();
        setIsEditDialogOpen(false);
        setSelectedLink(null);
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleDeactivateLink = async (hash: string) => {
    if (!confirm("Tem certeza que deseja desativar este link?")) return;
    startTransition(async () => {
      const result = await deactivateShareableLinkAction(hash);
      if (result.success) {
        toast({ title: "Sucesso", description: "Link desativado com sucesso." });
        fetchLinks();
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  const handleDeleteLink = async (hash: string) => {
    if (!confirm("Tem certeza que deseja EXCLUIR este link? Esta ação é irreversível.")) return;
    startTransition(async () => {
      const result = await deleteShareableLinkAction(hash);
      if (result.success) {
        toast({ title: "Sucesso", description: "Link excluído com sucesso." });
        fetchLinks();
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Links Compartilháveis</CardTitle>
          <CardDescription>Gerencie os links públicos para seus recursos.</CardDescription>
        </div>
        <ShareDialog
          title="Gerar Novo Link Compartilhável"
          resourceType="job" // Default, will be changed by user
          resourceId="" // Default, will be changed by user
          resourceName=""
          tenantSlug={tenantSlug}
        >
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Gerar Novo Link</Button>
        </ShareDialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum link compartilhável encontrado.</p>
            <p>Comece gerando um novo link acima.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiração</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Criado Por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link._id.toString()}>
                  <TableCell>{link.resourceName}</TableCell>
                  <TableCell>{link.resourceType}</TableCell>
                  <TableCell>{link.hash}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${link.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {link.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>{link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : "Nunca"}</TableCell>
                  <TableCell>{link.maxViews && link.maxViews > 0 ? `${link.viewsCount}/${link.maxViews}` : link.viewsCount}</TableCell>
                  <TableCell>{link.createdByUserName}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedLink(link);
                      setIsEditDialogOpen(true);
                    }} disabled={isPending}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeactivateLink(link.hash)} disabled={isPending || !link.isActive}>
                      <EyeOff className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.hash)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Link Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Link Compartilhável</DialogTitle>
              <DialogDescription>Faça alterações no link. Clique em salvar quando terminar.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateLink} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiresAt" className="text-right">Expira em</Label>
                <Input
                  id="edit-expiresAt"
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-maxViews" className="text-right">Máx. Visualizações</Label>
                <Input
                  id="edit-maxViews"
                  type="number"
                  value={editMaxViews || ''}
                  onChange={(e) => setEditMaxViews(Number(e.target.value) || undefined)}
                  placeholder="0 para ilimitado"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password-protect" className="text-right">Proteger com Senha</Label>
                <Switch
                  id="edit-password-protect"
                  checked={editIsPasswordProtected}
                  onCheckedChange={setEditIsPasswordProtected}
                  className="col-span-3"
                />
              </div>
              {editIsPasswordProtected && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-password" className="text-right">Nova Senha</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is-active" className="text-right">Ativo</Label>
                <Switch
                  id="edit-is-active"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
