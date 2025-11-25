"use client";
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const generateCartKey = (product) => {
    const attributes = product.attributes || [];
    const attrString = attributes
      .map((a) => `${a.name}:${a.option || a.value}`)
      .join("|");
    return `${product.variation_id || product.id}-${attrString}`;
  };

  const addToCart = (product, quantity = 1) => {
    const price = Number(product.price) || 0;
    const cartKey = generateCartKey(product);
    const existingProduct = cartItems.find((item) => item.cartKey === cartKey);

    const image = product.image?.src || product.images?.[0]?.src || "";
    const attributes = product.attributes || [];
    const permalink = product.permalink || "";

    let updatedCart;
    if (existingProduct) {
      updatedCart = cartItems.map((item) =>
        item.cartKey === cartKey
          ? {
              ...item,
              quantity: item.quantity + quantity,
              price: (item.quantity + quantity) * price,
            }
          : item
      );
    } else {
      updatedCart = [
        ...cartItems,
        {
          cartKey,
          id: product.variation_id || product.id,
          name: product.name,
          price: price * quantity,
          image,
          quantity,
          attributes,
          permalink,
          unitPrice: price,
        },
      ];
    }

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const addOne = (cartKey) => {
    const updatedCart = cartItems.map((item) =>
      item.cartKey === cartKey
        ? {
            ...item,
            quantity: item.quantity + 1,
            price:
              (item.quantity + 1) *
              (item.unitPrice || item.price / item.quantity),
          }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const deleteOne = (cartKey) => {
    const updatedCart = cartItems
      .map((item) =>
        item.cartKey === cartKey && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
              price:
                (item.quantity - 1) *
                (item.unitPrice || item.price / item.quantity),
            }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeFromCart = (cartKey) => {
    const updatedCart = cartItems.filter((item) => item.cartKey !== cartKey);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.price), 0);
  };

  const getProductDisplayName = (item) => {
    if (!item.attributes || item.attributes.length === 0) {
      return item.name;
    }

    const attributesText = item.attributes
      .map((attr) => {
        if (attr.option) {
          return `${attr.name}: ${attr.option}`;
        } else if (attr.value) {
          return `${attr.name}: ${attr.value}`;
        }
        return attr.name;
      })
      .join(", ");

    return `${item.name} (${attributesText})`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        addOne,
        deleteOne,
        calculateTotalPrice,
        getProductDisplayName,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
