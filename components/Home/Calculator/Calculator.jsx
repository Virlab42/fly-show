"use client";
import "./Calculator.scss";
import React, { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientFilters from "@/app/products/podushki/client";
import CheckoutPage from "@/app/checkout/page";

const PRODUCTS = [
  {
    id: "p1",
    title: "Набор — 10 предметов",
    price: 107200,
    type: "set",
    description: "Оптимален для старта шоу.",
  },
  {
    id: "p2",
    title: "Набор — 6 предметов",
    price: 73700,
    type: "set",
    description: "Компактный набор для камерных площадок.",
  },
  { id: "p3", title: "Компактный набор «Снежки»", price: 4500, type: "set" },
  { id: "p4", title: "Подушка 1×1 м", price: 5200, type: "item" },
  { id: "p5", title: "Подушка 1×1.5 м", price: 7800, type: "item" },
  { id: "p6", title: "Подушка 3×3 м", price: 25000, type: "item" },
  { id: "p7", title: "Конь надувной", price: 15400, type: "item" },
  { id: "p8", title: "Игровой парашют", price: 21000, type: "item" },
  { id: "p9", title: "Неоновый парашют", price: 12000, type: "item" },
  {
    id: "p10",
    title: "Монтаж и настройка (услуга)",
    price: 8000,
    type: "service",
  },
];

const ADDON_PRICES = {
  tunnel: 18000,
  neonParachute: 12000,
  comboTunnelTrampoline: null,
};

const STEPS = {
  CUSTOMER_TYPE: 0,
  ORDER_TYPE: 1,
  CATALOG: 2,
  PERSONALIZATION: 3,
  ADDONS: 4,
  DELIVERY: 5,
};
const customerTypeMap = {
  phys: "Физическое лицо",
  legal: "Юридическое лицо / ИП",
  organizer: "Организатор праздников",
};

const orderTypeMap = {
  sets: "Готовые наборы",
  custom: "Индивидуально",
};

const brandColorsMap = {
  standard: "Стандартные цвета",
  blackwhite: "Чёрно-белая палитра",
  palette: "Индивидуальная палитра",
};

const addonsMap = {
  tunnel: "Тоннель",
  neonParachute: "Неоновый парашют",
  comboTunnelTrampoline: "Комбо: Тоннель + подушка-батут",
};
const totalSteps = Object.keys(STEPS).length;

const validDeliveryMethods = ["pickup", "courier", "transport"];

function formatPrice(n) {
  if (typeof n !== "number") return "Цена по запросу";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

const StepWrapper = ({ title, subtitle, children }) => (
  <div className="step-wrapper">
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
    <div className="step-content">{children}</div>
  </div>
);

const StepIndicator = ({ current, total }) => (
  <div className="step-indicator">
    {Array.from({ length: total }).map((_, idx) => (
      <div
        key={idx}
        className={`step-indicator__bar ${idx <= current ? "active" : ""}`}
      />
    ))}
  </div>
);

const Card = ({
  selected,
  onClick,
  title,
  description,
  footer,
  children,
  isSelected,
}) => (
  <div onClick={onClick} className={`card ${selected ? "selected" : ""}`}>
    <div className="card__header">
      <div>
        <h3>{title}</h3>
        {description && <div className="card__description">{description}</div>}
      </div>
      {selected && <span className="card__header-badge">Выбрано</span>}
    </div>
    {children && <div className="card__children">{children}</div>}
    {footer && <div className="card__footer">{footer}</div>}
  </div>
);

const NavBar = ({ onBack, onNext, disableNext, isLast, onFinalSubmit }) => (
  <div className="navbar">
    <button onClick={onBack}>Назад</button>
    {isLast ? (
      <button className="next" onClick={onFinalSubmit} disabled={disableNext}>
        Оформить
      </button>
    ) : (
      <button className="next" onClick={onNext} disabled={disableNext}>
        Далее
      </button>
    )}
  </div>
);

const validateDeliveryForm = (deliveryData) => {
  const errors = {};

  if (!deliveryData.name.trim()) {
    errors.name = "Имя обязательно для заполнения";
  } else if (deliveryData.name.trim().length < 2) {
    errors.name = "Имя должно содержать минимум 2 символа";
  } else if (deliveryData.name.trim().length > 50) {
    errors.name = "Имя не должно превышать 50 символов";
  } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/.test(deliveryData.name.trim())) {
    errors.name =
      "Имя может содержать только буквы, пробелы, дефисы и апострофы";
  }

  if (!deliveryData.phone.trim()) {
    errors.phone = "Телефон обязателен для заполнения";
  } else {
    const digitsOnly = deliveryData.phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      errors.phone = "Телефон должен содержать минимум 10 цифр";
    } else if (digitsOnly.length > 15) {
      errors.phone = "Телефон не должен содержать больше 15 цифр";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(deliveryData.phone)) {
      errors.phone =
        "Телефон может содержать только цифры, пробелы, дефисы, плюсы и скобки";
    }
  }

  if (deliveryData.city.trim()) {
    if (deliveryData.city.trim().length < 2) {
      errors.city = "Город/Страна должны содержать минимум 2 символа";
    } else if (deliveryData.city.trim().length > 100) {
      errors.city = "Город/Страна не должны превышать 100 символов";
    } else if (
      !/^[a-zA-Zа-яА-ЯёЁ0-9\s\-\.,]+$/.test(deliveryData.city.trim())
    ) {
      errors.city =
        "Город/Страна могут содержать буквы, цифры, пробелы, дефисы, точки и запятые";
    }
  }

  if (deliveryData.comment.trim().length > 500) {
    errors.comment = "Комментарий не должен превышать 500 символов";
  }

  return errors;
};

