import crypto from "crypto";
import { NextResponse } from "next/server";

function toMoney(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}

function normalizePhone(phone) {
  const digits = String(phone ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";

  // 10 цифр (без кода страны) -> добавим 7
  if (digits.length === 10) return `7${digits}`;

  // 8XXXXXXXXXX -> 7XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;

  return digits;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, cartItems, customerInfo } = body ?? {};

    console.log("Received payment request:", {
      amount,
      cartItemsCount: Array.isArray(cartItems) ? cartItems.length : null,
      customerInfo,
    });

    // Базовая валидация
    if (!customerInfo || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Проверяем наличие переменных окружения
    const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
    const SECRET = process.env.YOOKASSA_SECRET;

    const TAX_SYSTEM_CODE = Number(process.env.YOOKASSA_TAX_SYSTEM_CODE || "0"); // 1..6
    const VAT_CODE = Number(process.env.YOOKASSA_VAT_CODE || "0"); // 1..12
    const DEFAULT_PAYMENT_SUBJECT =
      process.env.YOOKASSA_DEFAULT_PAYMENT_SUBJECT || "service"; // service | commodity

    if (!SHOP_ID || !SECRET) {
      console.error("Missing YooKassa credentials");
      return new Response(JSON.stringify({ error: "Payment configuration error" }), {
        status: 500,
      });
    }

    if (!TAX_SYSTEM_CODE || TAX_SYSTEM_CODE < 1 || TAX_SYSTEM_CODE > 6) {
      console.error("Invalid YOOKASSA_TAX_SYSTEM_CODE:", TAX_SYSTEM_CODE);
      return new Response(
        JSON.stringify({ error: "Invalid YOOKASSA_TAX_SYSTEM_CODE (must be 1..6)" }),
        { status: 500 }
      );
    }

    if (!VAT_CODE || VAT_CODE < 1 || VAT_CODE > 12) {
      console.error("Invalid YOOKASSA_VAT_CODE:", VAT_CODE);
      return new Response(
        JSON.stringify({ error: "Invalid YOOKASSA_VAT_CODE (must be 1..12)" }),
        { status: 500 }
      );
    }

    // Данные покупателя для чека
    const customerName = `${customerInfo.lastName ?? ""} ${customerInfo.firstName ?? ""}`.trim() || "Клиент";
    const phone = normalizePhone(customerInfo.phoneNumber);
    const email = String(customerInfo.email ?? "").trim();

    if (!phone && !email) {
      return new Response(
        JSON.stringify({ error: "Customer phone or email is required for receipt" }),
        { status: 400 }
      );
    }

    // Сумма по корзине (чтобы receipt и amount точно совпали)
    const itemsTotal = cartItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 1;
      const p = Number(item.price) || 0;
      return sum + q * p;
    }, 0);

    const itemsTotalMoney = toMoney(itemsTotal);
    if (!itemsTotalMoney) {
      return new Response(JSON.stringify({ error: "Cart total is invalid" }), { status: 400 });
    }

    // Если amount пришёл — используем его только если он совпадает с корзиной до копеек
    const incomingAmountMoney = toMoney(amount);
    const finalAmount =
      incomingAmountMoney && incomingAmountMoney === itemsTotalMoney
        ? incomingAmountMoney
        : itemsTotalMoney;

    const receipt = {
      customer: {
        full_name: customerName,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
      tax_system_code: TAX_SYSTEM_CODE,
      items: cartItems.map((item) => ({
        description: String(item.name ?? "Позиция").slice(0, 128),
        quantity: Number(item.quantity) || 1,
        amount: {
          value: toMoney(item.price) ?? "0.00",
          currency: "RUB",
        },
        vat_code: VAT_CODE,
        payment_mode: "full_payment",
        // если у вас аренда/услуга — обычно service, если продажа товара — commodity
        payment_subject: item.payment_subject || DEFAULT_PAYMENT_SUBJECT,
      })),
    };

    const idempotenceKey = crypto.randomUUID();

    console.log("Sending request to YooKassa...", {
      idempotenceKey,
      finalAmount,
      itemsTotalMoney,
      customer: { phone: !!phone, email: !!email },
    });

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${SHOP_ID}:${SECRET}`).toString("base64"),
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: finalAmount,
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: `${process.env.NEXTAUTH_URL || "https://naduvnoeshow.ru"}/checkout?payment=success`,
          cancel_url: `${process.env.NEXTAUTH_URL || "https://naduvnoeshow.ru"}/checkout?payment=cancel`,
        },
        capture: true,
        description: "Заказ на naduvnoeshow.ru",
        receipt,
        metadata: {
          customer_name: customerName,
          customer_phone: customerInfo.phoneNumber,
          items_count: cartItems.length,
          order_items: JSON.stringify(
            cartItems.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            }))
          ),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YooKassa API error:", response.status, errorText);

      return new Response(
        JSON.stringify({
          error: "YooKassa API error",
          status: response.status,
          details: errorText,
        }),
        { status: 400 }
      );
    }

    const data = await response.json();
    console.log("YooKassa response:", data);

    return NextResponse.json({
      confirmation: data.confirmation,
      id: data.id,
      status: data.status,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({
        error: "Ошибка при создании платежа",
        details: error?.message || String(error),
      }),
      { status: 500 }
    );
  }
}
