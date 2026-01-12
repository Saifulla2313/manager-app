import { env } from '../config/env';

interface SendWhatsAppMessageParams {
  phone: string;
  message: string;
}

/**
 * Сервис для отправки WhatsApp сообщений через Wappi.pro API
 * Документация: https://wappi.pro/docs
 */
export class WhatsAppService {
  private apiKey: string;
  private profileId: string;
  private baseUrl = 'https://wappi.pro/api';

  constructor() {
    this.apiKey = env.WAPPI_API_KEY || '';
    this.profileId = env.WAPPI_PROFILE_ID || '';

    if (!this.apiKey || !this.profileId) {
      console.warn(
        '⚠️  Wappi.pro credentials not configured. WhatsApp messages will not be sent.'
      );
    }
  }

  /**
   * Отправить приглашение в WhatsApp
   */
  async sendInvite(params: {
    phone: string;
    inviteCode: string;
    organizationName: string;
    managerName: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { phone, inviteCode, organizationName, managerName } = params;

    const message = `🎉 Приглашение в ${organizationName}

${managerName} пригласил вас присоединиться к команде!

📱 Скачайте приложение Manager App:
👉 https://example.com/download

🔑 Ваш код приглашения: ${inviteCode}

Код действителен 7 дней.`;

    return this.sendMessage({ phone, message });
  }

  /**
   * Общий метод для отправки WhatsApp сообщения
   */
  async sendMessage(params: SendWhatsAppMessageParams): Promise<{ success: boolean; error?: string }> {
    const { phone, message } = params;

    if (!this.apiKey || !this.profileId) {
      console.log('📱 [WhatsApp Mock] Would send to:', phone);
      console.log('Message:', message);
      return { success: true }; // Mock mode
    }

    try {
      const response = await fetch(`${this.baseUrl}/sync/message/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          recipient: this.formatPhone(phone),
          body: message,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        console.error('❌ Wappi.pro error:', data);
        return {
          success: false,
          error: data.message || 'Failed to send WhatsApp message',
        };
      }

      console.log('✅ WhatsApp message sent to:', phone);
      return { success: true };
    } catch (error) {
      console.error('❌ WhatsApp service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Форматировать номер телефона для Wappi.pro
   * Формат: 79001234567 (без +)
   */
  private formatPhone(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }
}

// Экспортируем синглтон
export const whatsappService = new WhatsAppService();
