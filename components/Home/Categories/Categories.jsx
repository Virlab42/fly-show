"use client";
import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import "./Categories.scss";

import "swiper/css";
import "swiper/css/navigation";

const SkeletonCategories = () => {
  return (
    <a className="skeleton-categories">
      <div className="slide-fon">
        <span className="cat-name skeleton-text">Категория</span>
        <span className="cat-count skeleton-text">товаров</span>
      </div>
    </a>
  );
};

// функция для разбиения массива по 2 элемента
function chunkArray(arr, size = 2) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

function declOfNum(number, words) {
  number = Math.abs(number) % 100;
  const n1 = number % 10;
  if (number > 10 && number < 20) return words[2];
  if (n1 > 1 && n1 < 5) return words[1];
  if (n1 === 1) return words[0];
  return words[2];
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Ошибка при получении категорий");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchCategories();
  }, []);

  // группируем по 2 категории на слайд
  const grouped = useMemo(() => chunkArray(categories, 2), [categories]);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2 className="categories-title">Категории товаров</h2>
      <Swiper slidesPerView={"auto"} spaceBetween={0} className="categories">
        {categories.length > 0 ? (
          grouped.map((pair, idx) => (
            <SwiperSlide key={idx}>
              {pair.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products/podushki?category=${encodeURIComponent(cat.name)}`}
                >
                  {cat.image?.src && <img src={cat.image.src} alt={cat.name} />}
                  <div className="slide-fon">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">
                      {cat.count}{" "}
                      {declOfNum(cat.count, [
                        "товар",
                        "товара",
                        "товаров",
                      ])}
                    </span>
                  </div>
                </Link>
              ))}
            </SwiperSlide>
          ))
        ) : (
          // Показываем 3 skeleton-слайда, пока категории не загрузились
          Array.from({ length: 6 }).map((_, i) => (
            <SwiperSlide key={i}>
              <SkeletonCategories />
              <SkeletonCategories />
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </div>
  );
}
