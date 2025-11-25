import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, cartItems, customerInfo } = body;

    console.log("Received payment request:", {
      amount,
      cartItems,
      customerInfo,
    });

    // Проверяем обязательные поля
    if (!amount || !cartItems || !customerInfo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Формируем описание заказа
    const itemsDescription = cartItems
      .map((item) => `${item.name} - ${item.quantity} шт.`)
      .join(", ");

    const description = `Заказ от ${customerInfo.lastName}. ${itemsDescription}`;

    // Подготавливаем данные для чека
    const receipt = {
      customer: {
        full_name: customerInfo.lastName,
        phone: customerInfo.phoneNumber,
      },
      items: cartItems.map((item) => ({
        description: item.name.substring(0, 128), // Ограничение ЮKassa
        quantity: item.quantity.toString(),
        amount: {
          value: (item.price * item.quantity).toFixed(2),
          currency: "RUB",
        },
        vat_code: "1",
        payment_mode: "full_payment",
        payment_subject: "commodity",
      })),
    };

    // Проверяем наличие переменных окружения
    if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET) {
      console.error("Missing YooKassa credentials");
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        { status: 500 }
      );
    }

    const idempotenceKey = crypto.randomUUID();

    console.log("Sending request to YooKassa...");

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET}`
          ).toString("base64"),
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: `${
            process.env.NEXTAUTH_URL || "https://naduvnoeshow.ru"
          }/checkout?payment=success`,
          cancel_url: `${
            process.env.NEXTAUTH_URL || "https://naduvnoeshow.ru"
          }/checkout?payment=cancel`,
        },
        capture: true,
        description: description,
        receipt: receipt,
        metadata: {
          customer_name: customerInfo.lastName,
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
      throw new Error(`YooKassa API returned ${response.status}: ${errorText}`);
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
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
