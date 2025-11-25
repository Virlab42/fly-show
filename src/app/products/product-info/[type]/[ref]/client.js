'use client';
import './style.scss';
import { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { CartContext } from '@/cart/add/cart';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import New from '../../../../../../components/Home/New/New';

export default function ProductPage({ items: initialItems }) {
  const [product, setProduct] = useState(initialItems || null);
  const [loadingProduct, setLoadingProduct] = useState(!initialItems);
  const [variations, setVariations] = useState([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [variationsError, setVariationsError] = useState(null);

  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const descRef = useRef(null);
  const collapsedHeight = 120; // высота блока для "свёрнутого" состояния

  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(null);

  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    if (initialItems) {
      setProduct(initialItems);
      setLoadingProduct(false);

      const defaults = {};
      const defaultsArr = initialItems.default_attributes || [];
      (initialItems.attributes || []).forEach(attr => {
        const def = defaultsArr.find(
          d => String(d.name).toLowerCase() === String(attr.name).toLowerCase()
        );
        if (def && def.option) defaults[attr.name] = def.option;
        else if (attr.options && attr.options.length > 0) {
          defaults[attr.name] = attr.options[0];
        }
      });
      setSelectedAttributes(defaults);
    }
  }, [initialItems]);

  useEffect(() => {
    if (!product || product.type !== 'variable') return;

    const fetchVariations = async () => {
      try {
        setLoadingVariations(true);
        setVariationsError(null);

        const res = await fetch(`/api/variations?id=${product.id}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Ошибка при загрузке вариаций: ${res.status} ${text}`);
        }
        const data = await res.json();

        if (Array.isArray(data)) {
          setVariations(data);
        } else {
          setVariations([]);
          setVariationsError('Неверный формат вариаций');
        }
      } catch (err) {
        console.error('fetch variations error', err);
        setVariations([]);
        setVariationsError(err.message || 'Failed to load variations');
      } finally {
        setLoadingVariations(false);
      }
    };

    fetchVariations();
  }, [product]);

  // Проверка высоты описания
  useEffect(() => {
    if (descRef.current) {
      if (descRef.current.scrollHeight > collapsedHeight) {
        setShowToggle(true);
      } else {
        setShowToggle(false);
      }
    }
  }, [product?.description]);

  const toNumber = v => {
    const n = Number(String(v || '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const selectedVariation = useMemo(() => {
    if (!product || product.type !== 'variable') return null;
    if (!variations || variations.length === 0) return null;

    const requiredAttrs = (product.attributes || []).map(a => a.name);
    const allSelected = requiredAttrs.every(name => !!selectedAttributes[name]);
    if (!allSelected) return null;

    const matched = variations.find(v => {
      if (!Array.isArray(v.attributes)) return false;

      return requiredAttrs.every(attrName => {
        const selectedVal = selectedAttributes[attrName];
        return v.attributes.some(a => {
          const aName = (a.name || '').toString().toLowerCase();
          const aOption = (a.option || '').toString().toLowerCase();
          return (
            aName === attrName.toString().toLowerCase() &&
            aOption === selectedVal.toString().toLowerCase()
          );
        });
      });
    });

    return matched || null;
  }, [product, variations, selectedAttributes]);

  const minVariationPrice = useMemo(() => {
    if (!variations || variations.length === 0) return 0;
    return Math.min(...variations.map(v => toNumber(v.price || v.regular_price || 0)));
  }, [variations]);

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAttributeChange = (name, value) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    if (product.type === 'variable') {
      if (!selectedVariation) {
        alert('Пожалуйста, выберите все варианты товара.');
        return;
      }
      const attrText = (selectedVariation.attributes || [])
  .map(a => a.option)
  .join(', ');

const variationForCart = {
  ...selectedVariation,
  name: attrText ? `${product.name} (${attrText})` : product.name, // 🔥 как в модалке
  images: selectedVariation.images
    ? selectedVariation.images
    : selectedVariation.image
    ? [selectedVariation.image]
    : [],
  variation_id: selectedVariation.id,
};

      addToCart(variationForCart, quantity);
    } else {
      const productForCart = {
        ...product,
        images: product.images || (product.image ? [product.image] : []),
      };
      addToCart(productForCart, quantity);
    }
    setQuantity(1);
  };

  if (loadingProduct) {
    return <div className="spinner">Загрузка товара...</div>;
  }
  if (!product) {
    return <p>Товар не найден</p>;
  }

  const displayPrice = () => {
  if (!product) return '';

  // 🟦 SIMPLE PRODUCT
  if (product.type === 'simple') {
    const reg = toNumber(product.regular_price || product.price);
    const sale = toNumber(product.sale_price);
    if (sale && sale < reg) {
      return (
        <>
          <span className="current-price"><span className="old-price">{reg} ₽</span>{sale} ₽</span>
          
        </>
      );
    }
    return `${reg} ₽`;
  }

  // 🟪 VARIABLE PRODUCT
  if (product.type === 'variable') {
    // ✅ Если вариация выбрана — показываем её цену
    if (selectedVariation) {
      const reg = toNumber(selectedVariation.regular_price || selectedVariation.price);
      const sale = toNumber(selectedVariation.sale_price);

      if (sale && sale < reg) {
        return (
          <>
            <span className="current-price"> <span className="old-price">{reg} ₽</span>{sale} ₽</span>
            
          </>
        );
      }
      return `${reg} ₽`;
    }

    // 🟡 Если вариация НЕ выбрана — показываем "от"
    if (variations.length) {
      const regPrices = variations.map(v => toNumber(v.regular_price || v.price));
      const salePrices = variations.map(v => toNumber(v.sale_price || Infinity));

      const minReg = Math.min(...regPrices);
      const minSale = Math.min(...salePrices);

      if (minSale < minReg) {
        return (
          <>
            <span className="current-price">от <span className="old-price">{minReg} ₽</span> {minSale} ₽</span>
            
          </>
        );
      }
      return `от ${minReg} ₽`;
    }

    return 'Загрузка цены...';
  }

  return '';
};

  return (
    <>
    <div className="product-details">
      <div className="product-details__main">
        <div className="product-details__image">
          {product.images && product.images.length > 1 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              navigation={{
                nextEl: ".swiper-button-next-gallery",
                prevEl: ".swiper-button-prev-gallery",
              }}
              pagination={{ clickable: true }}
              className="page-gallery-swiper"
            >
              {product.images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img.src}
                    alt={product.name}
                    onClick={() => setCurrentImage(img.src)}
                  />
                </SwiperSlide>
              ))}
              <button className="swiper-button-prev-gallery"></button>
              <button className="swiper-button-next-gallery"></button>
            </Swiper>
          ) : (
            <img
              src={currentImage || product.images?.[0]?.src || '/no-image.png'}
              alt={product.name}
            />
          )}
        </div>

        <div className="product-details__content">
          <h1>{product.name}</h1>

          {product.type === 'variable' && (
            <div className="variations">
              {loadingVariations ? (
                <p>Загрузка вариантов...</p>
              ) : variationsError ? (
                <p style={{ color: 'red' }}>Ошибка загрузки вариантов</p>
              ) : (
                product.attributes.map(attr => (
                  <div key={attr.id || attr.name} className="variation-block">
                    <label>{attr.name}:</label>
                    <select
                      value={selectedAttributes[attr.name] || ''}
                      onChange={e => handleAttributeChange(attr.name, e.target.value)}
                    >
                      <option value="">Выберите {attr.name}</option>
                      {attr.options?.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="product-details__text-price">
            <p className="price">{displayPrice()}</p>
            <div className="price-count">
              <div>
                <button onClick={decreaseQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
              </div>
            </div>
            <button
              className="buy-button"
              onClick={handleAddToCart}
              disabled={
                product.type === 'variable' &&
                (loadingVariations || !selectedVariation)
              }
            >
              {product.type === 'variable' && !selectedVariation
                ? 'Выберите параметры'
                : 'В корзину'}
            </button>
          </div>

          <div className="description-container">
            <div
              ref={descRef}
              className={`description ${expanded ? 'expanded' : ''} ${showToggle ? '' : 'not-button'}`}
              dangerouslySetInnerHTML={{
                __html: product.description?.replace(/\n/g, '<br>') || '',
              }}
            />
            {showToggle && (
              <button
                onClick={() => setExpanded(!expanded)}
                id="toggleBtn"
              >
                {expanded ? 'Свернуть' : 'Развернуть описание'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    <New title={'Сейчас берут'} />
    </>
  );
}
