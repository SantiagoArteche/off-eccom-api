import { createTransport, Transporter } from "nodemailer";
import "dotenv/config";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
}

export class Nodemailer {
  private transporter: Transporter;
  constructor(
    mailerService: string,
    mailerEmail: string,
    senderEmailPass: string
  ) {
    this.transporter = createTransport({
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: senderEmailPass,
      },
    });
  }

  async sendEmail(options: SendMailOptions): Promise<Boolean> {
    const { htmlBody, subject, to } = options;

    try {
      await this.transporter.sendMail({
        to,
        subject,
        html: htmlBody,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
