import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return new Response(JSON.stringify({ error: "Payment ID is required" }), {
        status: 400,
      });
    }

    // Проверяем статус платежа в ЮKassa
    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET}`
            ).toString("base64"),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`YooKassa API error: ${response.status}`);
    }

    const paymentData = await response.json();

    return NextResponse.json({
      status: paymentData.status,
      paid: paymentData.paid,
      amount: paymentData.amount,
      metadata: paymentData.metadata,
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check payment status" }),
      { status: 500 }
    );
  }
}
