'use client'

import React, { useState, useEffect } from 'react';
import FilterAccordion from './ModalFilterAccordion'; 
import '../../modal.scss'

const Modal = ({ filters, setFilters, resetFilters, setSelectedCategory, selectedCategory, categoriesList }) => {
  // локальная копия фильтров (чтобы изменения не ломали глобальные пока не нажали Apply)
  const [localFilters, setLocalFilters] = useState(
    filters ?? { priceRange: { min: 0, max: 300000 }, categorys: [] }
  );

  // при открытии/изменении входных данных — синхронизируем локальную копию
  useEffect(() => {
    setLocalFilters({
      priceRange: (filters && filters.priceRange) ? { ...filters.priceRange } : { min: 0, max: 300000 },
      // если выбранные категории уже хранятся в selectedCategory — берем их, иначе берем из filters
      categorys: (selectedCategory && selectedCategory.length > 0)
        ? [...selectedCategory]
        : (filters && filters.categorys ? [...filters.categorys] : []),
    });
  }, [filters, selectedCategory]);

  const updateLocalFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    // применяем в глобальные фильтры
    setFilters(localFilters);
    // синхронизируем выбранные категории, чтобы client.js увидел их (фильтрация идёт по selectedCategory)
    if (typeof setSelectedCategory === 'function') {
      setSelectedCategory(localFilters.categorys || []);
    }
  };

  const handleResetFilters = () => {
    const reset = {
      priceRange: { min: 0, max: 300000 },
      categorys: [],
    };
    setLocalFilters(reset);
    setFilters(reset);
    if (typeof setSelectedCategory === 'function') setSelectedCategory([]);
    resetFilters();
  };

  return (
    <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Фильтры</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <FilterAccordion
              categoriesList={categoriesList}
              // сюда передаём ЛОКАЛЬНУЮ копию фильтров и updateLocalFilter
              filters={localFilters}
              updateLocalFilter={updateLocalFilter}
            />
          </div>
          <div className="modal-footer">
            <div className='buttons'>
              <button className="apply-button" onClick={handleApplyFilters} data-bs-dismiss="modal" aria-label="Close">
                Применить
              </button>
              <button className="apply-button" onClick={handleResetFilters} data-bs-dismiss="modal" aria-label="Close">
                Сбросить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
