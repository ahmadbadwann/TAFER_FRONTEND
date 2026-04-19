import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [cart, setCart] = useState({});
  const [token, setToken] = useState(localStorage.getItem('token'));

  const addToCart = (product) => {
    setCart(prev => ({ ...prev, [product._id]: { ...product, qty: (prev[product._id]?.qty || 0) + 1 } }));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[id]?.qty > 1) updated[id] = { ...updated[id], qty: updated[id].qty - 1 };
      else delete updated[id];
      return updated;
    });
  };

  const clearCart = () => setCart({});

  const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const cartTotal = Object.values(cart).reduce((a, b) => a + b.price * b.qty, 0);

  const login = (t) => { localStorage.setItem('token', t); setToken(t); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal, token, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
