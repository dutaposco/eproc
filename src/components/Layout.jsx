import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', section: 'MENU UTAMA' },
    { path: '/material-in', label: 'Material Masuk', icon: '↓', badgeType: 'in' },
    { path: '/material-out', label: 'Material Keluar', icon: '↑', badgeType: 'out' },
    { path: '/inventory', label: 'Inventaris', icon: '🏠' },
    { path: '/vendors', label: 'Daftar Vendor', icon: '🤝' },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: '🛒' },
    { path: '/history', label: 'Riwayat Transaksi', icon: '🕐' },
    { path: '/report', label: 'Laporan', icon: '📄', section: 'LAPORAN' },
];

const SIDEBAR_FULL = 240;
const SIDEBAR_MINI = 64;

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [counts, setCounts] = useState({ in: 0, out: 0 });

    const sidebarWidth = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;
    const currentTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        api.get('/transactions', { params: { type: 'IN', limit: 1 } })
            .then(res => setCounts(prev => ({ ...prev, in: res.data.total })))
            .catch(() => { });
        api.get('/transactions', { params: { type: 'OUT', limit: 1 } })
            .then(res => setCounts(prev => ({ ...prev, out: res.data.total })))
            .catch(() => { });
    }, [location.pathname]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* Sidebar */}
            <aside className="sidebar" style={{
                position: 'fixed', top: 0, left: 0, height: '100vh',
                width: sidebarWidth,
                background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', zIndex: 95,
                boxShadow: '2px 0 8px rgba(0,0,0,0.03)',
                transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
            }}>
                {/* Logo — klik untuk toggle collapse */}
                <div style={{
                    padding: collapsed ? '17px 13px' : '17px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    minHeight: 72, overflow: 'hidden',
                }}>
                    <div
                        onClick={() => setCollapsed(c => !c)}
                        title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
                        style={{
                            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(79,70,229,0.25)',
                            cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(79,70,229,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.25)'; }}
                    >
                        <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
                            <path d="M8 12h16M8 16h10M8 20h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {!collapsed && (
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>eProcure</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, whiteSpace: 'nowrap' }}>Material Management</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {navItems.map((item, idx) => (
                        <div key={item.path}>
                            {item.section && !collapsed && (
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em',
                                    padding: '0 10px', marginTop: idx > 0 ? 24 : 0, marginBottom: 8,
                                    whiteSpace: 'nowrap',
                                }}>{item.section}</div>
                            )}
                            {item.section && collapsed && idx > 0 && (
                                <div style={{ borderTop: '1px solid var(--border)', margin: '10px 4px' }} />
                            )}
                            <NavLink
                                to={item.path}
                                end={item.path === '/'}
                                title={collapsed ? item.label : undefined}
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: 10,
                                    padding: collapsed ? '10px 0' : '10px 12px',
                                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                                    marginBottom: 2, textDecoration: 'none', position: 'relative',
                                    transition: 'all 0.15s',
                                    background: isActive ? '#eef2ff' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-sec)',
                                    border: isActive ? '1px solid rgba(79,70,229,0.12)' : '1px solid transparent',
                                })}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && !collapsed && <div style={{
                                            position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
                                            width: 3, height: 20, background: 'var(--primary)', borderRadius: '0 3px 3px 0',
                                        }} />}
                                        <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                                        {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
                                        {!collapsed && item.badgeType && (
                                            <span className={`nav-badge ${item.badgeType === 'out' ? 'out' : ''}`}>
                                                {item.badgeType === 'in' ? counts.in : counts.out}
                                            </span>
                                        )}
                                        {collapsed && item.badgeType && (
                                            <span style={{
                                                position: 'absolute', top: 4, right: 4,
                                                background: item.badgeType === 'out' ? 'var(--accent-out)' : 'var(--primary)',
                                                color: 'white', fontSize: 8, fontWeight: 700,
                                                minWidth: 14, height: 14, borderRadius: 7,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                padding: '0 3px',
                                            }}>
                                                {item.badgeType === 'in' ? counts.in : counts.out}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </div>
                    ))}
                </nav>

                {/* User */}
                <div style={{ padding: collapsed ? '16px 8px' : '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: 14, color: 'white', flexShrink: 0,
                        }}>{user?.fullName?.[0] || 'A'}</div>
                        {!collapsed && (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName || 'User'}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role || 'STAFF'}</div>
                                </div>
                                <button onClick={logout} style={{
                                    background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
                                    padding: 6, borderRadius: 8, color: 'var(--text-muted)',
                                    transition: 'all 0.15s', fontSize: 14,
                                }} title="Logout"
                                    onMouseEnter={e => { e.target.style.color = 'var(--accent-red)'; e.target.style.background = '#fef2f2'; e.target.style.borderColor = 'var(--accent-red)'; }}
                                    onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none'; e.target.style.borderColor = 'var(--border)'; }}
                                >⏻</button>
                            </>
                        )}
                        {collapsed && (
                            <button onClick={logout} title="Logout" style={{
                                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                                display: 'none',
                            }} />
                        )}
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div className="main-content" style={{
                flex: 1,
                marginLeft: sidebarWidth,
                display: 'flex', flexDirection: 'column', minHeight: '100vh',
                transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Top bar */}
                <header className="topbar" style={{
                    height: 56, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
                    gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', flex: 1 }}>{currentTitle}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 12 }}>{today}</div>
                    <button className="action-btn in" onClick={() => navigate('/material-in')}>↓ Material Masuk</button>
                    <button className="action-btn out" onClick={() => navigate('/material-out')}>↑ Material Keluar</button>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, padding: '28px 28px 40px' }}>
                    <div className="animate-fadeIn">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
