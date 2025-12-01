import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'motaz.mostafa99@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Use app password for Gmail
    },
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const to = formData.get('to') as string;
        const from = formData.get('from') as string;
        const subject = formData.get('subject') as string;
        const text = formData.get('text') as string;
        const attachment = formData.get('attachment') as File;

        if (!to || !from || !subject || !text) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Prepare email options
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            text: text,
            attachments: []
        };

        // Add attachment if exists
        if (attachment) {
            const bytes = await attachment.arrayBuffer();
            const buffer = Buffer.from(bytes);

            mailOptions.attachments = [{
                filename: `invoice-${Date.now()}.pdf`,
                content: buffer,
                contentType: 'application/pdf'
            }];
        }

        // Send email using Nodemailer
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent: ' + info.messageId);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
