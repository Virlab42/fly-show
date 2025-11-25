import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const {
      name,
      phone,
      email,
      orderDetails,
      orderHtml,
      amount,
      paymentMethod,
    } = await req.json();

    console.log("Отправка email заказа от:", name);

    // Настройки для Yandex
    const transporter = nodemailer.createTransport({
      host: "smtp.yandex.ru",
      port: 465,
      secure: true, // true для порта 465
      auth: {
        user: "gigantic.fly.show.1@yandex.ru",
        pass: "vvuiluwqepksgysy",
      },
    });

    await transporter.sendMail({
      // to: "gigantic.fly.show.1@yandex.ru", // куда отправлять заказы
      to: "gigantic.fly.show.1@yandex.ru",
      from: '"🛒 Надувное Шоу" <gigantic.fly.show.1@yandex.ru>',

      subject: `🎯 Новый заказ от ${name} - ${amount} ₽`,
      text:
        orderDetails ||
        `
Новый заказ с сайта naduvnoeshow.ru

Имя: ${name}
Телефон: ${phone}
Сумма: ${amount} ₽
Способ оплаты: ${paymentMethod}

${orderDetails ? orderDetails : "Детали заказа в HTML версии"}
      `,
      html:
        orderHtml ||
        `
        <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: #f9f9f9; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #333; text-align: center; margin-top: 0; background: #4CAF50; color: white; padding: 15px; border-radius: 8px;">
              🛒 Новый заказ с сайта
            </h2>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
            <p style="margin: 8px 0; font-size: 16px;"><strong>👤 Имя:</strong> ${name}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>📞 Телефон:</strong> ${phone}</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>💰 Сумма:</strong> ${amount} ₽</p>
            <p style="margin: 8px 0; font-size: 16px;"><strong>💳 Способ оплаты:</strong> ${paymentMethod}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
            <div style="background: #fff3e0; padding: 15px; border-radius: 5px; text-align: center;">
              <h3 style="color: #e65100; margin: 0;">Детали заказа в полной версии письма</h3>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
            <p style="text-align: center; font-size: 14px; color: #888;">
              Это письмо отправлено автоматически с сайта naduvnoeshow.ru<br/>
              Пожалуйста, не отвечайте на него напрямую.
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email успешно отправлен через Yandex");
    return Response.json({ success: true });
  } catch (error) {
    console.error("Ошибка при отправке email через Yandex:", error);

    // Детальная информация об ошибке
    let errorMessage = "Failed to send email";
    if (error.code === "EAUTH") {
      errorMessage =
        "Ошибка аутентификации Yandex. Проверьте логин и пароль приложения.";
    }

    return Response.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
      },
      { status: 500 }
    );
  }
}
