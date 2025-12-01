import { ConfigService } from "@nestjs/config";
interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    tags?: string[];
}
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    private sendInternal;
    sendMail(options: SendMailOptions): Promise<void>;
    sendVerificationEmail(to: string, link: string): Promise<void>;
    sendPasswordResetEmail(to: string, link: string): Promise<void>;
    sendAdminNotification(subject: string, body: string): Promise<void>;
}
export {};
