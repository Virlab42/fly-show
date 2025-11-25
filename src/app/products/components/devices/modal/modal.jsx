import React, { useState } from 'react';
import FilterAccordion from './ModalFilterAccordion'; 
import '../../modal.scss'
const Modal = ({ filters, setFilters, applyFilters, resetFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
    const updateLocalFilter = (key, value) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
  
  };
  const handleApplyFilters = () => {
    setFilters(localFilters); 
  };
  const handleResetFilters = () => {
    setLocalFilters({
      priceRange: { min: 0, max: 300000 },
        categorys: [],
    });
    resetFilters(); 
  };
  return (
    <div className="modal fade" id="exampleModal3" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Фильтры</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <FilterAccordion
                filters={localFilters}
                className="modal-filters"
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
