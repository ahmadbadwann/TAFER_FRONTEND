import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Store from './pages/Store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import '@fontsource/tajawal';

function PrivateRoute({ children }) {
  const { token } = useApp();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Tajawal', direction: 'rtl' } }} />
        <Routes>
          <Route path="/" element={<Store />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
