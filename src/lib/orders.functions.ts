import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneRegex = /^\+?\d[\d\s-]{7,17}$/;

const OrderInput = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone"),
  note: z.string().trim().max(400).optional().nullable(),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        name: z.string().min(1).max(80),
        qty: z.number().int().min(1).max(50),
        price: z.number().min(0).max(100000),
      }),
    )
    .min(1)
    .max(20),
  total_etb: z.number().min(0).max(1_000_000),
});

const BookingInput = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone"),
  party_size: z.number().int().min(1).max(20),
  reserved_for: z.string().min(8).max(40), // ISO
  note: z.string().trim().max(400).optional().nullable(),
});

async function notifyTelegram(text: string) {
  const apiKey = process.env.TELEGRAM_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!apiKey || !lovableKey || !chatId) return;
  try {
    await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("telegram notify failed", err);
  }
}

export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => OrderInput.parse(data))
  .handler(async ({ data }) => {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const lines = data.items
      .map((i) => `  • ${i.qty}x ${i.name} — ETB ${i.price * i.qty}`)
      .join("\n");
    await notifyTelegram(
      `🔥 <b>New Order</b>%0AFrom: ${data.customer_name} (${data.phone})%0A${encodeURIComponent(lines)}%0A<b>Total: ETB ${data.total_etb}</b>${data.note ? `%0ANote: ${encodeURIComponent(data.note)}` : ""}`,
    );
    return { id };
  });

export const bookTable = createServerFn({ method: "POST" })
  .validator((data: unknown) => BookingInput.parse(data))
  .handler(async ({ data }) => {
    const id = `TBL-${Date.now().toString(36).toUpperCase()}`;
    await notifyTelegram(
      `🪑 <b>New Reservation</b>%0A${data.name} (${data.phone})%0AParty of ${data.party_size}%0AFor: ${new Date(data.reserved_for).toLocaleString()}${data.note ? `%0ANote: ${encodeURIComponent(data.note)}` : ""}`,
    );
    return { id };
  });
