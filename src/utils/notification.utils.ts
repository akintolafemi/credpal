import axios from 'axios';
import {
  EmailNotificationData,
  NotificationType,
} from 'src/types/events.types';

export const sendEmailNotification = async (data: EmailNotificationData) => {
  try {
    let message: string;
    let subject: string;
    switch (data.type) {
      case NotificationType.VERIFY_ACCOUNT:
        message = `Please verify your account with the code below\n\n${data.code}`;
        subject = `CredPal: Verify Account`;
        break;

      default:
        message = '';
        subject = '';
        break;
    }

    const response = await axios({
      url: `${process.env.MAIL_API_URL}/sendmail/`,
      method: 'POST',
      data: {
        sender: `${process.env.MAIL_NOREPLY}`,
        subject,
        recipient: data.email,
        message,
        name: `${process.env.MAIL_SENDER}`,
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${process.env.MAIL_TOKEN}`,
        AUTH: `Token: ${process.env.MAIL_AUTH}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return error?.response?.data;
  }
};
