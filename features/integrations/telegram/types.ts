export type NewApplicationNotification = {
  id: string;
  fullName: string;
  email: string;
  platform: string;
  message: string;
  locale: string;
  type?: string;
};
