import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useApp } from '../context/AppContext';
import CartDrawer from '../components/CartDrawer';
import toast from 'react-hot-toast';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const { addToCart, removeFromCart, cart, cartCount } = useApp();

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data));
    API.get('/products').then(r => setProducts(r.data));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = selectedCat === 'all' || p.category?._id === selectedCat;
    const matchSearch = p.name.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div style={{ fontFamily: "'Tajawal', sans-serif", direction: 'rtl', minHeight: '100vh', background: '#f7f9f7' }}>
      {/* HEADER */}
      <header style={{ background: '#1a6b3a', color: 'white', padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70, gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#f5c842', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛒</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>سوبر ماركت التوفير</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>توصيل سريع لباب بيتك</div>
            </div>
          </div>
          <input
            placeholder="🔍 ابحث عن منتج..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 380, padding: '10px 16px', borderRadius: 50, border: 'none', fontFamily: 'Tajawal', fontSize: 14, background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none' }}
          />
          <button onClick={() => setCartOpen(true)} style={{ background: '#f5c842', border: 'none', borderRadius: 50, padding: '10px 18px', fontFamily: 'Tajawal', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            🛍️ السلة <span style={{ background: '#1a6b3a', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{cartCount}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a6b3a, #2d8a50)', color: 'white', textAlign: 'center', padding: '2.5rem 1rem' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px' }}>🛒 تسوق من بيتك بكل سهولة</h2>
        <p style={{ opacity: 0.85 }}>اختر منتجاتك واطلب عبر واتساب — نوصل لباب بيتك</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {['🚚 توصيل سريع', '✅ منتجات طازجة', '💰 أسعار مميزة'].map(b => (
            <span key={b} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 50, padding: '6px 14px', fontSize: 13 }}>{b}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* CATEGORIES */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
          <CatBtn active={selectedCat === 'all'} onClick={() => setSelectedCat('all')}>🏪 الكل</CatBtn>
          {categories.map(c => (
            <CatBtn key={c._id} active={selectedCat === c._id} onClick={() => setSelectedCat(c._id)}>
              {c.emoji} {c.name}
            </CatBtn>
          ))}
        </div>

        {/* PRODUCTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
          {filtered.map(p => {
            const qty = cart[p._id]?.qty || 0;
            return (
              <div key={p._id} style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: 120, background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, overflow: 'hidden' }}>
  {p.image && p.image.startsWith('http')
    ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <span>{p.emoji}</span>
  }
</div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>{p.unit}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#1a6b3a' }}>{p.price} ₪</span>
                    {qty === 0
                      ? <button onClick={() => { addToCart(p); toast.success('تمت الإضافة ✅'); }} style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 20, cursor: 'pointer' }}>+</button>
                      : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => removeFromCart(p._id)} style={{ background: '#e8f5ee', color: '#1a6b3a', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>−</button>
                          <span style={{ fontWeight: 700, color: '#1a6b3a', minWidth: 20, textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => addToCart(p)} style={{ background: '#e8f5ee', color: '#1a6b3a', border: 'none', borderRadius: 6, width: 26, height: 26, fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <p>لا توجد منتجات</p>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function CatBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#1a6b3a' : 'white', color: active ? 'white' : '#6b7280', border: `1.5px solid ${active ? '#1a6b3a' : '#e5e7eb'}`, borderRadius: 50, padding: '8px 18px', fontFamily: 'Tajawal', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}
