import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';

const COLORS = ['#2dd4bf', '#818cf8', '#fbbf24', '#fb7185'];
const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function GenderPage() {
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getGender(selectedYear, selectedFaculty)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="flex items-center gap-3 text-teal-400"><div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /><span className="text-lg font-medium">Loading...</span></div></div>;
    if (!data?.data?.length) return <div className="flex flex-col items-center justify-center h-[60vh] w-full"><div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">⚖️</div><h3 className="text-xl font-semibold text-slate-300">No gender data available</h3></div>;

    const byFaculty: Record<string, { faculty: string; male: number; female: number; count: number }> = {};
    data.data.forEach((r: any) => {
        if (!byFaculty[r.faculty]) byFaculty[r.faculty] = { faculty: r.faculty, male: 0, female: 0, count: 0 };
        byFaculty[r.faculty].male += r.male_pct;
        byFaculty[r.faculty].female += r.female_pct;
        byFaculty[r.faculty].count += 1;
    });
    const barData = Object.values(byFaculty).map(f => ({
        faculty: f.faculty.length > 15 ? f.faculty.substring(0, 15) + '…' : f.faculty,
        Male: Math.round(f.male / f.count * 10) / 10,
        Female: Math.round(f.female / f.count * 10) / 10,
    }));

    const pieData = [
        { name: 'Female', value: data.summary.avg_female_pct },
        { name: 'Male', value: data.summary.avg_male_pct },
    ];

    const columns = [
        { key: 'year', label: 'Year' }, { key: 'faculty', label: 'Faculty' },
        { key: 'group_type', label: 'Group' }, { key: 'male_pct', label: 'Male %' },
        { key: 'female_pct', label: 'Female %' }, { key: 'other_pct', label: 'Other %' },
        { key: 'women_leadership_pct', label: 'Women Leadership %' }, { key: 'pay_gap_pct', label: 'Pay Gap %' },
    ];

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Gender Balance & Diversity</h2>
                <p className="text-sm text-slate-400 mt-1.5">Gender distribution across faculties</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ width: '100%' }}>
                <KpiCard title="Avg. Female %" value={`${data.summary.avg_female_pct}%`} icon="👩" color="teal" />
                <KpiCard title="Avg. Male %" value={`${data.summary.avg_male_pct}%`} icon="👨" color="indigo" delay={100} />
                <KpiCard title="Women in Leadership" value={data.summary.avg_women_leadership_pct != null ? `${data.summary.avg_women_leadership_pct}%` : 'N/A'} icon="👑" color="amber" delay={200} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ width: '100%' }}>
                <ChartCard title="Gender by Faculty">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis dataKey="faculty" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Bar dataKey="Female" fill={COLORS[0]} radius={[6, 6, 0, 0]} barSize={28} />
                            <Bar dataKey="Male" fill={COLORS[1]} radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Overall Gender Split">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <DataTable columns={columns} data={data.data} filename="gender_metrics" />
        </div>
    );
}
