import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token);
      toast.success('مرحباً بك!');
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a6b3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a6b3a', margin: 0 }}>سوبر ماركت التوفير</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>لوحة التحكم</p>
        </div>
        <form onSubmit={submit}>
          {[['اسم المستخدم', 'username', 'text'], ['كلمة المرور', 'password', 'password']].map(([label, key, type]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Tajawal', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/" style={{ color: '#1a6b3a', fontSize: 13, textDecoration: 'none' }}>← العودة للمتجر</a>
        </div>
      </div>
    </div>
  );
}
