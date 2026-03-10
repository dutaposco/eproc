import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function VendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', contact: '', address: '', phone: '', email: '' });

    const fetchData = async () => {
        try {
            const res = await api.get('/vendors', { params: { search: search || undefined } });
            setVendors(res.data);
        } catch { toast.error('Gagal memuat data vendor'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [search]);

    const openNew = () => { setEditId(null); setForm({ name: '', contact: '', address: '', phone: '', email: '' }); setShowModal(true); };
    const openEdit = (v) => { setEditId(v.id); setForm({ name: v.name, contact: v.contact || '', address: v.address || '', phone: v.phone || '', email: v.email || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) { await api.put(`/vendors/${editId}`, form); toast.success('Vendor diperbarui'); }
            else { await api.post('/vendors', form); toast.success('Vendor ditambahkan'); }
            setShowModal(false); fetchData();
        } catch (err) { toast.error(err.response?.data?.error || 'Gagal menyimpan'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus vendor ini?')) return;
        try { await api.delete(`/vendors/${id}`); toast.success('Dihapus'); fetchData(); }
        catch (err) { toast.error(err.response?.data?.error || 'Gagal menghapus'); }
    };

    return (
        <div>
            <div className="print-only" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>DAFTAR VENDOR / SUPPLIER</h2>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>eProcure Material Management</p>
                <p style={{ fontSize: '12px' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }} className="hide-print">
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Daftar Vendor</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Kelola data supplier dan partner pengadaan</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={() => window.print()}>⎙ Print Daftar</button>
                    <button className="btn-primary" onClick={openNew}>+ Tambah Vendor</button>
                </div>
            </div>

            <div className="card">
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <input className="form-input" style={{ width: 280 }} placeholder="Cari vendor..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {loading ? <div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div> : (
                        <table className="data-table">
                            <thead><tr>
                                <th>No</th><th>Nama Vendor</th><th>Kontak Person</th><th>Telepon</th><th>Email</th><th>Alamat</th><th>Transaksi</th><th>Aksi</th>
                            </tr></thead>
                            <tbody>
                                {vendors.length === 0 ? <tr><td colSpan="8" className="empty-state">Belum ada vendor terdaftar</td></tr> :
                                    vendors.map((v, i) => (
                                        <tr key={v.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                            <td><strong>{v.name}</strong></td>
                                            <td>{v.contact || '-'}</td>
                                            <td>{v.phone || '-'}</td>
                                            <td>{v.email || '-'}</td>
                                            <td style={{ maxWidth: 200, fontSize: 12, color: 'var(--text-sec)' }} className="truncate">{v.address || '-'}</td>
                                            <td><span className="badge badge-ok" style={{ background: '#f0f9ff', color: 'var(--primary)' }}>{v._count.transactions} RIWAYAT</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button onClick={() => openEdit(v)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--primary)', color: 'var(--primary)', background: '#eef2ff', cursor: 'pointer' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = 'var(--primary)'; }}>
                                                        ✎ Edit
                                                    </button>
                                                    <button onClick={() => handleDelete(v.id)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--accent-red)', color: 'var(--accent-red)', background: '#fef2f2', cursor: 'pointer' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = 'white'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--accent-red)'; }}>
                                                        🗑 Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span style={{ fontSize: 15, fontWeight: 800 }}>{editId ? 'Edit Vendor' : 'Tambah Vendor Baru'}</span>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 6, display: 'block' }}>Nama Vendor *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: PT. Maju Bersama" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 6, display: 'block' }}>Kontak Person</label>
                                    <input className="form-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Nama PIC" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 6, display: 'block' }}>Email</label>
                                    <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="vendor@mail.com" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 6, display: 'block' }}>Telepon</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0812..." />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 6, display: 'block' }}>Alamat</label>
                                <textarea className="form-input" style={{ minHeight: 80 }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap vendor" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn-primary" style={{ paddingLeft: 24, paddingRight: 24 }}>{editId ? 'Perbarui' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
