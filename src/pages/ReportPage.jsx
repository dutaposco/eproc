import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ReportPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try { const res = await api.get('/dashboard/report', { params: { month, year } }); setData(res.data); }
        catch { toast.error('Gagal generate'); }
        finally { setLoading(false); }
    };

    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return (
        <div>
            <div className="print-only" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>LAPORAN REKAPITULASI MATERIAL</h2>
                <p style={{ fontSize: '14px', margin: '4px 0' }}>Periode: {months[month]} {year}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>

            <div style={{ marginBottom: 24 }} className="hide-print">
                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Laporan</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Rekap dan analisis material per bulan</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                    <div className="card-header"><h3>Rekap Bulanan</h3></div>
                    <div style={{ padding: 20 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <select className="form-input" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select className="form-input" style={{ width: 100 }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
                                <option value="2025">2025</option><option value="2026">2026</option>
                            </select>
                            <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? '...' : 'Generate'}</button>
                            {data && <button className="btn-secondary" onClick={() => window.print()}>Print Laporan</button>}
                        </div>
                        {data && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--text-sec)', fontSize: 14 }}>Total Masuk</span>
                                    <strong style={{ color: 'var(--accent-in)', fontSize: 16 }}>{data.totalIn} item</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--text-sec)', fontSize: 14 }}>Total Keluar</span>
                                    <strong style={{ color: 'var(--accent-out)', fontSize: 16 }}>{data.totalOut} item</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                    <span style={{ color: 'var(--text-sec)', fontSize: 14 }}>Saldo Akhir</span>
                                    <strong style={{ fontSize: 20 }}>{data.balance} item</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3>Top Material Keluar</h3></div>
                    <div style={{ padding: 20 }}>
                        {!data || data.topOut.length === 0 ? <div className="empty-state">Belum ada data</div> :
                            data.topOut.map((m, i) => {
                                const max = data.topOut[0]?.out || 1;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: 'var(--accent-out)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                                            <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent-out),#d97706)', borderRadius: 99, width: `${(m.out / max * 100).toFixed(1)}%`, transition: 'width 0.5s' }} />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-out)', whiteSpace: 'nowrap' }}>{m.out} {m.unit}</div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            {
                data && data.details.length > 0 && (
                    <div className="card">
                        <div className="card-header"><h3>Detail Laporan</h3></div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead><tr><th>Kode</th><th>Material</th><th>Masuk</th><th>Keluar</th><th>Saldo</th><th>Satuan</th></tr></thead>
                                <tbody>
                                    {data.details.map((m, i) => (
                                        <tr key={i}>
                                            <td><code style={{ fontSize: 11 }}>{m.code}</code></td>
                                            <td style={{ fontWeight: 600 }}>{m.name}</td>
                                            <td style={{ color: 'var(--accent-in)' }}>{m.in}</td>
                                            <td style={{ color: 'var(--accent-out)' }}>{m.out}</td>
                                            <td><strong>{m.in - m.out}</strong></td>
                                            <td style={{ color: 'var(--text-sec)' }}>{m.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
