"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
    id: string;
    name: string;
    ingredients: { name: string }[];
    totalPrice: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        paymentMethod: 'mercado_pago'
    });

    useEffect(() => {
        const saved = localStorage.getItem('nicolasa_cart');
        if (saved) {
            setCart(JSON.parse(saved));
        }
        setLoading(false);
    }, []);

    const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Save to DB (optional/backup)
        const orderData = {
            customer: formData,
            items: cart,
            total: cartTotal,
            date: new Date().toISOString(),
            status: 'pending'
        };

        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        } catch (err) {
            console.error("Backup save failed", err);
        }

        // WhatsApp Generation
        // WhatsApp Generation
        const phone = "5491164364006"; // NICOLASA's number
        let message = `*¡Hola! Quiero realizar un pedido en NICOLASA.*\n\n`;
        message += `*Cliente:* ${formData.name}\n`;
        message += `*Dirección:* ${formData.address}\n`;
        message += `*Teléfono:* ${formData.phone}\n`;
        message += `*Pago:* ${formData.paymentMethod === 'mercado_pago' ? 'QR / Transferencia' : 'Efectivo'}\n\n`;
        message += `*PEDIDO:*\n`;

        cart.forEach((item, idx) => {
            message += `\n${idx + 1}. *${item.name}* ($ ${item.totalPrice})\n`;
            message += `   - ${item.ingredients.map(i => i.name).join(', ')}\n`;
        });

        message += `\n*TOTAL: $ ${cartTotal}*`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        // Clear cart and redirect
        // Clear cart
        localStorage.removeItem('nicolasa_cart');

        // Redirect Logic:
        // 1. Try opening new tab (preferred for Desktop)
        // 2. Fallback to existing window (preferred for Mobile to trigger App intent)
        const newWindow = window.open(url, '_blank');

        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            window.location.href = url;
        }

        if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>Cargando checkout...</div>;
        if (cart.length === 0) return <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>Carrito vacío.</div>;

        return (
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Finalizar Pedido</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>Tus Datos</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            <div>
                                <label className="block mb-2 text-sm text-gray-400">Nombre Completo</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: 'white' }}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm text-gray-400">Dirección de Entrega</label>
                                <input
                                    required
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: 'white' }}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm text-gray-400">WhatsApp / Teléfono</label>
                                <input
                                    required
                                    type="tel"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: 'white' }}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm text-gray-400">Método de Pago</label>
                                <select
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: 'white' }}
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <option value="mercado_pago">Mercado Pago (QR / Link)</option>
                                    <option value="cash">Efectivo contra entrega</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
                                    <span>Total a Pagar:</span>
                                    <span style={{ color: 'var(--color-secondary)' }}>$ {cartTotal}</span>
                                </div>

                                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                                    Enviar Pedido por WhatsApp
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        );
    }
