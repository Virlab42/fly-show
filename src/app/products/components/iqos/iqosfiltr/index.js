import React, { useState } from 'react';

const FilterAccordion = ({ filters, setFilters, applyFilters, resetFilters }) => {
 const [localFilters, setLocalFilters] = useState(filters);
 
 const updateLocalFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
};
 
     const handleApplyFilters = () => {
        setFilters(localFilters); 
        applyFilters();
    };
 
     const handleResetFilters = () => {
         setLocalFilters({
            priceRange: { min: 0, max: 30000 },
            colors: [],
            nalichie: null,
            models: [],
            exclusive: null,
            hit: null
         });
         resetFilters(); 
     };



    return (
        <>
        
        <div className="filter-main">
                <div className="accordion" id="accordionExample">
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
                                    max="30000"
                                    value={localFilters.priceRange.min}
                                    onChange={(e) =>
                                        updateLocalFilter('priceRange', { ...localFilters.priceRange, min: parseInt(e.target.value, 10) })
                                    }
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="30000"
                                    value={localFilters.priceRange.max}
                                    onChange={(e) =>
                                        updateLocalFilter('priceRange', { ...localFilters.priceRange, max: parseInt(e.target.value, 10) })
                                    }
                                />
                                <p>Выбрано: {localFilters.priceRange.min} - {localFilters.priceRange.max} ₽</p>
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingModel">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseModel"
                                aria-expanded="false"
                                aria-controls="collapseModel"
                            >
                                Модель
                            </button>
                        </h2>
                        <div id="collapseModel" className="accordion-collapse collapse" aria-labelledby="headingModel">
                            <div className="accordion-body">
                                {['One', 'Standart','Prime', 'i One', 'i Standart', 'i Prime'].map((model) => (
                                    <label key={model}>
                                        <input
                                            type="checkbox"
                                            checked={localFilters.models.includes(model)}
                                            onChange={() =>
                                                updateLocalFilter(
                                                    'models',
                                                    localFilters.models.includes(model)
                                                        ? localFilters.models.filter((f) => f !== model)
                                                        : [...localFilters.models, model]
                                                )
                                            }
                                        />
                                        {model}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    
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
                                Цвет
                            </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo">
                            <div className="accordion-body">
                                {['Серый', 'Зеленый', 'Синий', 'Бежевый', 'Красный', 'Черный', 'Оранжевый', 'Фиолетовый','Желтый', 'Смешанный'].map((color) => (
                                    <label key={color}>
                                        <input
                                            type="checkbox"
                                            checked={localFilters.colors.includes(color)}
                                            onChange={() =>
                                                updateLocalFilter(
                                                    'colors',
                                                    localFilters.colors.includes(color)
                                                        ? localFilters.colors.filter((f) => f !== color)
                                                        : [...localFilters.colors, color]
                                                )
                                            }
                                        />
                                        {color}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingFive">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseFive"
                                aria-expanded="false"
                                aria-controls="collapseFive"
                            >
                                Эксклюзив
                            </button>
                        </h2>
                        <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive">
                            <div className="accordion-body">
                                <label>
                                    <input
                                        type="radio"
                                        name="exclusive"
                                        value="true"
                                        onChange={() => updateLocalFilter('exclusive', true)}
                                        checked={localFilters.exclusive === true}
                                    />
                                    Да
                                </label>
                                <label>
                                    <input  
                                        type="radio"
                                        name="exclusive"
                                        value="false"
                                        onChange={() => updateLocalFilter('exclusive', false)}
                                        checked={localFilters.exclusive === false}
                                    />
                                    Нет
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="headingSeven">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseSeven"
                                aria-expanded="false"
                                aria-controls="collapseSeven"
                            >
                                Хит продаж
                            </button>
                        </h2>
                        <div id="collapseSeven" className="accordion-collapse collapse" aria-labelledby="headingSeven">
                            <div className="accordion-body">
                                <label>
                                    <input
                                        type="radio"
                                        name="hit"
                                        value="true"
                                        onChange={() => updateLocalFilter('hit', true)}
                                        checked={localFilters.hit === true}
                                    />
                                    Да
                                </label>
                                <label>
                                    <input  
                                        type="radio"
                                        name="hit"
                                        value="false"
                                        onChange={() => updateLocalFilter('hit', false)}
                                        checked={localFilters.hit === false}
                                    />
                                    Нет
                                </label>
                            </div>
                        </div>
                    </div>
                   
                </div>
           <div className='buttons'>
            <button className="apply-button" onClick={handleApplyFilters}>
                    Применить
                </button>
                <button className="apply-button" onClick={handleResetFilters}>
                    Сбросить   
                </button>
           </div>
          
        </div>
     
     </>
    );
};

export default FilterAccordion;
