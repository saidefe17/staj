import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT") ?? 587);
    const secure = this.config.get<string>("SMTP_SECURE") === "true";
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    if (!host || !user || !pass) {
      this.logger.warn(
        "SMTP yapılandırması eksik (SMTP_HOST/SMTP_USER/SMTP_PASS). E-posta gönderimi devre dışı kalacak.",
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.error(`E-posta gönderilemedi (${to}): SMTP yapılandırılmamış.`);
      throw new Error("Mail servisi yapılandırılmamış.");
    }

    const from = this.config.get<string>("MAIL_FROM") ?? "VolantX Shopping <no-reply@volantx.com>";

    await this.transporter.sendMail({
      from,
      to,
      subject: "VolantX Shopping - Şifre Sıfırlama Kodu",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
          <h2 style="margin-bottom: 4px;">Şifre Sıfırlama Kodu</h2>
          <p>Şifreni sıfırlamak için aşağıdaki doğrulama kodunu kullan. Bu kod <strong>10 dakika</strong> boyunca geçerlidir.</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 8px;">${code}</p>
          <p style="color: #71717a; font-size: 13px;">Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
        </div>
      `,
    });
  }
}
