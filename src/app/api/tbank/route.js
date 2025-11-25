// app/api/tbank/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 });
    }

    const shopId = process.env.TBANK_SHOP_ID;
    const showcaseId = process.env.TBANK_SHOWCASE_ID;
    const secret = process.env.TBANK_SECRET;

    const orderNumber = 'ORD' + Date.now();
    const sum = Math.round(amount * 100); // в копейках

    // Подпись по схеме: shopId:orderNumber:sum:secret
    const signString = `${shopId}:${orderNumber}:${sum}:${secret}`;
    const sign = crypto.createHash('sha256').update(signString).digest('hex');

    return NextResponse.json({ shopId, showcaseId, orderNumber, sum, sign });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
