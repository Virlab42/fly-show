// app/api/rutube/route.js
import { NextResponse } from "next/server";
import xml2js from "xml2js";

export async function GET() {
  try {
    // 🔗 Замени на RSS твоего канала (получается в профиле Rutube)
    const RSS_URL = "https://rutube.ru/api/rss/person/70694673/";

    const res = await fetch(RSS_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Ошибка при получении RSS: ${res.status}` },
        { status: res.status }
      );
    }

    const xml = await res.text();

    // Парсим XML в объект
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
    const items = parsed?.rss?.channel?.item || [];

    // Если 1 элемент — оборачиваем в массив
    const clips = Array.isArray(items) ? items : [items];

    // Преобразуем данные в iframe
    const data = clips.map((clip) => {
      const videoUrl = clip.link;
      return {
        title: clip.title,
        pubDate: clip.pubDate,
        iframe: `<iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`,
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Ошибка API /api/rutube:", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
