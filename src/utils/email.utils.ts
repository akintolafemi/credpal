import * as nodemailer from 'nodemailer';
import {
  EmailNotificationData,
  NotificationType,
} from 'src/types/events.types';

export const sendEmailNotification = async (data: EmailNotificationData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    let message: string;
    let subject: string;
    switch (data.type) {
      case NotificationType.VERIFY_ACCOUNT:
        message = `<p>Please verify your account with the code below<br/>${data.code}</p>`;
        subject = `CredPal: Verify Account`;
        break;

      default:
        message = '';
        subject = '';
        break;
    }

    const response = await transporter.sendMail({
      from: `"CredPal" <${process.env.MAIL_USER}>`,
      to: data.email,
      subject,
      html: message,
    });

    return response;
  } catch (error) {
    console.error(error);
    return error?.response?.data;
  }
};
