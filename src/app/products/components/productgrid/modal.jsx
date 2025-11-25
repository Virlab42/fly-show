'use client'
import { useState, useEffect, useContext } from 'react';
import { CartContext } from '@/cart/add/cart';
import './variationmodal.scss';

const VariationModal = ({ item, onClose }) => {
  const { addToCart } = useContext(CartContext);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableVariations, setAvailableVariations] = useState([]);
  const [currentVariation, setCurrentVariation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVariations() {
      try {
        setLoading(true);
        const res = await fetch(`/api/variations?id=${item.id}`);
        const data = await res.json();
        setAvailableVariations(data);

        // выставляем дефолтные атрибуты
        const defaults = {};
        item.attributes.forEach(attr => {
          const defaultOption = attr.default || attr.options[0];
          if (defaultOption) defaults[attr.name] = defaultOption;
        });
        setSelectedAttributes(defaults);
      } catch (e) {
        console.error('Error fetching variations', e);
      } finally {
        setLoading(false);
      }
    }
    fetchVariations();
  }, [item]);

  useEffect(() => {
    if (!availableVariations.length) return;

    const matched = availableVariations.find(variation =>
      item.attributes.every(attr => {
        const selected = selectedAttributes[attr.name];
        return variation.attributes.some(a => a.name === attr.name && a.option === selected);
      })
    );
    setCurrentVariation(matched || null);
  }, [selectedAttributes, availableVariations, item.attributes]);

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
  };

  const handleAddToCart = () => {
    if (currentVariation) {
      const attrText = (currentVariation?.attributes || [])
  .map(a => a.option)
  .join(', ');

const productForCart = {
  ...currentVariation,
  name: attrText ? `${item.name} (${attrText})` : item.name,
  image: item.images?.[0] || null,
};
      addToCart(productForCart, 1);
      onClose();
    }
  };

  return (
    <div className="variation-modal">
      <div className="modal-backdrop" onClick={onClose}>
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close" onClick={onClose}></button>
            <h2>{item.name}</h2>

            {item.attributes.map(attr => (
              <div key={attr.name} className="variation-attr">
                <label>{attr.name}:</label>
                <select
                  value={selectedAttributes[attr.name] || ''}
                  onChange={e => handleAttributeChange(attr.name, e.target.value)}
                >
                  {attr.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <p className="variation-price">
              {currentVariation ? `${currentVariation.price} ₽` : 'Выберите все параметры'}
            </p>

            <button
              className="product-button"
              onClick={handleAddToCart}
              disabled={!currentVariation}
            >
              Добавить в корзину
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariationModal;
