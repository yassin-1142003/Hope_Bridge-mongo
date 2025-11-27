import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

async function sendContactEmails(name: string, email: string, message: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // or smtp.yourdomain.com
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    await transporter.sendMail({
      from: `"HopeBridge Contact" <${process.env.EMAIL_USER}>`,
      to: 'test@hopebridgecharity.com',
      date: new Date(),
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    await transporter.sendMail({
      from: `"HopeBridge Contact" <${process.env.EMAIL_USER}>`,
      to: 'contacthope@hopebridgecharity.com',
      date: new Date(),
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
  } catch (err) {
    console.error('Error sending contact emails:', err);
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, message, honeypot } = await req.json();
    
    // 🕵️ Honeypot check
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json(
        { success: false, error: "Bot detected" },
        { status: 400 }
      );
    }

    // Store contact message in MongoDB
    const contactsCollection = await getCollection('contacts');
    await contactsCollection.insertOne({
      name,
      email,
      message,
      createdAt: new Date()
    });

    // fire-and-forget email sending so the response is fast
    void sendContactEmails(name, email, message);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error handling contact request:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process contact request' },
      { status: 500 },
    );
  }
}
