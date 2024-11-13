import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme/theme';
import Navbar from './components/Navbar';

// Import your page components
import Home from './pages/HomePage';
import Cart from './pages/Cart';
import History from './pages/History';

// Import the CartProvider and useCart hook from your CartContext
import { CartProvider } from './components/CartContext'; // Adjust the import path if needed

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    // Wrap the entire app with CartProvider to allow all components access to the cart context
    <CartProvider>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Navbar
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </CartProvider>
  );
}

export default App;
