"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Ingredient, dishPresets, PresetDish } from '@/data/menu';

interface CartItem {
  id: string;
  name: string;
  ingredients: Ingredient[];
  totalPrice: number;
}

const BANNERS = [
  { src: '/images/banner_oferta.png', title: 'SABOR DE LA LLAJTA', subtitle: 'Disfruta de lo mejor de la gastronomía boliviana.' },
  { src: '/images/banner_combo.png', title: 'COMBOS FAMILIARES', subtitle: 'Compartir es vivir. Pide para todos.' },
  { src: '/images/banner_bebidas.png', title: 'REFRESCA TU DÍA', subtitle: 'Mocochinchi y Somó bien helados.' }
];

export default function OrderPage() {
  const router = useRouter();
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'PRESETS' | 'BUILDER' | 'CART'>('PRESETS');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [currentPreset, setCurrentPreset] = useState<PresetDish | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [currentDishId, setCurrentDishId] = useState<string>('');

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setAvailableIngredients(data);
        setLoading(false);
      })
      .catch(err => console.error("Failed to load ingredients", err));
  }, []);

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPreset = (preset: PresetDish) => {
    setCurrentPreset(preset);
    setSelectedIngredients([...preset.defaultIngredients]);
    setCurrentDishId(Date.now().toString());
    setView('BUILDER');
  };

  const toggleIngredient = (ingId: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingId)) {
        return prev.filter(id => id !== ingId);
      } else {
        return [...prev, ingId];
      }
    });
  };

  const getDishPrice = () => {
    if (!currentPreset) return 0;
    let total = currentPreset.basePrice;
    const extras = selectedIngredients.filter(id => !currentPreset.defaultIngredients.includes(id));
    extras.forEach(id => {
      const ing = availableIngredients.find(i => i.id === id);
      if (ing) total += ing.price;
    });
    return total;
  };

  const addToCart = () => {
    if (!currentPreset) return;
    const resolvedIngredients = selectedIngredients
      .map(id => availableIngredients.find(i => i.id === id))
      .filter(Boolean) as Ingredient[];

    const newItem: CartItem = {
      id: currentDishId,
      name: currentPreset.name,
      ingredients: resolvedIngredients,
      totalPrice: getDishPrice()
    };

    setCart([...cart, newItem]);
    setView('CART');
  };

  const removeCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  };

  const proceedToCheckout = () => {
    localStorage.setItem('nicolasa_cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Cargando Sabores Bolivianos...</div>;

  const standardPresets = dishPresets.filter(p => p.id !== 'custom');
  const customPreset = dishPresets.find(p => p.id === 'custom');

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>

      <div style={{ height: '8px', width: '100%', display: 'flex', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
        <div style={{ flex: 1, background: '#D92626' }}></div>
        <div style={{ flex: 1, background: '#F2C744' }}></div>
        <div style={{ flex: 1, background: '#007A33' }}></div>
      </div>

      {/* Header with entrance animation */}
      <div className="glass-panel" style={{ margin: '1rem 0 2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', animation: 'slideDown 0.5s ease' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🍲</span> NICOLASA
        </h1>
        {cart.length > 0 && (
          <button onClick={() => setView('CART')} style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-secondary)', color: 'black', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, animation: 'bounce 0.5s' }}>
            <span>{cart.length}</span>
            <span>$ {getCartTotal()}</span>
          </button>
        )}
      </div>

      {view === 'PRESETS' && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          {/* CAROUSEL */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative', height: '220px' }}>
            {BANNERS.map((banner, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute', inset: 0,
                  opacity: index === currentSlide ? 1 : 0,
                  transition: 'opacity 1s ease',
                  pointerEvents: 'none'
                }}
              >
                <Image src={banner.src} alt="Banner" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.8), transparent)' }}>
                  <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary)', textShadow: '2px 2px 4px black', transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transition: 'all 0.8s ease 0.3s' }}>
                      {banner.title}
                    </h2>
                    <p style={{ color: 'white', maxWidth: '70%', transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transition: 'all 0.8s ease 0.5s' }}>
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
              {BANNERS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: i === currentSlide ? 'var(--color-secondary)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '5px', height: '30px', background: 'var(--color-primary)', borderRadius: '2px' }}></span>
            Platillos Tradicionales
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {standardPresets.map((preset, idx) => (
              <div
                key={preset.id}
                className="glass-panel"
                style={{
                  padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animation: `slideUp 0.5s ease ${idx * 0.1}s backwards`
                }}
                onClick={() => handleSelectPreset(preset)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image src={preset.image} alt={preset.name} fill style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, black, transparent)', padding: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{preset.name}</h3>
                    {preset.basePrice > 0 && <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>$ {preset.basePrice}</span>}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{preset.description}</p>
                  <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>¡Se me antoja!</button>
                </div>
              </div>
            ))}
          </div>

          {customPreset && (
            <div className="glass-panel" style={{ marginTop: '2rem', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(217,38,38,0.15), rgba(242,199,68,0.15))', border: '1px solid rgba(255,255,255,0.15)', animation: 'fadeIn 1s ease 0.5s backwards' }}>
              <div className="flex-responsive-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎨</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Arma tu Plato</h2>
                  </div>
                  <p style={{ fontSize: '1.1rem', color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    ¿No encuentras tu combinación perfecta? <br />
                    Conviértete en el chef y elige cada ingrediente a tu gusto.
                  </p>
                  <button
                    onClick={() => handleSelectPreset(customPreset)}
                    className="btn-primary"
                    style={{ padding: '12px 30px', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(242,199,68,0.3)' }}
                  >
                    Crear mi Combinación
                  </button>
                </div>
                <div style={{ width: '160px', height: '160px', position: 'relative', animation: 'float 3s ease-in-out infinite' }}>
                  <Image src="/images/bife.png" alt="Custom" fill style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: BUILDER */}
      {view === 'BUILDER' && currentPreset && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', animation: 'slideLeft 0.3s ease' }}>
          {/* Rest of Builder (same content, just adding animation classes implicitly via parent) */}
          <button onClick={() => setView('PRESETS')} style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '5px' }}>
            ← Volver al menú
          </button>

          <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--color-primary)' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '0.5rem', fontFamily: 'serif' }}>{currentPreset.name}</h2>
            <p style={{ marginBottom: '2rem', color: '#ccc' }}>Personaliza tus ingredientes</p>

            {['proteins', 'carbs', 'salads', 'sauces', 'drinks'].map((catLabel) => {
              const catItems = availableIngredients.filter(i => i.category === catLabel || (catLabel === 'carbs' && i.category === 'extras'));
              if (catItems.length === 0) return null;

              return (
                <div key={catLabel} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', color: '#888', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {catLabel === 'proteins' ? '🍖' : catLabel === 'carbs' ? '🍚' : catLabel === 'salads' ? '🥗' : catLabel === 'sauces' ? '🌶️' : '🥤'}
                    </span>
                    {catLabel === 'proteins' ? 'Carnes' : catLabel === 'carbs' ? 'Guarniciones' : catLabel === 'salads' ? 'Ensaladas' : catLabel === 'sauces' ? 'Salsas' : 'Bebidas'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                    {catItems.map(item => {
                      const isSelected = selectedIngredients.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleIngredient(item.id)}
                          style={{
                            border: isSelected ? '1px solid var(--color-secondary)' : '1px solid transparent',
                            background: isSelected ? 'rgba(242, 199, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            transition: 'all 0.2s',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                          }}
                        >
                          <div style={{ width: '100%', height: '80px', position: 'relative', overflow: 'hidden', borderRadius: '6px', marginBottom: '0.5rem' }}>
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: '0.85rem', textAlign: 'center', fontWeight: isSelected ? 600 : 400, lineHeight: '1.2' }}>{item.name}</span>
                          <div style={{ position: 'absolute', top: '5px', right: '5px', width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #666', background: isSelected ? 'var(--color-accent)' : 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', transition: 'background 0.2s' }}>
                            {isSelected && '✓'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Total Plato</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-secondary)' }}>$ {getDishPrice()}</div>
              </div>
              <button onClick={addToCart} className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                Confirmar Plato
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CART */}
      {view === 'CART' && (
        <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
          {/* Cart Content (kept same but wrapper has animation) */}
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Tu Pedido</h2>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              Tu carrito está vacío.
              <br /><br />
              <button onClick={() => setView('PRESETS')} className="btn-primary">Ir al Menú</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cart.map((item, idx) => (
                <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', borderLeft: '4px solid var(--color-primary)', animation: `slideUp 0.3s ease ${idx * 0.1}s backwards` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.name}</h3>
                    <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>$ {item.totalPrice}</span>
                  </div>
                  <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem', color: '#ccc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                    {item.ingredients.map(ing => (
                      <li key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '4px', height: '4px', background: '#aaa', borderRadius: '50%' }}></span>
                        {ing.name}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => setView('PRESETS')}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '1rem', borderStyle: 'dashed' }}
              >
                + Agregar otro plato
              </button>

              <div className="glass-panel" style={{ marginTop: '1rem', padding: '2rem', background: 'linear-gradient(to right, #111, #222)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
                  <span>Total Pedido</span>
                  <span>$ {getCartTotal()}</span>
                </div>
                <button
                  onClick={proceedToCheckout}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', padding: '1rem' }}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
