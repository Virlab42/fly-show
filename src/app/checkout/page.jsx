"use client";
import "./style.scss";
import { useContext, useRef, useState, useMemo } from "react";
import { CartContext } from "@/cart/add/cart";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import New from "../../../components/Home/New/New";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, calculateTotalPrice, clearCart } = useContext(CartContext);
  const totalPrice = useMemo(() => calculateTotalPrice(), [cartItems]);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    lastName: "",
    phoneNumber: "",
    cdekAddress: "",
    courierAddress: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("tbank");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getProductDisplayName = (item) => {
    if (!item.attributes || item.attributes.length === 0) {
      return item.name;
    }

    const attributesText = item.attributes
      .map((attr) => {
        if (attr.option) {
          return `${attr.name}: ${attr.option}`;
        } else if (attr.value) {
          return `${attr.name}: ${attr.value}`;
        }
        return attr.name;
      })
      .join(", ");

    return `${item.name} (${attributesText})`;
  };

  const getProductLink = (item) => {
    if (item.permalink) {
      return item.permalink;
    }

    const baseUrl = "https://naduvnoeshow.ru";

    if (item.slug) {
      return `${baseUrl}/products/product-info/podushki/${item.slug}?id=${item.id}`;
    }

    if (item.name) {
      const encodedName = encodeURIComponent(item.name);
      return `${baseUrl}/products/product-info/podushki/${encodedName}?id=${item.id}`;
    }

    return `${baseUrl}/products/product-info/podushki/product?id=${item.id}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName.trim()) newErrors.lastName = "Введите имя";
    else if (!/^[а-яА-ЯёЁ\s-]+$/.test(formData.lastName)) {
      newErrors.lastName =
        "Имя должно содержать только русские буквы, пробелы и дефисы";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Введите номер телефона";
    } else if (formData.phoneNumber.replace(/\D/g, "").length < 11) {
      newErrors.phoneNumber = "Некорректный номер телефона";
    }

    const isCdekFilled = formData.cdekAddress.trim() !== "";
    const isCourierFilled = formData.courierAddress.trim() !== "";

    if (!isCdekFilled && !isCourierFilled) {
      newErrors.cdekAddress = "Заполните хотя бы один адрес доставки";
      newErrors.courierAddress = "Заполните хотя бы один адрес доставки";
    } else {
      if (isCdekFilled && !/^[а-яА-ЯёЁ0-9\s-.,]+$/.test(formData.cdekAddress)) {
        newErrors.cdekAddress =
          "Адрес должен содержать только русские буквы, цифры, пробелы и знаки препинания";
      }

      if (
        isCourierFilled &&
        !/^[а-яА-ЯёЁ0-9\s-.,/]+$/.test(formData.courierAddress)
      ) {
        newErrors.courierAddress =
          "Адрес должен содержать только русские буквы, цифры, пробелы и знаки препинания";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const input = formRef.current.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (input) input.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let isValid = true;

    if (name === "lastName") {
      isValid = /^[а-яА-ЯёЁ\s-]*$/.test(value);
    } else if (name === "cdekAddress" || name === "courierAddress") {
      isValid = /^[а-яА-ЯёЁ0-9\s-.,/]*$/.test(value);
    }

    if (isValid) {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }

      if (
        (name === "cdekAddress" || name === "courierAddress") &&
        value.trim() !== ""
      ) {
        setErrors((prev) => ({
          ...prev,
          cdekAddress: "",
          courierAddress: "",
        }));
      }
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: "" }));
  };

  const getAddressForMessage = () => {
    const cdekAddress = formData.cdekAddress.trim();
    const courierAddress = formData.courierAddress.trim();

    let addressMessage = "";

    if (cdekAddress) {
      addressMessage += `Пункт выдачи СДЭК: ${cdekAddress}\n`;
    }

    if (courierAddress) {
      addressMessage += `Адрес курьерской доставки: ${courierAddress}`;
    }

    return addressMessage;
  };

  const sendTelegramNotification = async (
    formData,
    cartItems,
    amount,
    addressMessage,
    paymentMethod,
    payId = null
  ) => {
    const message = `
🛒 *Новый заказ с сайта*

👤 *Контактные данные:*
• Имя: ${formData.lastName}
• Телефон: ${formData.phoneNumber}

📍 *Адрес доставки:*
${addressMessage}

💳 *Способ оплаты:* ${
      paymentMethod === "yookassa"
        ? "ЮKassa"
        : paymentMethod === "tbank"
        ? "Долями от Т-Банк"
        : "Выставление счёта"
    }
${payId ? `• Номер платежа: ${payId}` : ""}

📦 *Состав заказа:*
${cartItems
  .map((item, index) => {
    const productName = getProductDisplayName(item);
    const productLink = getProductLink(item);
    return `${index + 1}. ${productName}
   Количество: ${item.quantity} шт.
   Цена: ${item.price} ₽
   [Ссылка на товар](${productLink})`;
  })
  .join("\n\n")}

💰 *Общая сумма:* ${amount} ₽
`;

    try {
      const response = await fetch(
        "https://api.telegram.org/bot8393808388:AAGj6CqF57xU2W3EayKnHaa6vECVhcpvzIs/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-4657131290",
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Ошибка Telegram API", error);
      return false;
    }
  };

  const sendEmailNotification = async (
    formData,
    cartItems,
    amount,
    addressMessage,
    paymentMethod,
    payId = null
  ) => {
    try {
      // Создаем текстовое и HTML представление заказа
      const orderText = `
НОВЫЙ ЗАКАЗ С САЙТА NADUVNOESHOW.RU

👤 КОНТАКТНЫЕ ДАННЫЕ:
Имя: ${formData.lastName}
Телефон: ${formData.phoneNumber}

📍 АДРЕС ДОСТАВКИ:
${addressMessage}

💳 СПОСОБ ОПЛАТЫ: ${
        paymentMethod === "yookassa"
          ? "ЮKassa"
          : paymentMethod === "tbank"
          ? "Долями от Т-Банк"
          : "Выставление счёта"
      }
${payId ? `Номер платежа: ${payId}` : ""}

📦 СОСТАВ ЗАКАЗА:
${cartItems
  .map((item, index) => {
    const productName = getProductDisplayName(item);
    return `${index + 1}. ${productName}
     Количество: ${item.quantity} шт.
     Цена: ${item.price} ₽`;
  })
  .join("\n\n")}

💰 ОБЩАЯ СУММА: ${amount} ₽

⏰ ВРЕМЯ ЗАКАЗА: ${new Date().toLocaleString("ru-RU")}
    `.trim();

      const orderHtml = `
<div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <h2 style="color: #333; text-align: center; margin-top: 0; background: #f8f9fa; padding: 15px; border-radius: 8px;">
      🛒 Новый заказ с сайта naduvnoeshow.ru
    </h2>
    
    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #1565c0; margin-top: 0;">👤 Контактные данные</h3>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Имя:</strong> ${
        formData.lastName
      }</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>Телефон:</strong> ${
        formData.phoneNumber
      }</p>
    </div>

    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #1565c0; margin-top: 0;">📍 Адрес доставки</h3>
      <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 5px; font-family: inherit;">${addressMessage}</pre>
    </div>

    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #1565c0; margin-top: 0;">💳 Способ оплаты</h3>
      <p style="margin: 8px 0; font-size: 16px;">
        ${
          paymentMethod === "yookassa"
            ? "ЮKassa (банковская карта, СБП и др.)"
            : paymentMethod === "tbank"
            ? "Долями от Т-Банк"
            : "Выставление счёта"
        }
      </p>
      ${
        payId
          ? `<p style="margin: 8px 0; font-size: 16px;"><strong>Номер платежа:</strong> ${payId}</p>`
          : ""
      }
    </div>

    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <h3 style="color: #1565c0; margin-top: 0;">📦 Состав заказа</h3>
      ${cartItems
        .map((item, index) => {
          const productName = getProductDisplayName(item);
          const productLink = getProductLink(item);
          return `
        <div style="border-bottom: 1px solid #eee; padding: 12px 0; ${
          index === cartItems.length - 1 ? "border-bottom: none;" : ""
        }">
          <h4 style="margin: 0 0 8px 0; color: #333;">${
            index + 1
          }. ${productName}</h4>
          <p style="margin: 4px 0; color: #666;"><strong>Количество:</strong> ${
            item.quantity
          } шт.</p>
          <p style="margin: 4px 0; color: #666;"><strong>Цена:</strong> ${
            item.price
          } ₽</p>
          <p style="margin: 4px 0; color: #666;"><strong>Ссылка:</strong> 
            <a href="${productLink}" style="color: #1976d2; text-decoration: none;">${productLink}</a>
          </p>
        </div>`;
        })
        .join("")}
    </div>

    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <h2 style="color: #e65100; margin: 0; font-size: 24px;">💰 Общая сумма: ${amount} ₽</h2>
    </div>

    <div style="text-align: center; margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
      <p style="margin: 5px 0; font-size: 14px; color: #666;">
        Это письмо отправлено автоматически с сайта naduvnoeshow.ru
      </p>
      <p style="margin: 5px 0; font-size: 14px; color: #666;">
        Время заказа: ${new Date().toLocaleString("ru-RU")}
      </p>
    </div>
  </div>
