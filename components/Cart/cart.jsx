'use client'
import { useContext, useMemo } from 'react';
import { CartContext } from '@/cart/add/cart';
import './style.scss'
import Link from 'next/link';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, addOne, deleteOne, calculateTotalPrice } = useContext(CartContext);
  const totalPrice = useMemo(() => calculateTotalPrice(), [cartItems]);

  const checkOut = () => {
    window.location.href = '/checkout';
  };

  return (
    <div
      className="offcanvas offcanvas-end cart"
      data-bs-scroll="true"
      tabIndex="-1"
      id="cart"
      aria-labelledby="offcanvasRightLabel"
    >
      <div className="offcanvas-header cart-header">
        <h5 className="offcanvas-title" id="offcanvasRightLabel">Корзина</h5>
        <button
          type="button"
          className="btn-close cart-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>

      <div className="offcanvas-body cart-body">
        {cartItems.length > 0 ? (
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.cartKey} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />

                <div className="cart-item-info">
                  <div className="cart-item-name">
                    <p>{item.name}</p>

                    
                  </div>

                  <div className="price">
                    <div className="quantity">
                      <button onClick={() => deleteOne(item.cartKey)} disabled={item.quantity === 1}>
                        -
                      </button>
                      <p>{item.quantity}</p>
                      <button onClick={() => addOne(item.cartKey)}>+</button>
                    </div>

                    <p>{item.price} ₽</p>
                    <button onClick={() => removeFromCart(item.cartKey)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        fill="currentColor"
                        className="bi bi-x"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
            <button onClick={clearCart} className="clear">
              Очистить корзину
            </button>
          </ul>
        ) : (
          <div className="empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="90"
              height="90"
              fill="black"
              className="bi bi-cart2"
              viewBox="0 0 16 16"
            >
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
            </svg>
            <p style={{ color: 'black' }}>Корзина пуста</p>
            <button
              data-bs-dismiss="offcanvas"
              aria-label="Close"
              className="start"
            >
              Начать покупки
            </button>
          </div>
        )}
      </div>

      <div className="cart-footer">
        {cartItems.length > 0 && (
          <div className="cart-footer-buttons">
            <div className="itog">
              <p style={{ color: 'black' }}>Итоговая стоимость:</p>
              <p style={{ color: 'black' }}>{totalPrice} ₽</p>
            </div>
            <button
              className="checkout"
              onClick={checkOut}
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            >
              Перейти к оформлению
            </button>
            <button
              type="button"
              className="continue"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            >
              Продолжить покупки
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
