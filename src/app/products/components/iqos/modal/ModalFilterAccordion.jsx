'use client'

import React from 'react';

const ModalFilterAccordion = ({ categoriesList = [], filters, updateLocalFilter }) => {
  // переключатель категории — обновляет локальный filters.categorys через callback
  const toggleCategory = (category) => {
    const current = filters?.categorys || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updateLocalFilter('categorys', updated);
  };

  const updatePriceMin = (val) => {
    updateLocalFilter('priceRange', { ...filters.priceRange, min: parseInt(val, 10) || 0 });
  };

  const updatePriceMax = (val) => {
    updateLocalFilter('priceRange', { ...filters.priceRange, max: parseInt(val, 10) || 0 });
  };

  return (
    <div className="modal-filters">
      <div className="accordion" id="accordionExample">
        {/* Цена */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              Цена
            </button>
          </h2>
          <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne">
            <div className="accordion-body">
              <input
                type="range"
                min="0"
                max="300000"
                value={filters.priceRange.min}
                onChange={(e) => updatePriceMin(e.target.value)}
              />
              <input
                type="range"
                min="0"
                max="300000"
                value={filters.priceRange.max}
                onChange={(e) => updatePriceMax(e.target.value)}
              />
              <p>Выбрано: {filters.priceRange.min} - {filters.priceRange.max} ₽</p>
            </div>
          </div>
        </div>

        {/* Категории */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              Категории
            </button>
          </h2>
          <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo">
            <div className="accordion-body">
              {categoriesList.map((category) => (
                <label key={category} style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={(filters.categorys || []).includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalFilterAccordion;
