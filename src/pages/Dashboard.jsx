import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const BACKEND = 'http://localhost:5000';
const tabs = ['المنتجات', 'الفئات', 'الطلبات'];
const statusColor = { 'جديد': '#3b82f6', 'قيد التوصيل': '#f59e0b', 'مكتمل': '#10b981', 'ملغي': '#ef4444' };

export default function Dashboard() {
  const { token, logout } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState('المنتجات');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editCat, setEditCat] = useState(null);

  useEffect(() => { if (!token) nav('/login'); }, [token, nav]);

  const fetchProducts = useCallback(async () => {
    try { const { data } = await API.get('/products/all'); setProducts(data); }
    catch { toast.error('خطأ في تحميل المنتجات'); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try { const { data } = await API.get('/categories'); setCategories(data); }
    catch { toast.error('خطأ في تحميل الفئات'); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try { const { data } = await API.get('/orders'); setOrders(data); }
    catch (err) { toast.error('خطأ في تحميل الطلبات: ' + (err.response?.data?.message || err.message)); }
    finally { setLoadingOrders(false); }
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); fetchOrders(); }, [fetchProducts, fetchCategories, fetchOrders]);
  useEffect(() => { if (tab === 'الطلبات') fetchOrders(); }, [tab, fetchOrders]);

  const deleteProduct = async (id) => {
    if (!window.confirm('هل تريد حذف هذا المنتج؟')) return;
    try { await API.delete(`/products/${id}`); setProducts(prev => prev.filter(p => p._id !== id)); toast.success('✅ تم الحذف'); }
    catch { toast.error('خطأ في الحذف'); }
  };

  const deleteCat = async (id) => {
    if (!window.confirm('هل تريد حذف هذه الفئة؟')) return;
    try { await API.delete(`/categories/${id}`); setCategories(prev => prev.filter(c => c._id !== id)); toast.success('✅ تم الحذف'); }
    catch { toast.error('خطأ في الحذف'); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الطلب؟')) return;
    try { await API.delete(`/orders/${id}`); setOrders(prev => prev.filter(o => o._id !== id)); toast.success('✅ تم الحذف'); }
    catch { toast.error('خطأ في الحذف'); }
  };

  const updateOrderStatus = async (id, status) => {
    try { await API.put(`/orders/${id}/status`, { status }); setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o)); toast.success('✅ تم تحديث الحالة'); }
    catch { toast.error('خطأ في التحديث'); }
  };

  const newOrdersCount = orders.filter(o => o.status === 'جديد').length;

  return (
    <div style={{ fontFamily: 'Tajawal', direction: 'rtl', minHeight: '100vh', background: '#f7f9f7' }}>

      <header style={{ background: '#1a6b3a', color: 'white', padding: '0 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 65 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🛒</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>لوحة التحكم</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>سوبر ماركت التوفير</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 8, padding: '8px 14px', fontFamily: 'Tajawal', fontSize: 13, textDecoration: 'none' }}>🌐 المتجر</a>
            <button onClick={() => { logout(); nav('/login'); }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'Tajawal', fontSize: 13, cursor: 'pointer' }}>خروج</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[['📦', 'المنتجات', products.length, '#1a6b3a'], ['📂', 'الفئات', categories.length, '#6366f1'], ['🛍️', 'الطلبات', orders.length, '#f59e0b'], ['🆕', 'جديدة', newOrdersCount, '#ef4444']].map(([icon, label, val, color]) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, padding: '1.2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color }}>{val}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, border: '1px solid #e5e7eb', marginBottom: '1.5rem', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#1a6b3a' : 'transparent', color: tab === t ? 'white' : '#6b7280', border: 'none', borderRadius: 8, padding: '8px 20px', fontFamily: 'Tajawal', fontSize: 14, fontWeight: 600, cursor: 'pointer', position: 'relative' }}>
              {t}
              {t === 'الطلبات' && newOrdersCount > 0 && (
                <span style={{ position: 'absolute', top: -6, left: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{newOrdersCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {tab === 'المنتجات' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>المنتجات ({products.length})</h2>
              <button onClick={() => { setEditProduct(null); setShowProductModal(true); }} style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: 'Tajawal', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>+ إضافة منتج</button>
            </div>
            {products.length === 0 ? <Empty text="لا توجد منتجات — أضف منتجاً الآن" /> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {products.map(p => (
                  <div key={p._id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ height: 120, background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 48 }}>{p.emoji}</span>}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{p.category?.emoji} {p.category?.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 900, color: '#1a6b3a' }}>{p.price} ₪ / {p.unit}</span>
                        <span style={{ fontSize: 11, background: p.inStock ? '#dcfce7' : '#fee2e2', color: p.inStock ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: 20 }}>{p.inStock ? 'متوفر' : 'نفد'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditProduct(p); setShowProductModal(true); }} style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '7px', fontFamily: 'Tajawal', fontSize: 13, cursor: 'pointer' }}>✏️ تعديل</button>
                        <button onClick={() => deleteProduct(p._id)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '7px', fontFamily: 'Tajawal', fontSize: 13, cursor: 'pointer' }}>🗑️ حذف</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* CATEGORIES */}
        {tab === 'الفئات' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>الفئات ({categories.length})</h2>
              <button onClick={() => { setEditCat(null); setShowCatModal(true); }} style={{ background: '#1a6b3a', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: 'Tajawal', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>+ إضافة فئة</button>
            </div>
            {categories.length === 0 ? <Empty text="لا توجد فئات — أضف فئة الآن" /> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {categories.map(c => (
                  <div key={c._id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 28 }}>{c.emoji}</span>
                      <span style={{ fontWeight: 700 }}>{c.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditCat(c); setShowCatModal(true); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => deleteCat(c._id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ORDERS */}
        {tab === 'الطلبات' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>الطلبات ({orders.length})</h2>
              <button onClick={fetchOrders} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'Tajawal', fontSize: 13, cursor: 'pointer' }}>🔄 تحديث</button>
            </div>
            {loadingOrders ? <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>⏳ جارٍ التحميل...</div>
              : orders.length === 0 ? <Empty text="لا توجد طلبات بعد" />
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {orders.map(o => (
                    <div key={o._id} style={{ background: 'white', borderRadius: 16, border: `2px solid ${o.status === 'جديد' ? '#3b82f6' : '#e5e7eb'}`, padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>👤 {o.customerName}</div>
                          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>📍 {o.customerAddress}</div>
                          {o.customerPhone && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>📞 {o.customerPhone}</div>}
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>🕐 {new Date(o.createdAt).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <span style={{ background: statusColor[o.status] + '20', color: statusColor[o.status], padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{o.status}</span>
                          <select value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)}
                            style={{ fontFamily: 'Tajawal', fontSize: 13, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', outline: 'none', direction: 'rtl' }}>
                            {['جديد', 'قيد التوصيل', 'مكتمل', 'ملغي'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                        {o.items?.length > 0
                          ? o.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderBottom: '1px solid #f9fafb' }}>
                                <span>{item.emoji || '🛒'} {item.name} × {item.qty}</span>
                                <span style={{ color: '#1a6b3a', fontWeight: 600 }}>{(item.price * item.qty).toFixed(1)} ₪</span>
                              </div>
                            ))
                          : <div style={{ color: '#9ca3af', fontSize: 13 }}>لا توجد تفاصيل</div>
                        }
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 16, marginTop: 10, paddingTop: 8, borderTop: '2px solid #e5e7eb' }}>
                          <span>💰 المجموع</span>
                          <span style={{ color: '#1a6b3a' }}>{o.total?.toFixed(1)} ₪</span>
                        </div>
                      </div>
                      <button onClick={() => deleteOrder(o._id)} style={{ marginTop: 10, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'Tajawal', fontSize: 12, cursor: 'pointer' }}>
                        🗑️ حذف الطلب
                      </button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      {showProductModal && <ProductModal categories={categories} product={editProduct} onClose={() => setShowProductModal(false)} onSave={() => { fetchProducts(); setShowProductModal(false); }} />}
      {showCatModal && <CatModal cat={editCat} onClose={() => setShowCatModal(false)} onSave={() => { fetchCategories(); setShowCatModal(false); }} />}
    </div>
  );
}

function ProductModal({ categories, product, onClose, onSave }) {
  const [form, setForm] = useState({ name: product?.name || '', price: product?.price || '', unit: product?.unit || '', emoji: product?.emoji || '🛒', category: product?.category?._id || '', description: product?.description || '', inStock: product?.inStock ?? true, image: product?.image || '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image ? product.image : '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const { data } = await API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = data.url;
      }
      const payload = { ...form, image: imageUrl };
      if (product) await API.put(`/products/${product._id}`, payload);
      else await API.post('/products', payload);
      toast.success(product ? '✅ تم التعديل' : '✅ تمت الإضافة');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <Modal title={product ? 'تعديل منتج' : 'إضافة منتج جديد'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="صورة المنتج">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: '100%', height: 150, background: '#e8f5ee', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #1a6b3a' }}>
              {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: '#6b7280' }}><div style={{ fontSize: 36 }}>{form.emoji}</div><div style={{ fontSize: 12, marginTop: 4 }}>اضغط لاختيار صورة</div></div>}
            </div>
            <label style={{ background: '#1a6b3a', color: 'white', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              📷 اختر صورة
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {imagePreview && <button type="button" onClick={() => { setImagePreview(''); setImageFile(null); setForm({ ...form, image: '' }); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Tajawal' }}>🗑️ حذف الصورة</button>}
          </div>
        </Field>
        {[['اسم المنتج *', 'name', 'text'], ['السعر (₪) *', 'price', 'number'], ['الوحدة *', 'unit', 'text'], ['الإيموجي', 'emoji', 'text']].map(([label, key, type]) => (
          <Field key={key} label={label}>
            <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={label.includes('*')}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </Field>
        ))}
        <Field label="الفئة *">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none', direction: 'rtl' }}>
            <option value="">اختر فئة</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
          </select>
        </Field>
        <Field label="الحالة">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} style={{ width: 16, height: 16 }} />
            متوفر في المخزون
          </label>
        </Field>
        <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Tajawal', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
          {loading ? '⏳ جارٍ الحفظ...' : '💾 حفظ المنتج'}
        </button>
      </form>
    </Modal>
  );
}

function CatModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState({ name: cat?.name || '', emoji: cat?.emoji || '📦' });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (cat) await API.put(`/categories/${cat._id}`, form);
      else await API.post('/categories', form);
      toast.success(cat ? '✅ تم التعديل' : '✅ تمت الإضافة');
      onSave();
    } catch { toast.error('حدث خطأ'); }
    setLoading(false);
  };
  return (
    <Modal title={cat ? 'تعديل فئة' : 'إضافة فئة جديدة'} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="اسم الفئة *"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></Field>
        <Field label="الإيموجي"><input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></Field>
        <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#9ca3af' : '#1a6b3a', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Tajawal', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          {loading ? '⏳ جارٍ الحفظ...' : '💾 حفظ الفئة'}
        </button>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 34, height: 34, fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: 'white', borderRadius: 16, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
      <p>{text}</p>
    </div>
  );
}
