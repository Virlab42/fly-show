"use client";
import '../New/New.scss';
import './Exclusive.scss';
import { useEffect, useState, useContext } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { CartContext } from '@/cart/add/cart';
import Link from 'next/link';

import 'swiper/css';
import 'swiper/css/navigation';

const SkeletonCard = () => (
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

const ProductCard = ({ item }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      <img src={item.images?.[0]?.src} alt={item.name} width={100} height={100} />

      {item.stock_status === 'instock' ? (
        <Link href={`/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`}>
          <h2 className="product-name">{item.name}</h2>
        </Link>
      ) : (
        <h2 className="product-name">{item.name}</h2>
      )}

      <div className="product-info">
        {item.stock_status === 'instock' ? (
          <>
            <p className="product-price">{item.price} ₽</p>
            <button
              className="product-button"
              onClick={() => addToCart(item, 1)}
            >
              В корзину
            </button>
          </>
        ) : (
          <p className="product-price">Нет в наличии</p>
        )}
      </div>
    </div>
  );
};

export default function Exclusive() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        // 🔹 Получаем ID категории "Наборы"
        const catRes = await fetch('https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products/categories', {
          headers: {
            Authorization: `Basic ${btoa('ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f')}`,
          },
        });
        const categories = await catRes.json();
        const setsCategory = categories.find(c => c.name === 'Наборы');
        if (!setsCategory) return;

        // 🔹 Загружаем товары постранично
        let page = 1;
        let allProducts = [];

        while (true) {
          const res = await fetch(
            `https://xn----7sbghg8bdic8bg2d.xn--p1ai/wp-json/wc/v3/products?category=${setsCategory.id}&status=publish&stock_status=instock&per_page=20&page=${page}`,
            {
              headers: {
                Authorization: `Basic ${btoa('ck_5d2dc332117170fc2f1b3ba437c9fa84291b0a23:cs_d5421f693ce776c4f371f3afad2ed3c783b5b50f')}`,
              },
            }
          );

          const text = await res.text();
          if (!text || text.startsWith("<")) break;

          let data;
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.warn("Ошибка парсинга JSON на странице", page, err);
            break;
          }

          if (!Array.isArray(data) || data.length === 0) break;

          allProducts = [...allProducts, ...data];
          if (data.length < 20) break; // последняя страница
          page++;
        }

        setItems(
          allProducts.filter(
            item =>
              item.stock_status === 'instock' &&
              item.images?.length > 0 &&
              !item.name.toLowerCase().includes('placeholder')
          )
        );
      } catch (err) {
        console.error(err);
        setError('Ошибка при загрузке категории "Наборы"');
      }
    };

    fetchSets();
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div className="new">
      <h1>Пакетные предложения</h1>
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
                <ProductCard item={item} />
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
