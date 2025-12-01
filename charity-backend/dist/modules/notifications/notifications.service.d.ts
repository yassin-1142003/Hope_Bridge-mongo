import { EmailService } from "../email/email.service";
export declare class NotificationsService {
    private readonly email;
    constructor(email: EmailService);
    onNewUser(email: string): Promise<void>;
    onError(message: string, stack?: string): Promise<void>;
}
