// @sabai/core — LINE messaging utilities (share, push, Flex builders)

import type { ServiceMessageParams, OrderConfirmation, FlexMessage } from './types';

/**
 * Open the LINE Share Target Picker to let the user share messages with friends.
 *
 * Only available inside the LINE client or on supported external browsers.
 *
 * @param messages - Array of LINE message objects to share.
 * @throws {Error} If the Share Target Picker is not available in this context.
 *
 * @example
 * ```ts
 * await shareMessage([{
 *   type: 'text',
 *   text: 'Check out this order!',
 * }]);
 * ```
 */
export async function shareMessage(messages: Array<Record<string, unknown>>): Promise<void> {
  const liff = (await import('@line/liff')).default;

  if (!liff.isApiAvailable('shareTargetPicker')) {
    throw new Error('Share Target Picker is not available in this context');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await liff.shareTargetPicker(messages as any);
}

/**
 * Send a push message via the LINE Messaging API (server-to-user).
 *
 * Requires a channel access token with messaging permissions.
 * This should typically be called from a backend proxy to avoid exposing tokens.
 *
 * @param accessToken - The LINE channel access token.
 * @param params - Message parameters including recipient and message content.
 * @returns The fetch Response object.
 * @throws {Error} If the API request fails.
 */
export async function sendServiceMessage(
  accessToken: string,
  params: ServiceMessageParams,
): Promise<Response> {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Service message failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Build a LINE Flex Message for an order confirmation.
 *
 * Generates a styled bubble with header, itemized body, and total footer
 * using the Sabai gold (#d4af37) color scheme.
 *
 * @param order - Order data including items, total, and currency.
 * @returns A complete {@link FlexMessage} ready to send or share.
 *
 * @example
 * ```ts
 * const flex = buildOrderConfirmationFlex({
 *   orderId: 'ORD-001',
 *   items: [{ name: 'Pad Thai', quantity: 2, price: 120 }],
 *   total: 240,
 * });
 * await shareMessage([flex]);
 * ```
 */
export function buildOrderConfirmationFlex(order: OrderConfirmation): FlexMessage {
  const currency = order.currency || '฿';

  return {
    type: 'flex',
    altText: `Order Confirmation #${order.orderId}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Order Confirmed ✓',
            weight: 'bold',
            size: 'lg',
            color: '#d4af37',
          },
          {
            type: 'text',
            text: `#${order.orderId}`,
            size: 'sm',
            color: '#999999',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: order.items.map((item) => ({
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: `${item.name} x${item.quantity}`,
              flex: 3,
              size: 'sm',
            },
            {
              type: 'text',
              text: `${currency}${(item.price * item.quantity).toLocaleString()}`,
              flex: 1,
              size: 'sm',
              align: 'end',
            },
          ],
        })),
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'separator',
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'Total',
                weight: 'bold',
                size: 'md',
              },
              {
                type: 'text',
                text: `${currency}${order.total.toLocaleString()}`,
                weight: 'bold',
                size: 'md',
                align: 'end',
                color: '#d4af37',
              },
            ],
          },
        ],
      },
    },
  };
}
