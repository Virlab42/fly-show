"use client";
import './New.scss';
import { useEffect, useState, useContext } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { CartContext } from '@/cart/add/cart';
import Link from 'next/link';
import VariationModal from '@/app/products/components/productgrid/modal';
import { createPortal } from "react-dom";
import 'swiper/css';
import 'swiper/css/navigation';

const SkeletonCard = () => {
  return (
    <div className={`product-card skeleton-card`}>
      <div className='skeleton-img' />
      <div className='skeleton-link'></div>
      <div className='skeleton-link'></div>
      <div className="product-info">
            <div className="skeleton-price"></div>
            <div className="skeleton-button">В корзину</div>
      </div>
    </div>
  );
};

const ProductCard = ({ item }) => {
  const { addToCart } = useContext(CartContext);
  const [showModal, setShowModal] = useState(false);

  const inStock = item.stock_status === 'instock';
  const image = item.images?.[0]?.src || '/no-image.png';
  const isVariable = item.type === 'variable';

  const getMinPrice = () => {
    if (!isVariable) return item.price;
    if (item.price_html) {
      const match = item.price_html.match(/<bdi>([\d\s.,]+) ?₽<\/bdi>/);
      return match ? match[1].replace(/\s/g, '') : item.price;
    }
    return item.price;
  };

  const minPrice = getMinPrice();

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <img src={image} alt={item.name} width={150} height={150} />
      {inStock ? (
        <Link href={`/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`}>
          <h2 className="product-name">{item.name}</h2>
        </Link>
      ) : (
        <h2 className="product-name">{item.name}</h2>
      )}
      <div className="product-info">
        {inStock ? (
          <>
            <p className="product-price">
              {isVariable ? `от ${minPrice} ₽` : `${item.price} ₽`}
            </p>
            <button
              className="product-button"
              onClick={() => {
                if (isVariable) setShowModal(true);
                else addToCart(item, 1);
              }}
            >
              В корзину
            </button>
          </>
        ) : (
          <p className="product-price">Нет в наличии</p>
        )}
      </div>

      {showModal && isVariable && createPortal(
        <VariationModal item={item} onClose={() => setShowModal(false)} />,
        document.body
      )}
    </div>
  );
};

export default function New({ title }) {
  const { addToCart } = useContext(CartContext);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchNew = async () => {
    try {
      const headers = {
        Authorization: `Basic ${btoa('ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f')}`,
      };

      // 1️⃣ Получаем тег "Новинки"
      const tagRes = await fetch('https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products/tags', { headers });
      const tags = await tagRes.json();
      const newTag = tags.find(t => t.name === 'Новинки');
      if (!newTag) return;

      // 2️⃣ Грузим товары порциями
      let allProducts = [];
      let page = 1;
      const perPage = 20; // 👈 безопасный размер страницы

      while (true) {
        const url = `https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products?page=${page}&per_page=${perPage}&tag=${newTag.id}&status=publish`;

        const res = await fetch(url, { headers });

        // если сервер отдал ошибку
        if (!res.ok) {
          console.warn(`⚠️ Ошибка ${res.status} на странице ${page}`);
          break;
        }

        // читаем ответ как текст
        const text = await res.text();

        // если это HTML — сервер заглох
        if (text.startsWith("<")) {
          console.warn("⚠️ Получен HTML вместо JSON (скорее всего, лимит WooCommerce)");
          break;
        }

        // пытаемся распарсить вручную
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn("⚠️ Некорректный JSON. Возможно, обрезанный ответ. Остановлено.");
          break;
        }

        if (!Array.isArray(data) || data.length === 0) break;

        allProducts = [...allProducts, ...data];
        console.log(`✅ Страница ${page}: загружено ${data.length} товаров`);

        // если меньше, чем perPage — больше страниц нет
        if (data.length < perPage) break;

        page++;

        // задержка между запросами — WooCommerce любит передохнуть
        await new Promise(r => setTimeout(r, 300));
      }

      const inStock = allProducts.filter(item => item.stock_status === 'instock');
      setItems(inStock);
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке новинок');
    }
  };

  fetchNew();
}, []);


  if (error) return <p>{error}</p>;

  return (
    <div className="new">
      <h1>{title}</h1>
      <Swiper
  slidesPerView={'auto'}
  spaceBetween={0}
  navigation={{
    nextEl: ".swiper-button-next-new",
    prevEl: ".swiper-button-prev-new",
  }}
  modules={[Navigation]}
  className="promo-catalog"
>
  {items.length > 0
    ? items.map(item => (
        <SwiperSlide key={item.id}>
          <ProductCard item={item} addToCart={addToCart} />
        </SwiperSlide>
      ))
    : Array.from({ length: 6 }).map((_, i) => (
        <SwiperSlide key={i}>
          <SkeletonCard />
        </SwiperSlide>
      ))}
  <button className="swiper-button-prev-new"></button>
  <button className="swiper-button-next-new"></button>
</Swiper>
    </div>
  );
}
