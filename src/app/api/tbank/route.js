// src/app/api/tbank/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import https from "https";
import axios from "axios";
import crypto from "crypto";

export const runtime = "nodejs";

function getOrigin(req) {
  return (
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

function normalizePhone(phoneRaw) {
  if (!phoneRaw) return null;
  let digits = String(phoneRaw).replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  return "+" + digits;
}

function toPositiveNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function POST(req) {
  const correlationId = crypto.randomUUID();

  try {
    console.log("[DOLYAME] /api/tbank hit", correlationId);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "BAD_REQUEST", details: "Body is not valid JSON", correlationId },
        { status: 400 }
      );
    }

    const { amount, cartItems = [], customerInfo = {} } = body;

    // ---- ENV checks
    const login = process.env.DOLYAME_LOGIN;
    const password = process.env.DOLYAME_PASSWORD;
    const certRel = process.env.DOLYAME_CERT_PATH;
    const keyRel = process.env.DOLYAME_KEY_PATH;

    if (!login || !password || !certRel || !keyRel) {
      return NextResponse.json(
        {
          ok: false,
          error: "ENV_MISSING",
          details:
            "Missing one of: DOLYAME_LOGIN, DOLYAME_PASSWORD, DOLYAME_CERT_PATH, DOLYAME_KEY_PATH",
          correlationId,
        },
        { status: 500 }
      );
    }

    // ---- Files checks
    const certPath = path.join(process.cwd(), certRel);
    const keyPath = path.join(process.cwd(), keyRel);

    const certExists = fs.existsSync(certPath);
    const keyExists = fs.existsSync(keyPath);

    console.log("[DOLYAME] certPath:", certPath, "exists:", certExists);
    console.log("[DOLYAME] keyPath:", keyPath, "exists:", keyExists);

    if (!certExists || !keyExists) {
      return NextResponse.json(
        {
          ok: false,
          error: "CERT_KEY_NOT_FOUND",
          details: `certExists=${certExists}, keyExists=${keyExists}`,
          correlationId,
        },
        { status: 500 }
      );
    }

    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);

    // ---- Validate payload
    const amountNum = toPositiveNumber(amount);
    if (!amountNum) {
      return NextResponse.json(
        { ok: false, error: "BAD_AMOUNT", details: "amount must be a positive number", correlationId },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "EMPTY_CART", details: "cartItems must be a non-empty array", correlationId },
        { status: 400 }
      );
    }

    const items = cartItems.map((it, idx) => {
      const price = toPositiveNumber(it?.price);
      const quantity = toPositiveNumber(it?.quantity ?? 1) || 1;
      const name = (it?.name || "").trim() || "Товар";

      if (!price) throw new Error(`Bad item price at index ${idx}`);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error(`Bad item quantity at index ${idx}`);

      return {
        name,
        quantity,
        price,
        sku: it?.sku ?? null,
        receipt: null,
      };
    });

    const origin = getOrigin(req);

    // ВАЖНО: notification_url на localhost Долями не достучится (для вебхуков нужен публичный URL),
    // но это не влияет на mTLS. Оставляем, как есть, для будущего (через ngrok/staging).
    const payload = {
      order: {
        id: `ord_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        amount: Math.round(amountNum),
        prepaid_amount: 0,
        items,
        client_info: {
          first_name:
            customerInfo?.firstName ||
            customerInfo?.lastName ||
            customerInfo?.name ||
            "Покупатель",
          last_name: customerInfo?.lastName || "",
          middle_name: null,
          birthdate: null,
          phone: normalizePhone(customerInfo?.phoneNumber || customerInfo?.phone),
          email: customerInfo?.email || "test@example.com",
        },
      },
      notification_url: `${origin}/`,
      success_url: `${origin}/success`,
      fail_url: `${origin}/`,
    };

    const httpsAgent = new https.Agent({
      cert,
      key,
      servername: "partner.dolyame.ru", // на всякий случай для SNI
    });

    const auth = { username: login, password };

    console.log("[DOLYAME] sending create", {
      correlationId,
      amount: payload.order.amount,
      itemsCount: payload.order.items.length,
    });

    // Если вдруг ваш тестовый стенд реально требует create_demo, можно временно переключить сюда:
    const url = "https://partner.dolyame.ru/v1/orders/create";

    console.log("[DOLYAME] REQUEST", {
  url: "https://partner.dolyame.ru/v1/orders/create",
  headers: {
    "Content-Type": "application/json",
    "X-Correlation-ID": correlationId,
    // Authorization не логируем, но можно написать "Basic ***"
    Authorization: "Basic ***",
  },
  payload,
});

    const r = await axios.post(url, payload, {
      httpsAgent,
      auth,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-ID": correlationId,
      },
      validateStatus: () => true, // чтобы axios не бросал, а мы вернули нормальный JSON
    });

    if (r.status >= 200 && r.status < 300) {
      return NextResponse.json(
        { ok: true, data: r.data, correlationId },
        { status: 200 }
      );
    }

    // Ошибка от Долями (например FORBIDDEN)
    return NextResponse.json(
      {
        ok: false,
        error: "DOLYAME_ERROR",
        status: r.status,
        details: r.data,
        correlationId,
      },
      { status: 502 }
    );
  } catch (e) {
    console.error("[DOLYAME] route error", correlationId, e);
    return NextResponse.json(
      {
        ok: false,
        error: "SERVER_ERROR",
        details: String(e?.message || e),
        correlationId,
      },
      { status: 500 }
    );
  }
}