export default function OrderCalculator() {
  const [step, setStep] = useState(STEPS.CUSTOMER_TYPE);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formErrors, setFormErrors] = useState({});



  const [state, setState] = useState({
    orderType: null,
    selectedProductIds: [],
    personalization: { logo: false, brandColors: "", notes: "" },
    addons: {
      tunnel: false,
      neonParachute: false,
      comboTunnelTrampoline: false,
    },
    delivery: {
      name: "",
      phone: "",
      city: "",
      method: "transport",
      comment: "",
    },
    customerType: null,
    priceRange: { min: 0, max: 300000 },
  });

const personalizationList = useMemo(() => {
  const items = [];
  if (state.personalization.logo) items.push("Логотип на подушках");
  if (state.personalization.brandColors) {
    items.push(`Цвета: ${brandColorsMap[state.personalization.brandColors]}`);
  }
  return items.length ? items.join(", ") : "—";
}, [state.personalization]);

const addonsList = useMemo(() => {
  return Object.entries(state.addons)
    .filter(([_, value]) => value)
    .map(([key]) => addonsMap[key])
    .join(", ") || "—";
}, [state.addons]);

  const selectedProducts = useMemo(
    () =>
      state.selectedProductIds
        .map((id) => PRODUCTS.find((p) => p.id === id))
        .filter(Boolean),
    [state.selectedProductIds]
  );

  const { subtotal, addonTotal, total, hasPOA } = useMemo(() => {
    let prodSum = 0;
    let priceOnAsk = false;
    selectedProducts.forEach((p) => {
      if (p.price === null) priceOnAsk = true;
      else prodSum += p.price;
    });

    let addonsSum = 0;
    Object.keys(state.addons).forEach((k) => {
      if (state.addons[k]) {
        const p = ADDON_PRICES[k];
        if (p === null) priceOnAsk = true;
        else addonsSum += p;
      }
    });

    const logoFee = state.personalization.logo ? 3000 : 0;
    addonsSum += logoFee;

    return {
      subtotal: prodSum,
      addonTotal: addonsSum,
      total: prodSum + addonsSum,
      hasPOA: priceOnAsk,
    };
  }, [state, selectedProducts]);

  const canNext = useMemo(() => {
    switch (step) {
      case STEPS.CUSTOMER_TYPE:
        return Boolean(state.customerType);
      case STEPS.ORDER_TYPE:
        return Boolean(state.orderType);
      case STEPS.DELIVERY:
        const errors = validateDeliveryForm(state.delivery);
        return Object.keys(errors).length === 0;
      default:
        return true;
    }
  }, [step, state]);

  const toggleProduct = useCallback((id) => {
    if (!PRODUCTS.some((p) => p.id === id)) {
      console.warn(`Invalid product ID: ${id}`);
      return;
    }
    setState((p) => ({
      ...p,
      selectedProductIds: p.selectedProductIds.includes(id)
        ? p.selectedProductIds.filter((x) => x !== id)
        : [...p.selectedProductIds, id],
    }));
  }, []);

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          !p.price ||
          (p.price >= state.priceRange.min && p.price <= state.priceRange.max)
      ),
    [state.priceRange]
  );

  const goNext = useCallback(() => {
  if (step === STEPS.DELIVERY) {
    const errors = validateDeliveryForm(state.delivery);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
  }

  if (isNavigating || !canNext) return;
  setIsNavigating(true);

  // Определяем следующий шаг
  let nextStep = step + 1;

  // Если заказ индивидуальный, пропускаем каталог
  if (step === STEPS.ORDER_TYPE && state.orderType === "custom") {
    nextStep = STEPS.PERSONALIZATION;
  }

  setStep(Math.min(nextStep, totalSteps - 1));
  setTimeout(() => setIsNavigating(false), 500);
}, [canNext, isNavigating, step, state]);


  const goBack = useCallback(() => {
  let prevStep = step - 1;

  // Пропускаем каталог, если индивидуальный заказ
  if (step === STEPS.PERSONALIZATION && state.orderType === "custom") {
    prevStep = STEPS.ORDER_TYPE;
  }

  setStep(Math.max(prevStep, 0));
}, [step, state.orderType]);


  const handleMinPriceChange = useCallback((e) => {
    const value = Number(e.target.value);
    setState((p) => ({
      ...p,
      priceRange: {
        ...p.priceRange,
        min: Math.min(value, p.priceRange.max),
      },
    }));
  }, []);

  const handleMaxPriceChange = useCallback((e) => {
    const value = Number(e.target.value);
    setState((p) => ({
      ...p,
      priceRange: {
        ...p.priceRange,
        max: Math.max(value, p.priceRange.min),
      },
    }));
  }, []);

  const handleDeliveryMethodChange = useCallback((method) => {
    if (!validDeliveryMethods.includes(method)) return;
    setState((p) => ({
      ...p,
      delivery: { ...p.delivery, method },
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState({
      orderType: null,
      selectedProductIds: [],
      personalization: { logo: false, brandColors: "", notes: "" },
      addons: {
        tunnel: false,
        neonParachute: false,
        comboTunnelTrampoline: false,
      },
      delivery: {
        name: "",
        phone: "",
        city: "",
        method: "transport",
        comment: "",
      },
      customerType: null,
      priceRange: { min: 0, max: 300000 },
    });
    setSubmitError(null);
    setFormErrors({});
  }, []);

  const handleDeliveryFieldChange = useCallback(
    (field, value) => {
      setState((p) => ({
        ...p,
        delivery: { ...p.delivery, [field]: value },
      }));
      if (formErrors[field]) {
        setFormErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [formErrors]
  );

  const handleOrderTypeSelect = useCallback((type) => {
    setState((p) => ({
      ...p,
      orderType: type,
    }));
  }, []);

  const sendToTelegram = async () => {
    const errors = validateDeliveryForm(state.delivery);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];

      setTimeout(() => {
        const firstErrorElement = document.querySelector(".field-error");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
      return;
    }

    if (isSubmitting || !canNext) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const customerTypeMap = {
        phys: "Физическое лицо",
        legal: "Юридическое лицо / ИП",
        organizer: "Организатор праздников",
      };

      const orderTypeMap = {
        sets: "Готовые наборы",
        custom: "Индивидуально",
      };

      const brandColorsMap = {
        standard: "Стандартные цвета",
        blackwhite: "Чёрно-белая палитра",
        palette: "Индивидуальная палитра",
      };

      const productName = (item) =>
        `${item.title}${item.description ? ` — ${item.description}` : ""}`;

      const selectedProductsList = selectedProducts.map(productName).join("\n");
      const addonsList = Object.entries(state.addons)
        .filter(([key, value]) => value)
        .map(([key]) => {
          const names = {
            tunnel: "Тоннель",
            neonParachute: "Неоновый парашют",
            comboTunnelTrampoline: "Комбо: Тоннель + подушка-батут",
          };
          return names[key];
        })
        .join("\n");

      const personalizationItems = [];
      if (state.personalization.logo)
        personalizationItems.push("Логотип на подушках");
      if (state.personalization.brandColors !== "") {
        personalizationItems.push(
          `Цвета: ${brandColorsMap[state.personalization.brandColors]}`
        );
      }
      const personalizationList =
        personalizationItems.join(", ") || "Не выбрано";

      const message = `
📌 *НОВЫЙ ЗАКАЗ!* 📌

👤 *Клиент:* ${customerTypeMap[state.customerType]}
📦 *Тип заказа:* ${orderTypeMap[state.orderType]}

🛒 *Товары:*
${selectedProductsList || "—"}

🎨 *Персонализация:* 
${personalizationList}

➕ *Дополнительно:*
${addonsList || "—"}

💰 *Стоимость:*
Сумма: ${formatPrice(total)}
(Субтотал: ${formatPrice(subtotal)}, Дополнительно: ${formatPrice(addonTotal)})

🚚 *Доставка:*
Имя: ${state.delivery.name}
Телефон: ${state.delivery.phone}
Город: ${state.delivery.city || "Не указан"}
Способ: ${
        state.delivery.method === "pickup"
          ? "Самовывоз"
          : state.delivery.method === "courier"
          ? "Курьер"
          : "Транспортная компания"
      }
Комментарий: ${state.delivery.comment || "—"}

⏳ *Дата и время:* ${new Date().toLocaleString("ru-RU")}
`;

      const response = await fetch("/api/telegram-proxi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: "-4209280426",
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Ошибка от прокси:", errorData);
        throw new Error(
          `Ошибка сервера: ${response.status} - ${
            errorData.error || "Неизвестная ошибка от прокси"
          }`
        );
      }

      const result = await response.json();

      if (result && result.ok === false) {
        throw new Error(result.description || "Ошибка от Telegram API");
      }

      alert("✅ Ваш заказ отправлен! Мы свяжемся с вами в ближайшее время.");
      console.log("✅ Сообщение успешно отправлено в Telegram через прокси!");

      resetForm();
    } catch (error) {
      console.error("❌ Ошибка отправки в Telegram:", error);
      setSubmitError(
        `❌ Не удалось отправить заказ: ${error.message}. Попробуйте снова или свяжитесь с нами по телефону.`
      );
    } finally {
      setIsSubmitting(false);
      setStep(STEPS.CUSTOMER_TYPE);
    }
  };

  const handleFinalSubmit = () => {
    sendToTelegram();
  };

  return (
    <div id="calc" className="calculator">
      <div className="calculator__header">
        <h2>Калькулятор заказа</h2>
        <p>Соберите заказ по шагам — удобно и быстро</p>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      {submitError && <div className="submit-error">{submitError}</div>}

      <AnimatePresence mode="popLayout">
        {step === STEPS.CUSTOMER_TYPE && (
          <motion.div
            key="step-customer-type"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Кто вы?"
              subtitle="Нужно для документов и условий работы"
            >
              <div className="steps__grid">
                <Card
                  selected={state.customerType === "phys"}
                  onClick={() =>
                    setState((p) => ({ ...p, customerType: "phys" }))
                  }
                  title="Физическое лицо"
                  description="Частный заказ для дома или аниматора"
                />
                <Card
                  selected={state.customerType === "legal"}
                  onClick={() =>
                    setState((p) => ({ ...p, customerType: "legal" }))
                  }
                  title="Юридическое лицо / ИП"
                  description="Для договоров, счётов и массовых закупок"
                />
                <Card
                  selected={state.customerType === "organizer"}
                  onClick={() =>
                    setState((p) => ({ ...p, customerType: "organizer" }))
                  }
                  title="Организатор праздников"
                  description="Ивент-агентства и аниматоры с регулярными заказами"
                />
              </div>
            </StepWrapper>
            <NavBar onBack={goBack} onNext={goNext} disableNext={!canNext} />
          </motion.div>
        )}

        {step === STEPS.ORDER_TYPE && (
          <motion.div
            key="step-order-type"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Тип заказа"
              subtitle="Выберите подходящий формат оформления"
            >
              <div className="steps__grid">
                <Card
                  selected={state.orderType === "sets"}
                  onClick={() => handleOrderTypeSelect("sets")}
                  title="Готовые наборы"
                  description="Быстрый старт: фиксированная цена и содержимое."
                  footer={<span>Раздел — наборы и товары</span>}
                />
                <Card
                  selected={state.orderType === "custom"}
                  onClick={() => handleOrderTypeSelect("custom")}
                  title="Индивидуально"
                  description="Под ваши задачи: конфигурация, цвета, бренд."
                  footer={<span>Смета — по запросу</span>}
                />
              </div>
            </StepWrapper>
            <NavBar onBack={goBack} onNext={goNext} disableNext={!canNext} />
          </motion.div>
        )}

        {step === STEPS.CATALOG && (
          <motion.div
            key="step-catalog"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Каталог"
              subtitle="Добавьте понравившиеся товары"
            >
              <div className="products-container products-container-calc">
                <ClientFilters items={[]} />
              </div>
            </StepWrapper>
            <NavBar onBack={goBack} onNext={goNext} disableNext={!canNext} />
          </motion.div>
        )}

        {step === STEPS.PERSONALIZATION && (
          <motion.div
            key="step-personalization"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Персонализация"
              subtitle="Сделаем реквизит вашим"
            >
              <div className="steps__grid">
                <Card
                  selected={state.personalization.logo}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      personalization: {
                        ...p.personalization,
                        logo: !p.personalization.logo,
                      },
                    }))
                  }
                  title="Логотип на подушках"
                  description="Добавим фирменный знак на выбранные элементы."
                  footer={<span>+ {formatPrice(3000)} к заказу</span>}
                />
                <Card
                  selected={state.personalization.brandColors === "blackwhite"}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      personalization: {
                        ...p.personalization,
                        brandColors: "blackwhite",
                      },
                    }))
                  }
                  title="Чёрно-белая палитра"
                  description="Минимализм и графика — строгий стиль."
                />
                <Card
                  selected={state.personalization.brandColors === "palette"}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      personalization: {
                        ...p.personalization,
                        brandColors: "palette",
                      },
                    }))
                  }
                  title="Индивидуальная палитра"
                  description="Подберём цвета по вашему референсу — загрузите палитру или укажите HEX-коды."
                />
                <Card
                  selected={state.personalization.brandColors === "standard"}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      personalization: {
                        ...p.personalization,
                        brandColors: "standard",
                      },
                    }))
                  }
                  title="Стандартные цвета"
                  description="Ярко и весело — классическая палитра."
                />
              </div>
            </StepWrapper>
            <NavBar onBack={goBack} onNext={goNext} disableNext={!canNext} />
          </motion.div>
        )}

        {step === STEPS.ADDONS && (
          <motion.div
            key="step-addons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Дополнительные опции"
              subtitle="Расширьте возможности шоу"
            >
              <div className="steps__grid">
                <Card
                  selected={state.addons.tunnel}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      addons: { ...p.addons, tunnel: !p.addons.tunnel },
                    }))
                  }
                  title="Тоннель"
                  description="Динамичный аттракцион для детей."
                  footer={
                    <span>
                      {ADDON_PRICES.tunnel
                        ? `+ ${formatPrice(ADDON_PRICES.tunnel)}`
                        : "Цена по запросу"}
                    </span>
                  }
                />
                <Card
                  selected={state.addons.neonParachute}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      addons: {
                        ...p.addons,
                        neonParachute: !p.addons.neonParachute,
                      },
                    }))
                  }
                  title="Неоновый парашют"
                  description="Яркий визуальный эффект под музыку."
                  footer={
                    <span>
                      {ADDON_PRICES.neonParachute
                        ? `+ ${formatPrice(ADDON_PRICES.neonParachute)}`
                        : "Цена по запросу"}
                    </span>
                  }
                />
                <Card
                  selected={state.addons.comboTunnelTrampoline}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      addons: {
                        ...p.addons,
                        comboTunnelTrampoline: !p.addons.comboTunnelTrampoline,
                      },
                    }))
                  }
                  title="Комбо: Тоннель + подушка-батут"
                  description="Выгодный комплект для масштабного праздника."
                  footer={<span>Цена по запросу</span>}
                />
              </div>
            </StepWrapper>
            <NavBar onBack={goBack} onNext={goNext} disableNext={!canNext} />
          </motion.div>
        )}

        {step === STEPS.DELIVERY && (
          <motion.div
            key="step-delivery"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <StepWrapper
              title="Доставка и контакты"
              subtitle="Чтобы мы связались и уточнили детали"
            >
              <CheckoutPage
    customerType={customerTypeMap[state.customerType]}
    orderType={orderTypeMap[state.orderType]}
    personalization={personalizationList}
    addons={addonsList}
  />
            </StepWrapper>
            <div className="navbar">
              <button onClick={goBack}>Назад</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
