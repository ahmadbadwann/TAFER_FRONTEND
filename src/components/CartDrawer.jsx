import { useState } from 'react';
import { useApp } from '../context/AppContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const WHATSAPP = '970566548430';

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, addToCart, clearCart, cartTotal } = useApp();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const items = Object.values(cart);

  const sendOrder = () => {
    if (!name.trim()) return toast.error('الرجاء إدخال اسمك');
    if (!address.trim()) return toast.error('الرجاء إدخال عنوان التوصيل');
    if (items.length === 0) return toast.error('السلة فارغة');

    let msg = `🛒 *طلب جديد - سوبر ماركت التوفير*\n\n`;
    msg += `👤 *الاسم:* ${name}\n📍 *العنوان:* ${address}\n`;
    if (phone) msg += `📞 *الهاتف:* ${phone}\n`;
    msg += `\n*المنتجات:*\n`;
    items.forEach(i => { msg += `${i.emoji} ${i.name} × ${i.qty} = ${(i.price * i.qty).toFixed(1)} ₪\n`; });
    msg += `\n💰 *المجموع: ${cartTotal.toFixed(1)} ₪*\nشكراً لطلبكم! 🙏`;

    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

    // فتح واتساب أولاً — مهم لـ iOS
    window.location.href = url;

    // حفظ الطلب في الخلفية
    API.post('/orders', {
      customerName: name,
      customerAddress: address,
      customerPhone: phone,
      items: items.map(i => ({ product: i._id, name: i.name, price: i.price, qty: i.qty, emoji: i.emoji })),
      total: cartTotal,
    }).catch(() => {});

    clearCart();
    setName('');
    setAddress('');
    setPhone('');
    onClose();
    toast.success('✅ تم إرسال طلبك!');
  };

  if (!open) return null;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', fontFamily: 'Tajawal', direction: 'rtl' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: 500, margin: '0 auto', borderRadius: '24px 24px 0 0', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 900 }}>🛍️ سلة الطلبات</h3>
          <button onClick={onClose} style={{ background: '#f7f9f7', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>🛒 السلة فارغة</div>
        ) : (
          <>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: 28, width: 44, textAlign: 'center' }}>{item.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                  <div style={{ fontSize: 13, color: '#1a6b3a', fontWeight: 500 }}>{(item.price * item.qty).toFixed(1)} ₪</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: '#e8f5ee', color: '#1a6b3a', border: 'none', borderRadius: 6, width: 28, height: 28, fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>−</button>
                  <span style={{ fontWeight: 700, color: '#1a6b3a', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => addToCart(item)} style={{ background: '#e8f5ee', color: '#1a6b3a', border: 'none', borderRadius: 6, width: 28, height: 28, fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </div>
            ))}

            <div style={{ background: '#e8f5ee', borderRadius: 12, padding: '1rem', margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>المجموع الكلي</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#1a6b3a' }}>{cartTotal.toFixed(1)} ₪</span>
            </div>

            {[
              ['اسمك الكريم *', name, setName, 'text', 'محمد أحمد'],
              ['عنوان التوصيل *', address, setAddress, 'text', 'شارع الزهور، بناية 5'],
              ['رقم هاتفك', phone, setPhone, 'tel', '05xxxxxxxx']
            ].map(([label, val, setter, type, ph]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 6 }}>{label}</label>
                <input type={type} value={val} onChange={e => setter(e.target.value)} placeholder={ph}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontFamily: 'Tajawal', fontSize: 14, outline: 'none' }} />
              </div>
            ))}

            <button onClick={sendOrder} style={{ width: '100%', background: '#25D366', color: 'white', border: 'none', borderRadius: 14, padding: 14, fontFamily: 'Tajawal', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              اطلب عبر واتساب الآن
            </button>
          </>
        )}
      </div>
    </div>
  );
}
