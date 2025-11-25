'use client'
import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { CartContext } from '@/cart/add/cart';
import VariationModal from './modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from "swiper/modules";
import "swiper/css/pagination";
import 'swiper/css';

const ProductCard = ({ item }) => {
  const { addToCart } = useContext(CartContext);
  const [showModal, setShowModal] = useState(false);

  const inStock = item.stock_status === 'instock';
  const image = item.images?.[0]?.src || '/no-image.png';
  const gallery = item.images || [];
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

  const getVariationPrices = () => {
  if (!isVariable || !item.variations_data) return null;

  const prices = item.variations_data.map(v => ({
    regular: parseFloat(v.regular_price),
    sale: v.sale_price ? parseFloat(v.sale_price) : null
  }));

  const regularPrices = prices.map(p => p.regular).filter(Boolean);
  const salePrices = prices.map(p => p.sale).filter(Boolean);

  const minRegular = Math.min(...regularPrices);
  const minSale = salePrices.length > 0 ? Math.min(...salePrices) : null;

  return { minRegular, minSale };
};

const variationPrices = getVariationPrices();

  return (
    <div className={`product-card ${!inStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-wrapper">
        {/* ✅ Галерея товара или одна картинка */}
        {gallery.length > 1 ? (
          <Swiper slidesPerView={1} spaceBetween={10} pagination={{ clickable: true }} modules={[Pagination]} className="product-gallery-swiper">
            {gallery.map((img, idx) => (
              <SwiperSlide key={idx}>
                <div className="product-image-inner">
                  <Link href={`/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`}>
                  <img
                    src={img.src}
                    alt={item.name}
                    width={150}
                    height={150}
                    className="product-image"
                  /></Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="product-image-inner">
            <Link href={`/products/product-info/podushki/${encodeURIComponent(item.name)}?id=${item.id}`}>
            <img
              src={image}
              alt={item.name}
              width={150}
              height={150}
              className="product-image"
            /></Link>
          </div>
        )}
      </div>

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
            {isVariable ? (
  variationPrices?.minSale ? (
    <p className="product-price">
      <span className="price-old">от {variationPrices.minRegular} ₽</span>
      <span className="price-sale">от {variationPrices.minSale} ₽</span>
    </p>
  ) : (
    <p className="product-price">
      от {variationPrices?.minRegular || minPrice} ₽
    </p>
  )
) : (
  item.sale_price ? (
    <p className="product-price">
      <span className="price-sale">
      <span className="price-old">{item.regular_price} ₽</span>{item.sale_price} ₽</span>
    </p>
  ) : (
    <p className="product-price">
      {item.price} ₽
    </p>
  )
)}
            <button
              className="product-button"
              onClick={() => {
                if (isVariable) {
                  setShowModal(true);
                } else {
                  addToCart(item, 1);
                }
              }}
            >
              В корзину
            </button>
          </>
        ) : (
          <p className="product-price">Нет в наличии</p>
        )}
      </div>

      {showModal && isVariable && (
        <VariationModal item={item} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

const ProductGrid = ({ items }) => {
    const { addToCart } = useContext(CartContext);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);

    const sortedItems = items.sort((a, b) => 
        a.stock_status === 'instock' && b.stock_status !== 'instock' ? -1 : 1
    );

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            scrollToTop();
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            scrollToTop();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setItemsPerPage(width < 1300 ? 22 : 9);
        };
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="grid">
            {sortedItems.length > 0 ? (
                <>
                    <div className="grid-container">
                        {currentItems.map((item) => (
                            <ProductCard key={item.id} item={item} addToCart={addToCart} />
                        ))}
                    </div>
                    <div className="pagination">
                        <button 
                            onClick={handlePreviousPage} 
                            className="pagination-button"
                            disabled={currentPage === 1}
                        >
                            Назад
                        </button>
                        <span className="pagination-info">
                            Страница {currentPage} из {totalPages}
                        </span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            Вперед
                        </button>
                    </div>
                </>
            ) : (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Товары не найдены</p>
            )}
        </div>
    );
};

export default ProductGrid;
