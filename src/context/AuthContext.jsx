import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('eproc_token');
        const savedUser = localStorage.getItem('eproc_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            // Verify token
            api.get('/auth/me').then(res => {
                setUser(res.data);
                localStorage.setItem('eproc_user', JSON.stringify(res.data));
            }).catch(() => {
                logout();
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, user } = res.data;
        localStorage.setItem('eproc_token', token);
        localStorage.setItem('eproc_user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('eproc_token');
        localStorage.removeItem('eproc_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
