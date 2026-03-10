import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function PurchaseOrderPage() {
    const [pos, setPos] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [printingPO, setPrintingPO] = useState(null);
    const [form, setForm] = useState({ vendorId: '', notes: '', items: [{ materialId: '', qty: 1, price: 0 }] });

    const fetchData = async () => {
        try {
            const [poRes, vendorRes, matRes] = await Promise.all([
                api.get('/purchase-orders'),
                api.get('/vendors'),
                api.get('/materials')
            ]);
            setPos(poRes.data);
            setVendors(vendorRes.data);
            setMaterials(matRes.data);
        } catch { toast.error('Gagal memuat data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const addItem = () => setForm({ ...form, items: [...form.items, { materialId: '', qty: 1, price: 0 }] });
    const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
    const updateItem = (idx, field, val) => {
        const newItems = [...form.items];
        newItems[idx][field] = val;
        if (field === 'materialId') {
            const mat = materials.find(m => m.id === parseInt(val));
            if (mat) newItems[idx].price = mat.price;
        }
        setForm({ ...form, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/purchase-orders', form);
            toast.success('PO berhasil dibuat');
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error || 'Gagal membuat PO'); }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/purchase-orders/${id}/status`, { status });
            toast.success(`Status diperbarui ke ${status}`);
            fetchData();
        } catch { toast.error('Gagal memperbarui status'); }
    };

    const getStatusColor = (s) => {
        if (s === 'RECEIVED') return { bg: '#ecfdf5', text: '#059669' };
        if (s === 'CANCELLED') return { bg: '#fef2f2', text: '#dc2626' };
        if (s === 'ORDERED') return { bg: '#eff6ff', text: '#2563eb' };
        return { bg: '#fef3c7', text: '#d97706' };
    };

    const [printLoading, setPrintLoading] = useState(false);

    const handlePrint = async (id) => {
        setPrintLoading(id);
        try {
            const res = await api.get(`/purchase-orders/${id}`);
            setPrintingPO(res.data);
            setTimeout(() => {
                window.print();
                setPrintLoading(false);
                // Reset state setelah print dialog ditutup
                const reset = () => {
                    setPrintingPO(null);
                    window.removeEventListener('afterprint', reset);
                };
                window.addEventListener('afterprint', reset);
            }, 300);
        } catch {
            toast.error('Gagal mengambil detail PO');
            setPrintLoading(false);
        }
    };

    return (
        <div className={printingPO ? 'printing-single-po' : ''}>
            <div className="print-only po-list-header" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>LAPORAN PURCHASE ORDERS</h2>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>eProcure Material Management</p>
                <p style={{ fontSize: '12px' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }} className="hide-print">
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900 }}>Purchase Orders</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Kelola pemesanan material ke vendor</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary hide-print" onClick={() => window.print()}>⎙ Print Daftar PO</button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Buat PO Baru</button>
                </div>
            </div>

            <div className="card po-list-section">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>No. PO</th>
                            <th>Tanggal</th>
                            <th>Vendor</th>
                            <th>Item</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map(po => {
                            const colors = getStatusColor(po.status);
                            return (
                                <tr key={po.id}>
                                    <td><strong>{po.poNumber}</strong></td>
                                    <td>{new Date(po.date).toLocaleDateString()}</td>
                                    <td>{po.vendor.name}</td>
                                    <td>{po._count.items} Jenis</td>
                                    <td>Rp {po.totalAmount.toLocaleString()}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                            backgroundColor: colors.bg, color: colors.text
                                        }}>{po.status}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {po.status === 'PENDING' && (
                                                <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                                                    onClick={() => updateStatus(po.id, 'ORDERED')}>Order</button>
                                            )}
                                            {po.status === 'ORDERED' && (
                                                <button className="btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                                                    onClick={() => updateStatus(po.id, 'RECEIVED')}>Receive</button>
                                            )}
                                            <button
                                                onClick={() => handlePrint(po.id)}
                                                disabled={printLoading === po.id}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--primary)', color: printLoading === po.id ? 'var(--text-muted)' : 'var(--primary)', background: '#eef2ff', cursor: 'pointer', opacity: printLoading === po.id ? 0.6 : 1 }}
                                                onMouseEnter={e => { if (printLoading !== po.id) { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; } }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = 'var(--primary)'; }}>
                                                {printLoading === po.id ? '...' : '⎙ Print'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span style={{ fontWeight: 800 }}>Buat Purchase Order</span>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Pilih Vendor</label>
                                <select className="form-input" value={form.vendorId} onChange={e => setForm({ ...form, vendorId: e.target.value })} required>
                                    <option value="">-- Pilih Vendor --</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: 11, fontWeight: 700 }}>Item Pesanan</label>
                                    <button type="button" className="btn-secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={addItem}>+ Tambah Baris</button>
                                </div>
                                {form.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: 8, marginBottom: 8 }}>
                                        <select className="form-input" value={item.materialId} onChange={e => updateItem(idx, 'materialId', e.target.value)} required>
                                            <option value="">-- Material --</option>
                                            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                                        </select>
                                        <input type="number" className="form-input" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} required />
                                        <input type="number" className="form-input" placeholder="Harga" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} required />
                                        <button type="button" className="icon-btn del" onClick={() => removeItem(idx)}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn-primary">Simpan PO</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {printingPO && (
                <div className="po-single-doc" style={{ padding: '40px', color: '#000', display: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>PURCHASE ORDER</h1>
                            <p style={{ fontSize: '14px', opacity: 0.8 }}>eProcure Material Management</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 'bold' }}>PO Number: {printingPO.poNumber}</p>
                            <p>Date: {new Date(printingPO.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>Vendor</p>
                            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{printingPO.vendor.name}</p>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{printingPO.vendor.address || 'Alamat tidak tersedia'}</p>
                            <p style={{ fontSize: '14px' }}>Telp: {printingPO.vendor.phone || '-'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>Ship To</p>
                            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>Main Warehouse</p>
                            <p style={{ fontSize: '14px' }}>Kawasan Industri MM2100</p>
                            <p style={{ fontSize: '14px' }}>Cikarang Barat, Bekasi</p>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', width: '80px' }}>Qty</th>
                                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '12px', width: '60px' }}>Unit</th>
                                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', width: '120px' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', width: '140px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printingPO.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.material.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{item.material.code}</div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px' }}>{item.qty}</td>
                                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px' }}>{item.material.unit}</td>
                                    <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px' }}>Rp {item.price.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold' }}>Rp {(item.qty * item.price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'right', padding: '20px 8px', fontWeight: 'bold', fontSize: '16px' }}>Grand Total:</td>
                                <td style={{ textAlign: 'right', padding: '20px 8px', fontWeight: '900', fontSize: '20px', color: 'var(--primary)' }}>Rp {printingPO.totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ marginBottom: '60px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>Notes</p>
                        <p style={{ fontSize: '14px', fontStyle: 'italic' }}>{printingPO.notes || 'No notes included.'}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '100px', textAlign: 'center' }}>
                        <div>
                            <div style={{ borderBottom: '1px solid #000', margin: '0 40px', paddingBottom: '80px' }}></div>
                            <p style={{ marginTop: '10px', fontSize: '14px' }}>Approved By</p>
                        </div>
                        <div>
                            <div style={{ borderBottom: '1px solid #000', margin: '0 40px', paddingBottom: '80px' }}></div>
                            <p style={{ marginTop: '10px', fontSize: '14px' }}>Vendor Confirmation</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
