import { useState } from 'react';

interface DataTableProps {
    columns: { key: string; label: string }[];
    data: Record<string, unknown>[];
    filename?: string;
}

export function DataTable({ columns, data, filename = 'export' }: DataTableProps) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const sorted = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const va = a[sortKey], vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const exportCSV = () => {
        const header = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => {
            const v = row[c.key];
            return v == null ? '' : String(v);
        }).join(','));
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
                <span className="text-sm font-semibold text-[var(--color-text-muted)]">
                    {data.length} record{data.length !== 1 ? 's' : ''}
                </span>
                <button onClick={exportCSV} className="btn-secondary text-xs py-1 px-3">
                    📥 Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-border)]">
                            {columns.map(c => (
                                <th
                                    key={c.key}
                                    onClick={() => toggleSort(c.key)}
                                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] cursor-pointer hover:text-teal-400 transition whitespace-nowrap"
                                >
                                    {c.label}
                                    {sortKey === c.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row, i) => (
                            <tr key={i} className="border-b border-[var(--color-border)]/50 hover:bg-white/3 transition">
                                {columns.map(c => (
                                    <td key={c.key} className="px-4 py-2.5 whitespace-nowrap">
                                        {row[c.key] != null ? String(row[c.key]) : <span className="text-[var(--color-text-muted)]">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {sorted.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-8 text-[var(--color-text-muted)]">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
