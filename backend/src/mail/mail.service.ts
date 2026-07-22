import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>("RESEND_API_KEY");

    if (!apiKey) {
      this.logger.warn(
        "RESEND_API_KEY tanımlı değil. E-posta gönderimi devre dışı kalacak.",
      );
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.error(`E-posta gönderilemedi (${to}): RESEND_API_KEY yapılandırılmamış.`);
      throw new Error("Mail servisi yapılandırılmamış.");
    }

    const from = this.config.get<string>("MAIL_FROM") ?? "VolantX Shopping <onboarding@resend.dev>";

    const { error } = await this.resend.emails.send({
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

    if (error) {
      throw new Error(`${error.name}: ${error.message}`);
    }
  }
}
