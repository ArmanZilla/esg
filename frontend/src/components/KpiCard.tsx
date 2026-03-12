interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
    delay?: number;
}

export function KpiCard({ title, value, subtitle, icon, color = 'teal', delay = 0 }: KpiCardProps) {
    const bgMap: Record<string, string> = {
        teal:   'bg-gradient-to-br from-slate-900 to-slate-800 border-teal-500/25',
        indigo: 'bg-gradient-to-br from-slate-900 to-slate-800 border-indigo-500/25',
        amber:  'bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/25',
        rose:   'bg-gradient-to-br from-slate-900 to-slate-800 border-rose-500/25',
        green:  'bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-500/25',
    };
    const textMap: Record<string, string> = {
        teal: 'text-teal-300', indigo: 'text-indigo-300', amber: 'text-amber-300',
        rose: 'text-rose-300', green: 'text-emerald-300',
    };
    const iconBgMap: Record<string, string> = {
        teal: 'bg-teal-500/15', indigo: 'bg-indigo-500/15', amber: 'bg-amber-500/15',
        rose: 'bg-rose-500/15', green: 'bg-emerald-500/15',
    };

    return (
        <div
            className={`kpi-card kpi-card-${color} ${bgMap[color] || bgMap.teal} border animate-fade-up`}
            style={{ animationDelay: `${delay}ms`, width: '100%', minWidth: 0 }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">{title}</p>
                    <p className={`text-4xl font-bold mt-2.5 tracking-tight ${textMap[color] || textMap.teal}`}>{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl ${iconBgMap[color] || iconBgMap.teal} flex items-center justify-center text-2xl shrink-0`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
