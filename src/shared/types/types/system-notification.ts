export interface ISystemNotification {
  _id: string;
  userId: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  relatedResource?: { type: "job" | "candidate"; id: string; title?: string };
  isRead: boolean;
  createdAt: Date;
  link?: string;
}
