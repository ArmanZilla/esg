import type { ReactNode } from 'react';

interface ChartCardProps {
    title: string;
    children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
    return (
        <div className="glass-card p-6" style={{ width: '100%', minWidth: 0 }}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">{title}</h3>
            <div style={{ width: '100%', height: '360px', minWidth: 0 }}>
                {children}
            </div>
        </div>
    );
}
