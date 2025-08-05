// types.ts
export type Priority = "normal" | "urgent" | "very_urgent";

export type Reminder = {
  id: string;
  text: string;
  priority: Priority;
  createdAt: number;
  done: boolean;
  notificationId?: string;
};
