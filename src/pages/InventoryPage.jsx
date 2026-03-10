import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ code: '', name: '', categoryId: '', unit: '', minStock: 5, price: 0, notes: '' });

    const fetchData = async () => {
        try {
            const [matRes, catRes] = await Promise.all([
                api.get('/materials', { params: { search: search || undefined } }),
                api.get('/categories'),
            ]);
            setMaterials(matRes.data);
            setCategories(catRes.data);
        } catch { toast.error('Gagal memuat data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [search]);

    const openNew = () => {
        setEditId(null);
        setForm({ code: '', name: '', categoryId: '', unit: '', minStock: 5, price: 0, notes: '' });
        setShowModal(true);
    };

    const openEdit = (m) => {
        setEditId(m.id);
        setForm({ code: m.code, name: m.name, categoryId: m.categoryId, unit: m.unit, minStock: m.minStock, price: m.price, notes: m.notes || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = { ...form, categoryId: parseInt(form.categoryId), minStock: parseInt(form.minStock), price: parseFloat(form.price) || 0 };
            if (editId) { await api.put(`/materials/${editId}`, data); toast.success('Material diperbarui'); }
            else { await api.post('/materials', data); toast.success('Material ditambahkan'); }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus material ini? Semua transaksi terkait juga akan dihapus.')) return;
        try { await api.delete(`/materials/${id}`); toast.success('Dihapus'); fetchData(); }
        catch { toast.error('Gagal menghapus'); }
    };

    const getStatus = (m) => {
        if (m.stock <= 0) return { label: 'Habis', cls: 'badge-empty' };
        if (m.stock <= m.minStock) return { label: 'Menipis', cls: 'badge-low' };
        return { label: 'Normal', cls: 'badge-ok' };
    };

    return (
        <div>
            <div className="print-only" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>LAPORAN INVENTARIS MATERIAL</h2>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>eProcure Material Management</p>
                <p style={{ fontSize: '12px' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }} className="hide-print">
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Inventaris</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Semua material yang terdaftar dan stok saat ini</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={() => window.print()}>⎙ Print Daftar</button>
                    <button className="btn-primary" onClick={openNew}>+ Tambah Material</button>
                </div>
            </div>

            <div className="card">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }} className="hide-print">
                    <input className="form-input" style={{ width: 280 }} placeholder="Cari material..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {loading ? <div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div> : (
                        <table className="data-table">
                            <thead><tr>
                                <th>No</th><th>Kode</th><th>Nama Material</th><th>Kategori</th><th>Satuan</th>
                                <th style={{ color: 'var(--accent-in)' }}>Masuk</th><th style={{ color: 'var(--accent-out)' }}>Keluar</th>
                                <th>Saldo</th><th>Min</th><th>Status</th><th className="hide-print">Aksi</th>
                            </tr></thead>
                            <tbody>
                                {materials.length === 0 ? <tr><td colSpan="11" className="empty-state">Belum ada material terdaftar</td></tr> :
                                    materials.map((m, i) => {
                                        const status = getStatus(m);
                                        return (
                                            <tr key={m.id}>
                                                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                                <td><code style={{ fontSize: 11, color: 'var(--primary-light)', background: '#eef2ff', padding: '2px 6px', borderRadius: 4 }}>{m.code}</code></td>
                                                <td>
                                                    <strong>{m.name}</strong>
                                                    <br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.category?.name}</span>
                                                </td>
                                                <td style={{ color: 'var(--text-sec)' }}>{m.category?.name}</td>
                                                <td style={{ color: 'var(--text-sec)' }}>{m.unit}</td>
                                                <td style={{ color: 'var(--accent-in)', fontWeight: 600 }}>{m.stockIn}</td>
                                                <td style={{ color: 'var(--accent-out)', fontWeight: 600 }}>{m.stockOut}</td>
                                                <td><strong style={{ fontSize: 15 }}>{m.stock}</strong></td>
                                                <td style={{ color: 'var(--text-muted)' }}>{m.minStock}</td>
                                                <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                                                <td className="hide-print">
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button
                                                            onClick={() => openEdit(m)}
                                                            title="Edit Material"
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                                border: '1px solid var(--primary)', color: 'var(--primary)',
                                                                background: '#eef2ff', cursor: 'pointer', transition: 'all 0.15s',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                        >
                                                            ✎ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(m.id)}
                                                            title="Hapus Material"
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                                border: '1px solid var(--accent-red)', color: 'var(--accent-red)',
                                                                background: '#fef2f2', cursor: 'pointer', transition: 'all 0.15s',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                                                        >
                                                            🗑 Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* =================== EDIT/ADD MODAL =================== */}
            {showModal && createPortal(
                <div
                    onClick={() => setShowModal(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: 20, width: '100%', maxWidth: 580,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideUp 0.25s ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                                    {editId ? '✎ Edit Material' : '+ Tambah Material Baru'}
                                </div>
                                {editId && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Ubah data material lalu klik Perbarui</div>}
                            </div>
                            <button onClick={() => setShowModal(false)}
                                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {editId && (
                                <div style={{ padding: '10px 16px', borderRadius: 10, background: '#eef2ff', border: '1px solid rgba(79,70,229,0.2)', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                                    ✎ Mode Edit — ubah data lalu klik Perbarui
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Kode *</label>
                                    <input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MAT-001" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Kategori *</label>
                                    <select className="form-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Nama Material *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap material" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Satuan *</label>
                                    <input className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="pcs, kg, m..." required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Stok Minimum</label>
                                    <input type="number" min="0" className="form-input" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Harga Satuan</label>
                                    <input type="number" min="0" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Keterangan</label>
                                <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan (opsional)" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                                <button type="button" onClick={() => setShowModal(false)}
                                    style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                    Batal
                                </button>
                                <button type="submit" disabled={submitting}
                                    style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), #4338ca)', boxShadow: '0 4px 12px rgba(79,70,229,0.3)', opacity: submitting ? 0.6 : 1 }}>
                                    {submitting ? 'Menyimpan...' : (editId ? '✎ Perbarui Material' : '+ Simpan Material')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-sec)',
    marginBottom: 6,
};
