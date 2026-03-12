import { NavLink, Outlet } from 'react-router-dom';
import { useSSE } from '../hooks/useSSE';
import { FilterBar } from './FilterBar';

const NAV = [
    { to: '/dashboard', label: 'Overview', icon: '📊' },
    { to: '/dashboard/gender', label: 'Gender & Diversity', icon: '⚖️' },
    { to: '/dashboard/engagement', label: 'Engagement', icon: '🤝' },
    { to: '/dashboard/volunteering', label: 'Volunteering', icon: '🌱' },
    { to: '/dashboard/esg-courses', label: 'ESG Courses', icon: '📚' },
    { to: '/methodology', label: 'Methodology', icon: '📋' },
];

export function Layout() {
    useSSE();

    return (
        <div style={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
            {/* ── Sidebar ── */}
            <aside style={{ width: '288px', flexShrink: 0 }} className="bg-slate-900 border-r border-slate-800 hidden lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto">
                {/* Brand */}
                <div className="px-6 pt-7 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-lg shadow-lg shadow-teal-500/25">
                            🏛️
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Social Impact</h1>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400/80">ESG Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 px-4 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-1">Analytics</p>
                    {NAV.map(n => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`
                            }
                        >
                            <span className="text-base w-5 text-center">{n.icon}</span>
                            <span>{n.label}</span>
                        </NavLink>
                    ))}

                    <div className="border-t border-slate-800/60 my-4" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-3 mb-1">Management</p>
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`
                        }
                    >
                        <span className="text-base w-5 text-center">🔐</span>
                        <span>Admin Panel</span>
                    </NavLink>
                </nav>
            </aside>

            {/* ── Main ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <FilterBar />
                <main style={{ flex: 1, width: '100%', overflowX: 'hidden' }} className="px-6 py-6 lg:px-8 xl:px-10 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