</div>
    `.trim();

      // Отправляем через Yandex
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.lastName,
          phone: formData.phoneNumber,
          email: "gigantic.fly.show.1@yandex.ru",
          orderDetails: orderText,
          orderHtml: orderHtml,
          amount: amount,
          paymentMethod: paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      console.log("✅ Email отправлен успешно через Yandex");
      return true;
    } catch (error) {
      console.error("Ошибка отправки email через Yandex:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const amount = calculateTotalPrice();
    const addressMessage = getAddressForMessage();

    try {
      let telegramSent = false;
      let emailSent = false;
      let payId = null;

      if (paymentMethod === "yookassa") {
        const payRes = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            cartItems,
            customerInfo: {
              lastName: formData.lastName,
              phoneNumber: formData.phoneNumber,
            },
          }),
        });

        if (!payRes.ok) {
          const errorData = await payRes.json();
          throw new Error(
            errorData.details || `HTTP error! status: ${payRes.status}`
          );
        }

        const payData = await payRes.json();
        payId = payData.id;

        if (payData.confirmation?.confirmation_url) {
          // Отправляем уведомления перед редиректом
          telegramSent = await sendTelegramNotification(
            formData,
            cartItems,
            amount,
            addressMessage,
            paymentMethod,
            payId
          );
          emailSent = await sendEmailNotification(
            formData,
            cartItems,
            amount,
            addressMessage,
            paymentMethod,
            payId
          );

          // Очищаем корзину и редиректим на оплату
          clearCart();
          window.location.href = payData.confirmation.confirmation_url;
        } else {
          throw new Error("No confirmation URL in response");
        }
      } else if (paymentMethod === "invoice") {
        // Для выставления счета отправляем уведомления
        telegramSent = await sendTelegramNotification(
          formData,
          cartItems,
          amount,
          addressMessage,
          paymentMethod
        );
        emailSent = await sendEmailNotification(
          formData,
          cartItems,
          amount,
          addressMessage,
          paymentMethod
        );

        if (telegramSent && emailSent) {
          alert("Ваш заказ отправлен! С вами свяжется менеджер.");
        } else if (telegramSent) {
          alert("Заказ отправлен в Telegram! С вами свяжется менеджер.");
        } else if (emailSent) {
          alert("Заказ отправлен на почту! С вами свяжется менеджер.");
        } else {
          alert(
            "Заказ оформлен, но возникла проблема с уведомлениями. Мы свяжемся с вами."
          );
        }

        clearCart();
        window.location.href = "/";
      } else if (paymentMethod === "tbank") {
        console.log("[DOLYAME] start create order", {
    amount,
    itemsCount: cartItems?.length,
    customer: { lastName: formData.lastName, phoneNumber: formData.phoneNumber },
  });
  // 1) создаём заказ в Долями (на сервере, с сертификатом)
  const dolyameRes = await fetch("/api/tbank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      cartItems,
      customerInfo: {
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        // если позже добавишь email в форму — просто раскомментируй
        // email: formData.email,
      },
    }),
  });

  console.log("[DOLYAME] /api/tbank status:", dolyameRes.status);

  const dolyameJson = await dolyameRes.json().catch((e) => {
    console.log("[DOLYAME] json parse error", e);
    return null;
  });

  console.log("[DOLYAME] /api/tbank response json:", dolyameJson);

  if (!dolyameRes.ok) {
    // тут удобно видеть реальную ошибку от Долями
    throw new Error(dolyameJson?.details || dolyameJson?.error || "Ошибка Долями");
  }

  // ожидаем, что твой route.js возвращает { ok: true, data: { link, id, ... } }
  const dolyameData = dolyameJson?.data || dolyameJson;
  const dolyameLink = dolyameData?.link;
  payId = dolyameData?.id || null;

  if (!dolyameLink) {
    throw new Error("Долями не вернул ссылку (link) для редиректа");
  }

  // 2) уведомления (перед редиректом)
  telegramSent = await sendTelegramNotification(
    formData,
    cartItems,
    amount,
    addressMessage,
    paymentMethod,
    payId
  );
  emailSent = await sendEmailNotification(
    formData,
    cartItems,
    amount,
    addressMessage,
    paymentMethod,
    payId
  );

  // 3) очищаем корзину и редиректим на Долями
  clearCart();
  window.location.href = dolyameLink;
}
    } catch (err) {
      console.error("Ошибка при оформлении заказа:", err);
      alert(
        `Ошибка: ${err.message}. Пожалуйста, попробуйте еще раз или выберите другой способ оплаты.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalSubmit = () => {
    if (formRef.current) formRef.current.requestSubmit();
  };

  const router = useRouter();

  return (
    <>
      <div className="checkout-page">
        <div className="checkout-form">
          <h1>Оформление заказа</h1>
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="checkout-name">
              <h4>Контактные данные</h4>
              <input
                type="text"
                name="lastName"
                placeholder="ФИО"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "input-error" : ""}
              />
              {errors.lastName && <p className="error">{errors.lastName}</p>}

              <PhoneInput
                country="ru"
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                disableDropdown
                onlyCountries={["ru"]}
                placeholder="Введите номер телефона"
                containerStyle={{ width: "100%" }}
              />
              {errors.phoneNumber && (
                <p className="error">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="checkout-delivery">
              <h4>Адрес доставки</h4>

              <div className="checkout-delivery-address">
                <span>Если доставка в пункт СДЭК</span>
                <input
                  type="text"
                  name="cdekAddress"
                  placeholder="Адрес доставки СДЭК"
                  value={formData.cdekAddress}
                  onChange={handleInputChange}
                  className={errors.cdekAddress ? "input-error" : ""}
                />
                {errors.cdekAddress && (
                  <p className="error">{errors.cdekAddress}</p>
                )}

                <span>Если доставка курьером</span>
                <input
                  type="text"
                  name="courierAddress"
                  placeholder="Ваш адрес"
                  value={formData.courierAddress}
                  onChange={handleInputChange}
                  className={errors.courierAddress ? "input-error" : ""}
                />
                {errors.courierAddress && (
                  <p className="error">{errors.courierAddress}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="checkout-table">
          <h4>Ваша корзина</h4>
          {cartItems.length > 0 ? (
            <div>
              <ul className="cart-list">
                {cartItems.map((item) => (
                  <li key={item.id} className="cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-info">
                      <p>{item.name}</p>
                      <div className="price">
                        <p>Количество: {item.quantity}</p>
                        <p>{item.price} ₽</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="checkout-payment">
                <h4>Способ оплаты</h4>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="yookassa"
                    checked={paymentMethod === "yookassa"}
                    onChange={() => setPaymentMethod("yookassa")}
                  />
                  ЮKassa (банковская карта, СБП и др.)
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="tbank"
                    checked={paymentMethod === "tbank"}
                    onChange={() => setPaymentMethod("tbank")}
                  />
                  Долями от Т-Банк
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="invoice"
                    checked={paymentMethod === "invoice"}
                    onChange={() => setPaymentMethod("invoice")}
                  />
                  Выставление счёта
                </label>
              </div>

              <div className="checkout-total">
                <p>Итого:</p>
                <p>{calculateTotalPrice()} ₽</p>
              </div>
              <button onClick={handleExternalSubmit} disabled={isLoading}>
                {isLoading ? "Оформляем заказ..." : "Оформить заказ"}
              </button>
            </div>
          ) : (
            <div>
              <h5 style={{ textAlign: "center", marginTop: "30%" }}>
                Индивидуальный заказ
              </h5>
              <button onClick={handleExternalSubmit}>Оформить заявку</button>
            </div>
          )}
        </div>
      </div>
      <New title="Сейчас берут" />
    </>
  );
}
