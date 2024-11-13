import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load cart items from localStorage when the component is first rendered
  const [cartItems, setCartItems] = useState(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    return storedCartItems ? JSON.parse(storedCartItems) : [];
  });

  // Load download history from localStorage when the component is first rendered
  const [downloadHistory, setDownloadHistory] = useState(() => {
    const storedHistory = localStorage.getItem('downloadHistory');
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save download history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
  }, [downloadHistory]);

  const addItemToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeItemFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // New function to update the download history
  const updateDownloadHistory = (file, isZipDownload = false) => {
    // If it's a single file download
    if (!isZipDownload) {
      // Add single file to history
      const newHistoryItem = {
        id: file.id,
        name: file.name,
        date: new Date().toLocaleDateString(),
        type: file.type,
      };

      // Update history with the new single file
      setDownloadHistory((prevHistory) => [...prevHistory, newHistoryItem]);
    } else {
      // If it's a ZIP file, handle as before (add all files in the ZIP)
      const newHistoryItems = file.map((f) => ({
        id: f.id,
        name: f.name,
        date: new Date().toLocaleDateString(),
        type: f.type,
      }));

      // Add multiple files from the ZIP to history
      setDownloadHistory((prevHistory) => [...prevHistory, ...newHistoryItems]);
    }
  };

  const clearDownloadHistory = () => {
    setDownloadHistory([]);
    localStorage.removeItem('downloadHistory'); // Remove from localStorage as well
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItemToCart,
        removeItemFromCart,
        updateDownloadHistory,
        downloadHistory,
        clearDownloadHistory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
