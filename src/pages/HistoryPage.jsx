import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function HistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [period, setPeriod] = useState('');

    useEffect(() => {
        setLoading(true);
        api.get('/transactions', { params: { type: typeFilter || undefined, search: search || undefined, period: period || undefined, limit: 200 } })
            .then(res => setTransactions(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, typeFilter, period]);

    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (iso) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Riwayat Transaksi</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Semua aktivitas material masuk dan keluar</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <input className="form-input" style={{ width: 220 }} placeholder="Cari transaksi..." value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="form-input" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="">Semua Tipe</option><option value="IN">Material Masuk</option><option value="OUT">Material Keluar</option>
                    </select>
                    <select className="form-input" style={{ width: 150 }} value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="">Semua Tanggal</option><option value="today">Hari Ini</option><option value="week">Minggu Ini</option><option value="month">Bulan Ini</option>
                    </select>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {loading ? <div className="empty-state"><div style={{ width: 24, height: 24, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div> : (
                        <table className="data-table">
                            <thead><tr>
                                <th>No</th><th>Tanggal</th><th>Tipe</th><th>No. Ref</th><th>Material</th><th>Jumlah</th><th>Satuan</th><th>Pihak</th><th>Dibuat</th><th>Ket.</th>
                            </tr></thead>
                            <tbody>
                                {transactions.length === 0 ? <tr><td colSpan="10" className="empty-state">Belum ada riwayat</td></tr> :
                                    transactions.map((t, i) => (
                                        <tr key={t.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                            <td style={{ color: 'var(--text-sec)' }}>{formatDate(t.date)}<br /><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(t.createdAt)}</span></td>
                                            <td><span className={`badge ${t.type === 'IN' ? 'badge-in' : 'badge-out'}`}>{t.type === 'IN' ? '↓ Masuk' : '↑ Keluar'}</span></td>
                                            <td><code style={{ fontSize: 11 }}>{t.refNo}</code></td>
                                            <td style={{ fontWeight: 600 }}>{t.material?.name}</td>
                                            <td><strong>{t.qty}</strong></td>
                                            <td style={{ color: 'var(--text-sec)' }}>{t.material?.unit}</td>
                                            <td style={{ color: 'var(--text-sec)' }}>{t.party}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.createdBy?.fullName || '-'}</td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.notes}>{t.notes}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
