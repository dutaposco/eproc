import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (!data) return <div className="empty-state">Gagal memuat data</div>;

    const { stats, recentTransactions, lowStockItems } = data;
    const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Dashboard</h1>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Ringkasan aktivitas material hari ini</div>
            </div>

            {/* 4 Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {/* Total Material Masuk */}
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => navigate('/material-in')}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="stat-icon in">↓</div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>Total Material Masuk</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.03em' }}>{stats.totalIn.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--accent-in)', fontWeight: 600, marginTop: 4 }}>+{stats.todayIn} hari ini</div>
                    </div>
                </div>

                {/* Total Material Keluar */}
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => navigate('/material-out')}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="stat-icon out">↑</div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>Total Material Keluar</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.03em' }}>{stats.totalOut.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--accent-out)', fontWeight: 600, marginTop: 4 }}>{stats.todayOut} hari ini</div>
                    </div>
                </div>

                {/* Total Item Inventaris */}
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => navigate('/inventory')}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="stat-icon inv">🏠</div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>Total Item Inventaris</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.03em' }}>{stats.totalMaterials}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{stats.totalMaterials} jenis material</div>
                    </div>
                </div>

                {/* Total Transaksi */}
                <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => navigate('/history')}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div className="stat-icon tx">🕐</div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 600, marginBottom: 4 }}>Total Transaksi</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, letterSpacing: '-0.03em' }}>{stats.totalTransactions}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>semua waktu</div>
                    </div>
                </div>
            </div>

            {/* Bottom grid: Recent + Low Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                {/* Transaksi Terbaru */}
                <div className="card">
                    <div className="card-header">
                        <h3>Transaksi Terbaru</h3>
                        <button onClick={() => navigate('/history')}>Lihat Semua</button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Kode</th>
                                <th>Material</th>
                                <th>Jumlah</th>
                                <th>Tipe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Belum ada transaksi</td></tr>
                            ) : recentTransactions.map(t => (
                                <tr key={t.id}>
                                    <td style={{ color: 'var(--text-sec)' }}>{formatDate(t.date)}</td>
                                    <td><code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.material?.code}</code></td>
                                    <td style={{ fontWeight: 600 }}>{t.material?.name}</td>
                                    <td><strong>{t.qty}</strong> <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t.material?.unit}</span></td>
                                    <td>
                                        <span className={`badge ${t.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                                            {t.type === 'IN' ? '↓ Masuk' : '↑ Keluar'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Stok Hampir Habis */}
                <div className="card">
                    <div className="card-header">
                        <h3>Stok Hampir Habis</h3>
                        <button onClick={() => navigate('/inventory')}>Inventaris</button>
                    </div>
                    <div>
                        {lowStockItems.length === 0 ? (
                            <div className="empty-state">✓ Semua stok dalam kondisi aman</div>
                        ) : lowStockItems.map(m => (
                            <div className="low-stock-item" key={m.id}>
                                <div className={`ls-icon ${m.stock <= 0 ? 'danger' : 'warn'}`}>
                                    {m.stock <= 0 ? '🚫' : '⚠️'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{m.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.code} · Min: {m.minStock} {m.unit}</div>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: m.stock <= 0 ? 'var(--accent-red)' : 'var(--accent-out)', whiteSpace: 'nowrap' }}>
                                    {m.stock} {m.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
