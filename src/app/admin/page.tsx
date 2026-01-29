"use client";

import { useEffect, useState } from 'react';
import { Ingredient } from '@/data/menu';
import { BarChart } from '@/components/BarChart';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Editing State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Ingredient>>({ name: '', price: 0, category: 'General', image: '/images/placeholder_plate.png' });

  // Stats
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    recurringCustomers: 0,
    topProducts: [] as { label: string, value: number }[],
  });

  // Order Management
  const [filterTerm, setFilterTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('nicolasa_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOrders, resProducts] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' })
      ]);
      const dataOrders = await resOrders.json();
      const dataProducts = await resProducts.json();

      setOrders(dataOrders);
      setProducts(dataProducts);
      calculateMetrics(dataOrders);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching admin data", e);
      setLoading(false);
    }
  };

  const calculateMetrics = (orders: any[]) => {
    const revenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);

    // Recurring
    const customers: Record<string, number> = {};
    orders.forEach(o => {
      const phone = o.customer.phone;
      if (phone) customers[phone] = (customers[phone] || 0) + 1;
    });
    const recurringCount = Object.values(customers).filter(count => count > 1).length;

    // Top Products
    const productCounts: Record<string, number> = {};
    orders.forEach(o => {
      if (o.items) {
        o.items.forEach((item: any) => {
          productCounts[item.name] = (productCounts[item.name] || 0) + 1;
        });
      }
    });
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));

    setMetrics({
      totalRevenue: revenue,
      totalOrders: orders.length,
      recurringCustomers: recurringCount,
      topProducts: sortedProducts,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Oyola26') {
      setIsAuthenticated(true);
      localStorage.setItem('nicolasa_admin_auth', 'true');
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nicolasa_admin_auth');
  };

  // --- ORDER ACTIONS ---
  const filteredOrders = orders.filter(o =>
    o.customer.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
    o.customer.phone.includes(filterTerm)
  );

  const handleDeleteOrder = async (dateId: string) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    try {
      await fetch('/api/orders', { method: 'DELETE', body: JSON.stringify({ date: dateId }) });
      fetchData();
    } catch (e) { alert('Error eliminando pedido'); }
  };

  // --- PRODUCT ACTIONS ---
  const saveProducts = async (updatedProducts: Ingredient[]) => {
    setProducts(updatedProducts);
    await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(updatedProducts)
    });
  };

  const handleProductUpdate = (updatedProduct: Ingredient) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProducts(newProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm("¿Borrar producto?")) return;
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);
  };

  const handleCreateProduct = () => {
    const id = newProduct.name?.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const productToAdd = { ...newProduct, id } as Ingredient;
    saveProducts([...products, productToAdd]);
    setShowAddProductModal(false);
    setNewProduct({ name: '', price: 0, category: 'General', image: '/images/placeholder_plate.png' });
  };

  const startRenamingCategory = (oldName: string) => {
    setEditingCategory(oldName);
    setTempCategoryName(oldName);
  };

  const finishRenamingCategory = (oldName: string) => {
    if (tempCategoryName && tempCategoryName !== oldName) {
      const newProducts = products.map(p => p.category === oldName ? { ...p, category: tempCategoryName } : p);
      saveProducts(newProducts);
    }
    setEditingCategory(null);
  };



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, productId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isNew) {
        setNewProduct({ ...newProduct, image: base64String });
      } else if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) handleProductUpdate({ ...product, image: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Sin Categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  // Determine existing categories for the dropdown + allow text entry
  const existingCategories = Array.from(new Set(products.map(p => p.category)));

  if (!isAuthenticated) return (
    <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Contraseña" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #333', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
          <button className="btn-primary">Ingresar</button>
        </form>
      </div>
    </div>
  );

  if (loading && activeTab === 'dashboard') return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Cargando Panel...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Panel de Administración V3</h1>
        <button onClick={handleLogout} style={{ fontSize: '0.9rem', color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cerrar Sesión</button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['dashboard', 'orders', 'products'].map(tab => (
          <button key={tab}
            className={`btn-secondary ${activeTab === tab ? 'active' : ''}`}
            style={{ borderColor: activeTab === tab ? 'var(--color-primary)' : '', textTransform: 'capitalize' }}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'dashboard' ? '📊 Métricas' : tab === 'orders' ? '📝 Pedidos' : '🍔 Productos'}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* KPIs */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#aaa' }}>Ventas Totales</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-secondary)' }}>${metrics.totalRevenue}</p>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '4px solid var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💰</div>
          </div>
          {/* ... Other KPIs same as before ... */}
          {/* Charts */}
          <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Productos Más Vendidos</h3>
            <BarChart data={metrics.topProducts} color="var(--color-secondary)" />
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text" placeholder="🔍 Buscar por cliente o teléfono..."
            value={filterTerm} onChange={e => setFilterTerm(e.target.value)}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', marginBottom: '1rem' }}
          />
          {filteredOrders.slice().reverse().map(order => (
            <div key={order.date} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedOrderId(expandedOrderId === order.date ? null : order.date)}
                style={{ padding: '1rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: order.status === 'completed' ? 'green' : 'yellow' }}></div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{order.customer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(order.date).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>${order.total}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.date); }} style={{ background: '#333', border: 'none', color: '#f87171', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
              {expandedOrderId === order.date && (
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#aaa', marginBottom: '0.5rem' }}>Detalle:</h4>
                  <ul style={{ paddingLeft: '1rem' }}>
                    {order.items?.map((item: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{item.name} (${item.totalPrice})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'grid', gap: '2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAddProductModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>+</span> Nuevo Producto / Sección
            </button>
          </div>

          {Object.keys(groupedProducts).map(category => (
            <div key={category} className="glass-panel" style={{ padding: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                {editingCategory === category ? (
                  <input
                    autoFocus
                    type="text"
                    value={tempCategoryName}
                    onChange={e => setTempCategoryName(e.target.value)}
                    onBlur={() => finishRenamingCategory(category)}
                    onKeyDown={e => e.key === 'Enter' && finishRenamingCategory(category)}
                    style={{ fontSize: '1.2rem', background: 'black', border: '1px solid var(--color-primary)', color: 'white', padding: '5px', borderRadius: '4px' }}
                  />
                ) : (
                  <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => startRenamingCategory(category)}>
                    {category} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>✏️</span>
                  </h2>
                )}
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {groupedProducts[category].map(product => (
                  <div key={product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                        <span style={{ fontSize: '1.5rem' }}>📷</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false, product.id)} style={{ display: 'none' }} />
                      </label>
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={product.name} onChange={(e) => handleProductUpdate({ ...product, name: e.target.value })} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: 'white', fontWeight: 600, padding: '2px' }} />
                      {/* Price input below */}
                      <input type="number" value={product.price} onChange={(e) => handleProductUpdate({ ...product, price: Number(e.target.value) })} style={{ width: '80px', background: 'transparent', border: '1px solid #444', color: 'var(--color-secondary)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.9rem' }} />
                    </div>
                    <button onClick={() => handleDeleteProduct(product.id)} style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px', border: '1px solid var(--color-primary)' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Agregar Nuevo Producto</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>Nombre</label>
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>Categoría (Sección)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={existingCategories.includes(newProduct.category!) ? newProduct.category : '__NEW__'}
                    onChange={e => e.target.value !== '__NEW__' && setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px' }}
                  >
                    {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__NEW__">+ Crear Nueva Sección</option>
                  </select>
                  {!existingCategories.includes(newProduct.category!) && (
                    <input
                      type="text"
                      placeholder="Nombre de nueva sección"
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--color-secondary)', color: 'white', borderRadius: '6px' }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>Precio ($)</label>
                  <input type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>Imagen</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', background: '#333' }}>
                      {newProduct.image && <img src={newProduct.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} style={{ flex: 1, color: 'transparent' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={handleCreateProduct} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Guardar</button>
                <button onClick={() => setShowAddProductModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
