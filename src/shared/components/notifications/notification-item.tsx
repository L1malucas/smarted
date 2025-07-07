"use client";

import React from "react";
import { INotification } from "@/domain/models/Notification";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { markNotificationAsReadAction } from "@/infrastructure/actions/notification-actions";

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter();

  const handleNotificationClick = async () => {
    if (!notification.isRead) {
      await markNotificationAsReadAction(notification._id);
      onMarkAsRead(notification._id);
    }

    // Navigate to the resource if resourceType and resourceId are available
    if (notification.resourceType && notification.resourceId) {
      let path = "";
      switch (notification.resourceType) {
        case "job_application":
          path = `/dashboard/applications/${notification.resourceId}`;
          break;
        case "job_update":
          path = `/dashboard/jobs/${notification.resourceId}`;
          break;
        case "user_assigned":
          path = `/dashboard/users/${notification.resourceId}`;
          break;
        // Add more cases as needed
        default:
          path = `/dashboard/notifications`; // Fallback to notifications page
      }
      if (path) {
        router.push(path);
      }
    }
  };

  return (
    <Card
      className={cn(
        "mb-2 cursor-pointer transition-colors hover:bg-accent",
        !notification.isRead && "bg-blue-50 dark:bg-blue-950"
      )}
      onClick={handleNotificationClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.senderName && `De: ${notification.senderName} - `}
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0 ml-2" title="Não lida" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
