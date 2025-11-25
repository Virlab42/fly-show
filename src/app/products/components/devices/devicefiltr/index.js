'use client';
import React, { useState, useEffect } from 'react';



const FilterAccordion = ({
  categoriesList,
  selectedCategory,
  setSelectedCategory,
  filters,
  setFilters,
  resetFilters
}) => {
  const [localCategories, setLocalCategories] = useState(selectedCategory || []);
  const [localPrice, setLocalPrice] = useState({ ...filters.priceRange });

  useEffect(() => {
    setLocalCategories(selectedCategory || []);
    setLocalPrice({ ...filters.priceRange });
  }, [selectedCategory, filters.priceRange]);

  const toggleCategory = (category) => {
    const newCategories = localCategories.includes(category)
      ? localCategories.filter(c => c !== category)
      : [...localCategories, category];
    setLocalCategories(newCategories);
  };

  const updatePrice = (type, value) => {
    setLocalPrice(prev => ({ ...prev, [type]: parseInt(value, 10) }));
  };

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, priceRange: localPrice }));
    setSelectedCategory(localCategories);
  };

  const resetAllFilters = () => {
    const resetPrice = { min: 0, max: 300000 };
    setLocalPrice(resetPrice);
    setLocalCategories([]);
    setFilters(prev => ({ ...prev, priceRange: resetPrice }));
    setSelectedCategory([]);
    resetFilters();
  };

  return (
    <div className="filter-main">
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
                value={localPrice.min}
                onChange={e => updatePrice('min', e.target.value)}
              />
              <input
                type="range"
                min="0"
                max="300000"
                value={localPrice.max}
                onChange={e => updatePrice('max', e.target.value)}
              />
              <p>Выбрано: {localPrice.min} - {localPrice.max} ₽</p>
            </div>
          </div>
        </div>

        {/* Категории */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingTwo">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="true"
              aria-controls="collapseTwo"
            >
              Категории
            </button>
          </h2>
          <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo">
            <div className="accordion-body">
              {categoriesList.map(category => (
                <label key={category} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    checked={localCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="buttons" style={{ marginTop: '10px' }}>
        <button className="apply-button" onClick={handleApplyFilters}>Применить</button>
        <button className="apply-button" onClick={resetAllFilters}>Сбросить</button>
      </div>
    </div>
  );
};

export default FilterAccordion;
