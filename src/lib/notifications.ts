export interface NotificationService {
  sendWa(phone: string, message: string): Promise<void>;
}

/** Placeholder — siap diganti Fonnte/Wablas API di production. */
export const notificationService: NotificationService = {
  async sendWa(phone: string, message: string) {
    console.log(`[WA-PLACEHOLDER] ke ${phone}: ${message}`);
  },
};