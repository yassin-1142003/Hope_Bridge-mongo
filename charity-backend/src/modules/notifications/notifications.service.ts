import { Injectable } from "@nestjs/common";
import { EmailService } from "../email/email.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly email: EmailService) {}

  async onNewUser(email: string) {
    await this.email.sendAdminNotification(
      "New user registered",
      `User: ${email}`,
    );
  }

  async onError(message: string, stack?: string) {
    await this.email.sendAdminNotification(
      "Backend error",
      `${message}\n\n${stack ?? ""}`,
    );
  }
}
