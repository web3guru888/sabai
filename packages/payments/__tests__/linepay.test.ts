import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinePayClient } from '../src/linepay';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('LinePayClient', () => {
  const config = {
    channelId: 'test-channel-id',
    channelSecret: 'test-channel-secret',
    sandbox: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('constructor', () => {
    it('constructs with correct config', () => {
      const client = new LinePayClient(config);
      expect(client).toBeDefined();
    });

    it('throws if channelId is missing', () => {
      expect(() => new LinePayClient({ channelId: '', channelSecret: 'secret' })).toThrow(
        'LINE Pay channelId and channelSecret are required',
      );
    });

    it('throws if channelSecret is missing', () => {
      expect(() => new LinePayClient({ channelId: 'id', channelSecret: '' })).toThrow(
        'LINE Pay channelId and channelSecret are required',
      );
    });
  });

  describe('requestPayment', () => {
    it('calls correct endpoint with HMAC signature', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          returnCode: '0000',
          returnMessage: 'Success',
          info: {
            paymentUrl: {
              web: 'https://sandbox-web-pay.line.me/web/payment/wait',
              app: 'line://pay/payment/test',
            },
            transactionId: 123456789,
            paymentAccessToken: 'access-token',
          },
        }),
      });

      const client = new LinePayClient(config);

      const body = {
        amount: 350,
        currency: 'THB',
        orderId: 'order-001',
        packages: [
          {
            id: 'pkg-1',
            amount: 350,
            products: [{ name: 'Pad Thai', quantity: 1, price: 350 }],
          },
        ],
        redirectUrls: {
          confirmUrl: 'https://example.com/pay/confirm',
          cancelUrl: 'https://example.com/pay/cancel',
        },
      };

      const result = await client.requestPayment(body);

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('https://sandbox-api-pay.line.me/v3/payments/request');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['X-LINE-ChannelId']).toBe('test-channel-id');
      expect(options.headers['X-LINE-Authorization-Nonce']).toBeDefined();
      expect(options.headers['X-LINE-Authorization']).toBeDefined();
      expect(JSON.parse(options.body)).toEqual(body);

      expect(result.returnCode).toBe('0000');
      expect(result.info?.transactionId).toBe(123456789);
    });

    it('throws on HTTP error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: vi.fn().mockResolvedValue('Invalid request body'),
      });

      const client = new LinePayClient(config);

      await expect(
        client.requestPayment({
          amount: 100,
          currency: 'THB',
          orderId: 'order-bad',
          packages: [],
          redirectUrls: { confirmUrl: '', cancelUrl: '' },
        }),
      ).rejects.toThrow('LINE Pay API error: 400 Bad Request — Invalid request body');
    });
  });

  describe('confirmPayment', () => {
    it('calls correct endpoint', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          returnCode: '0000',
          returnMessage: 'Success',
          info: {
            transactionId: 123456789,
            orderId: 'order-001',
            payInfo: [{ method: 'BALANCE', amount: 350 }],
          },
        }),
      });

      const client = new LinePayClient(config);

      const result = await client.confirmPayment(123456789, {
        amount: 350,
        currency: 'THB',
      });

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(
        'https://sandbox-api-pay.line.me/v3/payments/requests/123456789/confirm',
      );
      expect(result.returnCode).toBe('0000');
    });
  });

  describe('getPaymentDetails', () => {
    it('calls correct endpoint with GET', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          returnCode: '0000',
          returnMessage: 'Success',
        }),
      });

      const client = new LinePayClient(config);

      await client.getPaymentDetails(123456789);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(
        'https://sandbox-api-pay.line.me/v3/payments/requests/123456789/check',
      );
      expect(options.method).toBe('GET');
    });
  });

  describe('sandbox vs production URL', () => {
    it('sandbox mode uses sandbox URL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ returnCode: '0000' }),
      });

      const client = new LinePayClient({ ...config, sandbox: true });
      await client.requestPayment({
        amount: 100,
        currency: 'THB',
        orderId: 'test',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      });

      const [url] = fetchMock.mock.calls[0];
      expect(url).toContain('sandbox-api-pay.line.me');
    });

    it('production mode uses production URL', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ returnCode: '0000' }),
      });

      const client = new LinePayClient({ ...config, sandbox: false });
      await client.requestPayment({
        amount: 100,
        currency: 'THB',
        orderId: 'test',
        packages: [],
        redirectUrls: { confirmUrl: '', cancelUrl: '' },
      });

      const [url] = fetchMock.mock.calls[0];
      expect(url).toContain('api-pay.line.me');
      expect(url).not.toContain('sandbox');
    });
  });
});
