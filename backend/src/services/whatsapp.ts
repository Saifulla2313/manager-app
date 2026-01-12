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
      // Wappi.pro API: profile_id в URL, Authorization в header
      const url = `${this.baseUrl}/sync/message/send?profile_id=${this.profileId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
        },
        body: JSON.stringify({
          recipient: this.formatPhone(phone),
          body: message,
        }),
      });

      const data = (await response.json()) as { status?: string; detail?: string; message_id?: string };

      console.log('📱 Wappi.pro response:', data);

      if (data.status === 'error') {
        console.error('❌ Wappi.pro error:', data);
        return {
          success: false,
          error: data.detail || 'Failed to send WhatsApp message',
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
   * Формат: 79001234567 (без +, с 7 в начале)
   */
  private formatPhone(phone: string): string {
    let digits = phone.replace(/[^\d]/g, '');
    // Заменяем 8 на 7 в начале (российский формат)
    if (digits.startsWith('8') && digits.length === 11) {
      digits = '7' + digits.slice(1);
    }
    return digits;
  }
}

// Экспортируем синглтон
export const whatsappService = new WhatsAppService();
