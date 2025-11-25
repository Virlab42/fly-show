'use client';
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import Modal from '../modal/modal';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode } from 'swiper/modules';

const CollectionsFilter = ({
  setSearchQuery,
  searchQuery,
  setSortOrder,
  sortOrder,
  filters,
  setFilters,
  resetFilters,
  categoriesList,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [activeId, setActiveId] = useState(null);

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClick = (category) => {
    // Если нажали на ту же категорию — снимаем выделение
    if (activeId === category) {
      setActiveId(null);
      setSelectedCategory(null);
    } else {
      // Выбираем новую категорию
      setActiveId(category);
      setSelectedCategory(category);
    }
  };

  useEffect(() => {
    setActiveId(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="filter-container">
      <div className="search">
        <input
          type="text"
          placeholder="Поиск"
          onChange={handleSearchQueryChange}
          value={searchQuery || ''}
        />
      </div>
      <div className="sort-container">
        <Swiper
          slidesPerView={'auto'}
          spaceBetween={10}
          freeMode={true}
          modules={[FreeMode]}
          className="filter"
          grabCursor="true"
        >
          {categoriesList.map((cat) => (
            <SwiperSlide key={cat}>
              <button
                onClick={() => handleClick(cat)}
                className={`custom-button ${activeId === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="line"></div>
        <div className="sort">
          <div className="sort-item">
            <label htmlFor="price">Сортировка</label>
            <select id="price" name="price" onChange={handleSortChange} value={sortOrder}>
              <option value="default">По умолчанию</option>
              <option value="descending">По убыванию цены</option>
              <option value="ascending">По возрастанию цены</option>
            </select>
          </div>
          <button
            type="button"
            className="open-modal btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
              className="bi bi-filter" viewBox="0 0 16 16">
              <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>&nbsp;
            Фильтры
          </button>
          <Modal
            categoriesList={categoriesList}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default CollectionsFilter;
