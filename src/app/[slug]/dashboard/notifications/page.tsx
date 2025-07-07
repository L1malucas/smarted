"use client";

import { NotificationList } from "@/shared/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notificações</h1>
        <p className="text-muted-foreground">
          Gerencie suas notificações internas.
        </p>
      </div>
      <NotificationList />
    </div>
  );
}
