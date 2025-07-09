"use client";

import React, { useState, useEffect, useTransition } from "react";
import { INotification } from "@/domain/models/Notification";
import { listNotificationsAction, markNotificationAsReadAction, deleteNotificationAction } from "@/infrastructure/actions/notification-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { NotificationItem } from "./notification-item";
import { toast } from "@/shared/components/ui/use-toast";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";

export function NotificationList() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filterRead, setFilterRead] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const fetchNotifications = () => {
      setIsLoading(true);
      startTransition(async () => {
        const result = await listNotificationsAction({ isRead: filterRead });
        if (result.success && result.data) {
          setNotifications(result.data.notifications);
        } else {
          toast({ title: "Erro", description: result.error || "Não foi possível carregar as notificações.", variant: "destructive" });
        }
        setIsLoading(false);
      });
    };
    fetchNotifications();
  }, [filterRead, setIsLoading, startTransition, setNotifications]);

  const handleMarkAsRead = async (id: string) => {
    startTransition(async () => {
      const result = await markNotificationAsReadAction(id);
      if (result.success) {
        toast({ title: "Sucesso", description: "Notificação marcada como lida." });
        fetchNotifications();
      } else {
        toast({ title: "Erro", description: result.error || "Não foi possível marcar como lida.", variant: "destructive" });
      }
    });
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    startTransition(async () => {
      const result = await markNotificationAsReadAction(selectedNotifications);
      if (result.success) {
        toast({ title: "Sucesso", description: "Notificações marcadas como lidas." });
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        toast({ title: "Erro", description: result.error || "Não foi possível marcar como lidas.", variant: "destructive" });
      }
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    startTransition(async () => {
      const result = await deleteNotificationAction(selectedNotifications);
      if (result.success) {
        toast({ title: "Sucesso", description: "Notificações excluídas." });
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        toast({ title: "Erro", description: result.error || "Não foi possível excluir as notificações.", variant: "destructive" });
      }
    });
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(notifications.map(notif => notif._id));
    } else {
      setSelectedNotifications([]);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Minhas Notificações</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={filterRead === false ? "default" : "outline"}
            onClick={() => setFilterRead(filterRead === false ? undefined : false)}
          >
            <Mail className="mr-2 h-4 w-4" /> Não Lidas
          </Button>
          <Button
            variant={filterRead === true ? "default" : "outline"}
            onClick={() => setFilterRead(filterRead === true ? undefined : true)}
          >
            <MailOpen className="mr-2 h-4 w-4" /> Lidas
          </Button>
          <Button
            variant="outline"
            onClick={() => setFilterRead(undefined)}
          >
            Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Selecionar Todos</Label>
              {selectedNotifications.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead} disabled={isPending}>
                    Marcar como Lidas
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isPending}>
                    Excluir Selecionadas
                  </Button>
                </>
              )}
            </div>
            {notifications.map((notification) => (
              <div key={notification._id} className="flex items-start space-x-2">
                <Checkbox
                  id={notification._id}
                  checked={selectedNotifications.includes(notification._id)}
                  onCheckedChange={() => toggleSelectNotification(notification._id)}
                />
                <NotificationItem notification={notification} onMarkAsRead={handleMarkAsRead} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Nenhuma notificação encontrada.</p>
        )}
      </CardContent>
    </Card>
  );
}