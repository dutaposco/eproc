import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await login(username, password); toast.success('Login berhasil!'); }
        catch (err) { toast.error(err.response?.data?.error || 'Login gagal'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #ecfdf5 100%)', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 20,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(79,70,229,0.2)',
                    }}>
                        <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
                            <path d="M8 12h16M8 16h10M8 20h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M20 18l4-4-4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.03em' }}>eProcure</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Material Management System</p>
                </div>

                {/* Card */}
                <div className="card animate-slideUp" style={{ padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text-main)' }}>Selamat Datang</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Silakan login untuk melanjutkan</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 8 }}>Username</label>
                            <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" required />
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sec)', marginBottom: 8 }}>Password</label>
                            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" required />
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 14 }}>
                            {loading ? 'Loading...' : 'Masuk'}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, padding: 12, background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Demo Accounts:</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setUsername('admin'); setPassword('admin123') }} style={{
                                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: '#eef2ff', color: 'var(--primary)',
                                border: '1px solid rgba(79,70,229,0.15)', cursor: 'pointer', transition: 'all 0.15s',
                            }}>Admin</button>
                            <button onClick={() => { setUsername('staff'); setPassword('staff123') }} style={{
                                flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: '#ecfeff', color: 'var(--accent-cyan)',
                                border: '1px solid rgba(8,145,178,0.15)', cursor: 'pointer', transition: 'all 0.15s',
                            }}>Staff</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
