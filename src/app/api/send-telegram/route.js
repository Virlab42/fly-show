import axios from 'axios';

export async function POST(req) {
  try {
    const body = await req.json(); // Получаем данные из тела запроса
    const { name, phone, message } = body;

    const CHAT_ID = '-4657131290'; // Замените на ваш Chat ID
    const BOT_TOKEN = '8393808388:AAGj6CqF57xU2W3EayKnHaa6vECVhcpvzIs'; // Замените на ваш Bot Token
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const text = `
    📌 <b>Индивидуальный заказ</b>
    👤 <b>Имя:</b> ${name}
    📞 <b>Телефон:</b> ${phone}
    💬 <b>Комментарий:</b> ${message}
    `;

    await axios.post(TELEGRAM_API_URL, {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    });

    return new Response(JSON.stringify({ success: true, message: 'Заявка отправлена!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: 'Ошибка при отправке заявки' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
