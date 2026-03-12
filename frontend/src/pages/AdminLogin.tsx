import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.login(username, password);
            localStorage.setItem('admin_token', res.access_token);
            navigate('/admin/uploads');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
            <div className="glass-card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <span className="text-4xl">🔐</span>
                    <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">Sign in to manage datasets</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none transition"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
