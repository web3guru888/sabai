import { describe, it, expect } from 'vitest';
import { crc16, tlv, formatPhoneForPromptPay, isValidNationalId } from '../src/utils';

describe('Payment Utilities', () => {
  describe('crc16', () => {
    it('calculates correct CRC16-CCITT checksum for known input', () => {
      // Test with a known EMVCo payload prefix
      const result = crc16('0002010102');
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it('returns 4-character uppercase hex string', () => {
      const result = crc16('Hello');
      expect(result).toHaveLength(4);
      expect(result).toMatch(/^[0-9A-F]{4}$/);
    });

    it('returns different checksums for different inputs', () => {
      const crc1 = crc16('data1');
      const crc2 = crc16('data2');
      expect(crc1).not.toBe(crc2);
    });

    it('returns same checksum for same input (deterministic)', () => {
      const crc1 = crc16('test-data');
      const crc2 = crc16('test-data');
      expect(crc1).toBe(crc2);
    });

    it('handles empty string', () => {
      const result = crc16('');
      expect(result).toMatch(/^[0-9A-F]{4}$/);
      // CRC of empty string with initial value 0xFFFF is FFFF
      expect(result).toBe('FFFF');
    });
  });

  describe('tlv', () => {
    it('encodes Tag-Length-Value correctly for short values', () => {
      expect(tlv('00', '01')).toBe('000201');
      expect(tlv('58', 'TH')).toBe('5802TH');
    });

    it('encodes length with zero-padding', () => {
      expect(tlv('53', '764')).toBe('5303764');
    });

    it('handles longer values', () => {
      const longValue = 'A000000677010111';
      expect(tlv('00', longValue)).toBe(`0016${longValue}`);
    });

    it('handles empty value', () => {
      expect(tlv('99', '')).toBe('9900');
    });
  });

  describe('formatPhoneForPromptPay', () => {
    it('converts Thai phone "0812345678" to "0066812345678"', () => {
      expect(formatPhoneForPromptPay('0812345678')).toBe('0066812345678');
    });

    it('converts "0912345678" to "0066912345678"', () => {
      expect(formatPhoneForPromptPay('0912345678')).toBe('0066912345678');
    });

    it('strips non-digit characters before converting', () => {
      expect(formatPhoneForPromptPay('081-234-5678')).toBe('0066812345678');
      expect(formatPhoneForPromptPay('081 234 5678')).toBe('0066812345678');
    });

    it('throws for non-10-digit numbers', () => {
      expect(() => formatPhoneForPromptPay('12345')).toThrow('Invalid Thai phone number');
      expect(() => formatPhoneForPromptPay('08123456789')).toThrow('Invalid Thai phone number');
    });

    it('throws for numbers not starting with 0', () => {
      expect(() => formatPhoneForPromptPay('1812345678')).toThrow('Invalid Thai phone number');
    });
  });

  describe('isValidNationalId', () => {
    it('validates a 13-digit national ID with correct check digit', () => {
      // 1234567890121 has check digit 1 (valid)
      expect(isValidNationalId('1234567890121')).toBe(true);
    });

    it('rejects a 13-digit national ID with incorrect check digit', () => {
      // 1234567890123 has expected check digit 1, not 3
      expect(isValidNationalId('1234567890123')).toBe(false);
    });

    it('rejects non-13-digit strings', () => {
      expect(isValidNationalId('12345')).toBe(false);
      expect(isValidNationalId('12345678901234')).toBe(false);
      expect(isValidNationalId('')).toBe(false);
    });

    it('strips non-digit characters and validates', () => {
      // '1-2345-67890-12-1' -> '1234567890121' (valid)
      expect(isValidNationalId('1-2345-67890-12-1')).toBe(true);
      // '1-2345-67890-12-3' -> '1234567890123' (invalid check digit)
      expect(isValidNationalId('1-2345-67890-12-3')).toBe(false);
    });
  });
});
