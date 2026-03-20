import { describe, it, expect, vi } from 'vitest';
import { crc16 } from '../src/utils';

// Mock qrcode module
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,MOCK_QR_DATA'),
  },
}));

import { generatePromptPayPayload, generatePromptPayQR } from '../src/promptpay';

describe('PromptPay', () => {
  describe('generatePromptPayPayload', () => {
    it('generates valid EMVCo payload for phone number', () => {
      const payload = generatePromptPayPayload({ target: '0812345678' });

      // Should start with payload format indicator "000201"
      expect(payload.startsWith('0002')).toBe(true);

      // Should contain "01" value (Payload Format Indicator)
      expect(payload).toContain('000201');

      // Should contain static QR indicator "0211" (tag 01, len 02, value 11)
      expect(payload).toContain('010211');

      // Should contain THB currency code 764
      expect(payload).toContain('5303764');

      // Should contain country code TH
      expect(payload).toContain('5802TH');

      // Should end with CRC: "6304" + 4 hex chars
      expect(payload).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('includes correct CRC16 checksum', () => {
      const payload = generatePromptPayPayload({ target: '0812345678' });

      // Extract the CRC part
      const crcIndex = payload.indexOf('6304');
      const beforeCrc = payload.substring(0, crcIndex + 4);
      const crcValue = payload.substring(crcIndex + 4);

      expect(crcValue).toHaveLength(4);
      expect(crcValue).toMatch(/^[0-9A-F]{4}$/);

      // Verify CRC is computed over the correct prefix
      // The CRC is computed over payload up to and including "6304"
      const expectedCrc = crc16(beforeCrc);
      expect(crcValue).toBe(expectedCrc);
    });

    it('generates static QR (no amount) with "11" initiation method', () => {
      const payload = generatePromptPayPayload({ target: '0812345678' });

      // Point of Initiation Method: tag 01, value "11" (static)
      expect(payload).toContain('010211');

      // Should NOT contain tag 54 (amount)
      expect(payload).not.toMatch(/54\d{2}/);
    });

    it('generates dynamic QR (with amount) with "12" initiation method', () => {
      const payload = generatePromptPayPayload({ target: '0812345678', amount: 150.50 });

      // Point of Initiation Method: tag 01, value "12" (dynamic)
      expect(payload).toContain('010212');

      // Should contain tag 54 with amount "150.50"
      expect(payload).toContain('540615');
      expect(payload).toContain('150.50');
    });

    it('handles phone numbers correctly (sub-tag 01)', () => {
      const payload = generatePromptPayPayload({ target: '0812345678' });

      // Merchant account info (tag 29) should contain:
      // sub-tag 00 with PromptPay AID
      // sub-tag 01 with formatted phone: "0066812345678"
      expect(payload).toContain('A000000677010111');
      expect(payload).toContain('0066812345678');
    });

    it('handles national IDs correctly (sub-tag 02)', () => {
      const payload = generatePromptPayPayload({ target: '1234567890123' });

      // Should contain the national ID and sub-tag 02
      expect(payload).toContain('1234567890123');
      expect(payload).toContain('A000000677010111');
    });

    it('throws for invalid target', () => {
      expect(() => generatePromptPayPayload({ target: '12345' })).toThrow(
        'Invalid PromptPay target',
      );
    });

    it('handles phone with formatting characters', () => {
      const payload = generatePromptPayPayload({ target: '081-234-5678' });
      expect(payload).toContain('0066812345678');
    });
  });

  describe('generatePromptPayQR', () => {
    it('returns an object with payload and qrDataUrl', async () => {
      const result = await generatePromptPayQR({ target: '0812345678' });

      expect(result.payload).toBeDefined();
      expect(result.payload.startsWith('0002')).toBe(true);
      expect(result.qrDataUrl).toBe('data:image/png;base64,MOCK_QR_DATA');
    });

    it('passes correct options to QRCode.toDataURL', async () => {
      const QRCode = (await import('qrcode')).default;

      await generatePromptPayQR({ target: '0812345678' }, { width: 400, margin: 3 });

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          width: 400,
          margin: 3,
          errorCorrectionLevel: 'M',
        }),
      );
    });

    it('uses default width 300 and margin 2', async () => {
      const QRCode = (await import('qrcode')).default;

      await generatePromptPayQR({ target: '0812345678' });

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          width: 300,
          margin: 2,
        }),
      );
    });
  });
});
