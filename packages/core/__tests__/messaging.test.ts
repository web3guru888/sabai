import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @line/liff
const liffMock = {
  isApiAvailable: vi.fn().mockReturnValue(true),
  shareTargetPicker: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@line/liff', () => ({
  default: liffMock,
}));

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Messaging Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('buildOrderConfirmationFlex', () => {
    it('generates correct Flex Message structure', async () => {
      const { buildOrderConfirmationFlex } = await import('../src/messaging');

      const flex = buildOrderConfirmationFlex({
        orderId: 'ORD-001',
        items: [
          { name: 'Pad Thai', quantity: 2, price: 120 },
          { name: 'Green Curry', quantity: 1, price: 180 },
        ],
        total: 420,
      });

      expect(flex.type).toBe('flex');
      expect(flex.altText).toBe('Order Confirmation #ORD-001');

      // Check it's a bubble
      expect(flex.contents.type).toBe('bubble');

      // Check header has order confirmed text
      const header = flex.contents.header as Record<string, unknown>;
      expect(header.type).toBe('box');
      const headerContents = header.contents as Array<Record<string, unknown>>;
      expect(headerContents[0].text).toBe('Order Confirmed ✓');
      expect(headerContents[0].color).toBe('#d4af37');
      expect(headerContents[1].text).toBe('#ORD-001');

      // Check body has items
      const body = flex.contents.body as Record<string, unknown>;
      const bodyContents = body.contents as Array<Record<string, unknown>>;
      expect(bodyContents).toHaveLength(2);

      // Check footer has total
      const footer = flex.contents.footer as Record<string, unknown>;
      const footerContents = footer.contents as Array<Record<string, unknown>>;
      // Second element is the total box
      const totalBox = footerContents[1] as Record<string, unknown>;
      const totalContents = totalBox.contents as Array<Record<string, unknown>>;
      expect(totalContents[0].text).toBe('Total');
      expect(totalContents[1].color).toBe('#d4af37');
    });

    it('uses default ฿ currency', async () => {
      const { buildOrderConfirmationFlex } = await import('../src/messaging');

      const flex = buildOrderConfirmationFlex({
        orderId: 'ORD-002',
        items: [{ name: 'Item', quantity: 1, price: 100 }],
        total: 100,
      });

      const footer = flex.contents.footer as Record<string, unknown>;
      const footerContents = footer.contents as Array<Record<string, unknown>>;
      const totalBox = footerContents[1] as Record<string, unknown>;
      const totalContents = totalBox.contents as Array<Record<string, unknown>>;
      expect((totalContents[1].text as string).startsWith('฿')).toBe(true);
    });

    it('uses custom currency when provided', async () => {
      const { buildOrderConfirmationFlex } = await import('../src/messaging');

      const flex = buildOrderConfirmationFlex({
        orderId: 'ORD-003',
        items: [{ name: 'Item', quantity: 1, price: 100 }],
        total: 100,
        currency: '$',
      });

      const footer = flex.contents.footer as Record<string, unknown>;
      const footerContents = footer.contents as Array<Record<string, unknown>>;
      const totalBox = footerContents[1] as Record<string, unknown>;
      const totalContents = totalBox.contents as Array<Record<string, unknown>>;
      expect((totalContents[1].text as string).startsWith('$')).toBe(true);
    });
  });

  describe('sendServiceMessage', () => {
    it('calls fetch with correct headers and body', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      const { sendServiceMessage } = await import('../src/messaging');

      const params = {
        to: 'user-123',
        messages: [
          {
            type: 'flex' as const,
            altText: 'Test message',
            contents: { type: 'bubble' },
          },
        ],
      };

      await sendServiceMessage('test-channel-token', params);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-channel-token',
          },
          body: JSON.stringify(params),
        },
      );
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const { sendServiceMessage } = await import('../src/messaging');

      await expect(
        sendServiceMessage('bad-token', {
          to: 'user-123',
          messages: [],
        }),
      ).rejects.toThrow('Service message failed: 401 Unauthorized');
    });
  });

  describe('shareMessage', () => {
    it('calls liff.shareTargetPicker when API is available', async () => {
      liffMock.isApiAvailable.mockReturnValue(true);

      const { shareMessage } = await import('../src/messaging');
      const messages = [{ type: 'text', text: 'Hello' }];

      await shareMessage(messages);

      expect(liffMock.isApiAvailable).toHaveBeenCalledWith('shareTargetPicker');
      expect(liffMock.shareTargetPicker).toHaveBeenCalledWith(messages);
    });

    it('throws when shareTargetPicker is not available', async () => {
      liffMock.isApiAvailable.mockReturnValue(false);

      const { shareMessage } = await import('../src/messaging');

      await expect(shareMessage([{ type: 'text', text: 'Hello' }])).rejects.toThrow(
        'Share Target Picker is not available in this context',
      );
    });
  });
});
