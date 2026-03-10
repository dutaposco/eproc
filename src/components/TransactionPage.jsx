import { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function TransactionPage({ type }) {
    const [transactions, setTransactions] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [period, setPeriod] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [printingTx, setPrintingTx] = useState(null);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        refNo: '', materialId: '', qty: '', party: '', notes: ''
    });

    const isIn = type === 'IN';
    const title = isIn ? 'Material Masuk' : 'Material Keluar';

    const fetchData = async () => {
        try {
            const [txRes, matRes] = await Promise.all([
                api.get('/transactions', { params: { type, search: search || undefined, period: period || undefined, limit: 100 } }),
                api.get('/materials'),
            ]);
            setTransactions(txRes.data.data);
            setMaterials(matRes.data);
        } catch (err) {
            toast.error('Gagal memuat data');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [search, period]);

    const resetForm = () => {
        setForm({ date: new Date().toISOString().split('T')[0], refNo: '', materialId: '', qty: '', party: '', notes: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/transactions', {
                ...form, type,
                materialId: parseInt(form.materialId),
                qty: parseInt(form.qty)
            });
            toast.success(`${title} berhasil dicatat!`);
            resetForm();
            setShowForm(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal menyimpan');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus transaksi ini?')) return;
        try { await api.delete(`/transactions/${id}`); toast.success('Dihapus'); fetchData(); }
        catch { toast.error('Gagal menghapus'); }
    };

    const handlePrint = (tx) => {
        setPrintingTx(tx);
        setTimeout(() => {
            window.print();
            const reset = () => {
                setPrintingTx(null);
                window.removeEventListener('afterprint', reset);
            };
            window.addEventListener('afterprint', reset);
        }, 300);
    };

    const handlePrintList = () => {
        setPrintingTx(null);
        setTimeout(() => window.print(), 100);
    };

    const selectedMaterial = materials.find(m => m.id === parseInt(form.materialId));
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className={printingTx ? 'printing-single-tx' : ''}>
            {/* Print header for full list */}
            <div className="print-only tx-list-header" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>LAPORAN {title.toUpperCase()}</h2>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>eProcure Material Management</p>
                <p style={{ fontSize: '12px' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            {/* Screen header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }} className="hide-print">
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        {isIn ? 'Catat penerimaan material masuk ke gudang' : 'Catat pengeluaran material dari gudang'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={handlePrintList}>⎙ Print Daftar</button>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Tutup Form' : `+ Tambah ${title}`}
                    </button>
                </div>
            </div>

            {/* ==================== FORM INPUT ==================== */}
            {showForm && (
                <div className="card animate-slideUp tx-list-section" style={{ marginBottom: 24, border: isIn ? '2px solid rgba(5,150,105,0.2)' : '2px solid rgba(217,119,6,0.2)' }}>
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: isIn ? '#ecfdf5' : '#fffbeb',
                    }}>
                        <div className={`stat-icon ${isIn ? 'in' : 'out'}`} style={{ width: 36, height: 36, fontSize: 18 }}>
                            {isIn ? '↓' : '↑'}
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>Form {title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Isi data di bawah untuk mencatat transaksi</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={labelStyle}>Tanggal *</label>
                                <input type="date" className="form-input" value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                            <div>
                                <label style={labelStyle}>{isIn ? 'No. PO / Referensi' : 'No. WO / Referensi'}</label>
                                <input className="form-input" value={form.refNo}
                                    onChange={e => setForm({ ...form, refNo: e.target.value })}
                                    placeholder="Kosongkan untuk otomatis" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <label style={labelStyle}>Material *</label>
                                <select className="form-input" value={form.materialId}
                                    onChange={e => setForm({ ...form, materialId: e.target.value })} required>
                                    <option value="">-- Pilih Material --</option>
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.code} – {m.name} ({m.unit}) {!isIn ? `[Stok: ${m.stock}]` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Jumlah ({selectedMaterial?.unit || '...'}) *</label>
                                <input type="number" min="1" className="form-input" value={form.qty}
                                    onChange={e => setForm({ ...form, qty: e.target.value })}
                                    placeholder="0" required />
                            </div>
                        </div>

                        {selectedMaterial && !isIn && (
                            <div style={{
                                padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16,
                                background: selectedMaterial.stock <= 0 ? '#fef2f2' : '#ecfdf5',
                                color: selectedMaterial.stock <= 0 ? 'var(--accent-red)' : 'var(--accent-in)',
                                border: `1px solid ${selectedMaterial.stock <= 0 ? 'rgba(220,38,38,0.15)' : 'rgba(5,150,105,0.15)'}`,
                            }}>
                                📦 Stok tersedia: <strong>{selectedMaterial.stock} {selectedMaterial.unit}</strong>
                                {form.qty && parseInt(form.qty) > selectedMaterial.stock && (
                                    <span style={{ color: 'var(--accent-red)', marginLeft: 12 }}>⚠️ Melebihi stok!</span>
                                )}
                            </div>
                        )}

                        {selectedMaterial && isIn && (
                            <div style={{
                                padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16,
                                background: '#eef2ff', color: 'var(--primary)',
                                border: '1px solid rgba(79,70,229,0.12)',
                            }}>
                                📦 Stok saat ini: <strong>{selectedMaterial.stock} {selectedMaterial.unit}</strong>
                                {form.qty && <span style={{ marginLeft: 8 }}>→ Setelah masuk: <strong>{selectedMaterial.stock + parseInt(form.qty || 0)} {selectedMaterial.unit}</strong></span>}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={labelStyle}>{isIn ? 'Supplier / Pengirim' : 'Departemen / Tujuan'}</label>
                                <input className="form-input" value={form.party}
                                    onChange={e => setForm({ ...form, party: e.target.value })}
                                    placeholder={isIn ? 'Nama supplier' : 'Departemen / tujuan'} />
                            </div>
                            <div>
                                <label style={labelStyle}>Keterangan</label>
                                <input className="form-input" value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Catatan tambahan..." />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="btn-secondary" onClick={() => { resetForm(); setShowForm(false); }}>
                                Batal
                            </button>
                            <button type="submit" className="btn-primary" disabled={submitting}
                                style={{ background: isIn ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #d97706, #b45309)', boxShadow: isIn ? '0 4px 12px rgba(5,150,105,0.25)' : '0 4px 12px rgba(217,119,6,0.25)' }}>
                                {submitting ? 'Menyimpan...' : `Simpan ${title}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ==================== TABLE DATA ==================== */}
            <div className="card tx-list-section">
                <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }} className="hide-print">
                    <input className="form-input" style={{ width: 240 }}
                        placeholder="🔍 Cari material..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="form-input" style={{ width: 160 }} value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="">Semua Tanggal</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                    </select>
                    <div style={{ flex: 1 }} />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Total: {transactions.length} transaksi
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div className="empty-state">
                            <div style={{ width: 24, height: 24, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal</th>
                                    <th>No. Ref</th>
                                    <th>Material</th>
                                    <th>Satuan</th>
                                    <th>Jumlah</th>
                                    <th>{isIn ? 'Supplier' : 'Dept/Tujuan'}</th>
                                    <th>Keterangan</th>
                                    <th className="hide-print">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr><td colSpan="9" className="empty-state">Belum ada data transaksi</td></tr>
                                ) : transactions.map((t, i) => (
                                    <tr key={t.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td style={{ color: 'var(--text-sec)', whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                                        <td><code style={{ fontSize: 11, color: isIn ? 'var(--accent-in)' : 'var(--accent-out)', fontWeight: 600 }}>{t.refNo}</code></td>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{t.material?.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.material?.code}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-sec)' }}>{t.material?.unit}</td>
                                        <td>
                                            <strong style={{ color: isIn ? 'var(--accent-in)' : 'var(--accent-out)', fontSize: 15 }}>{t.qty}</strong>
                                        </td>
                                        <td style={{ color: 'var(--text-sec)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.party || '-'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.notes}>
                                            {t.notes || '-'}
                                        </td>
                                        <td className="hide-print">
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handlePrint(t)} title="Print Bukti"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--primary)', color: 'var(--primary)', background: '#eef2ff', cursor: 'pointer' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = 'var(--primary)'; }}>
                                                    ⎙ Print
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} title="Hapus"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid var(--accent-red)', color: 'var(--accent-red)', background: '#fef2f2', cursor: 'pointer' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = 'var(--accent-red)'; }}>
                                                    🗑 Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Single transaction slip - hidden on screen, shown only when printing single */}
            {printingTx && (
                <div className="tx-single-doc" style={{ padding: '40px', color: '#000', maxWidth: '800px', margin: '0 auto', display: 'none' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>BUKTI {isIn ? 'MATERIAL MASUK' : 'MATERIAL KELUAR'}</h2>
                        <p style={{ fontSize: '14px', margin: '4px 0' }}>eProcure Material Management System</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <p style={{ fontSize: '13px' }}><strong>Tanggal:</strong> {formatDate(printingTx.date)}</p>
                            <p style={{ fontSize: '13px' }}><strong>No. Referensi:</strong> {printingTx.refNo}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '13px' }}><strong>{isIn ? 'Supplier:' : 'Tujuan:'}</strong> {printingTx.party || '-'}</p>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Kode Material</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>Nama Material</th>
                                <th style={{ textAlign: 'right', padding: '10px' }}>Jumlah</th>
                                <th style={{ textAlign: 'center', padding: '10px' }}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <td style={{ padding: '10px' }}>{printingTx.material?.code}</td>
                                <td style={{ padding: '10px' }}>{printingTx.material?.name}</td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{printingTx.qty}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{printingTx.material?.unit}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginBottom: '40px' }}>
                        <p style={{ fontSize: '13px' }}><strong>Keterangan:</strong></p>
                        <p style={{ fontSize: '13px', fontStyle: 'italic' }}>{printingTx.notes || '-'}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', marginTop: '60px' }}>
                        <div>
                            <p style={{ fontSize: '12px', marginBottom: '60px' }}>Dibuat Oleh,</p>
                            <div style={{ borderBottom: '1px solid #000', margin: '0 20px' }}></div>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>Administrasi Gudang</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', marginBottom: '60px' }}>{isIn ? 'Dikirim Oleh,' : 'Disetujui Oleh,'}</p>
                            <div style={{ borderBottom: '1px solid #000', margin: '0 20px' }}></div>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>{isIn ? 'Supplier/Kurir' : 'Kepala Gudang'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', marginBottom: '60px' }}>Diterima Oleh,</p>
                            <div style={{ borderBottom: '1px solid #000', margin: '0 20px' }}></div>
                            <p style={{ fontSize: '12px', marginTop: '5px' }}>Penerima</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', fontSize: '10px', color: '#666', textAlign: 'center', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                        Dicetak otomatis oleh Sistem eProcure pada {new Date().toLocaleString('id-ID')}
                    </div>
                </div>
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
