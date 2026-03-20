import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';

const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function EngagementPage() {
    const { t } = useTranslation();
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getEngagement(selectedYear, selectedFaculty)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="flex items-center gap-3 text-teal-400"><div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /><span className="text-lg font-medium">{t('loading')}</span></div></div>;
    if (!data?.data?.length) return <div className="flex flex-col items-center justify-center h-[60vh] w-full"><div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">🤝</div><h3 className="text-xl font-semibold text-slate-300">{t('no_engagement_data')}</h3></div>;

    const satisfactionLabel = t('satisfaction');
    const clubLabel = t('club_participation');
    const avgSatisfactionLabel = t('avg_satisfaction');

    const byFaculty = data.data.reduce((acc: any[], r: any) => {
        const f = acc.find((x: any) => x.faculty === r.faculty);
        if (f) { f.satisfaction += r.satisfaction_pct; f.participation += r.club_participation_pct || 0; f.count += 1; }
        else { acc.push({ faculty: r.faculty, satisfaction: r.satisfaction_pct, participation: r.club_participation_pct || 0, count: 1 }); }
        return acc;
    }, []).map((f: any) => ({
        faculty: f.faculty.length > 15 ? f.faculty.substring(0, 15) + '…' : f.faculty,
        [satisfactionLabel]: Math.round(f.satisfaction / f.count * 10) / 10,
        [clubLabel]: Math.round(f.participation / f.count * 10) / 10,
    }));

    const byYear = data.data.reduce((acc: any[], r: any) => {
        const y = acc.find((x: any) => x.year === r.year);
        if (y) { y.satisfaction += r.satisfaction_pct; y.count += 1; }
        else { acc.push({ year: r.year, satisfaction: r.satisfaction_pct, count: 1 }); }
        return acc;
    }, []).map((y: any) => ({
        year: y.year, [avgSatisfactionLabel]: Math.round(y.satisfaction / y.count * 10) / 10,
    })).sort((a: any, b: any) => a.year - b.year);

    const columns = [
        { key: 'year', label: t('col_year') }, { key: 'faculty', label: t('col_faculty') },
        { key: 'satisfaction_pct', label: t('col_satisfaction_pct') }, { key: 'nps', label: t('col_nps') },
        { key: 'club_participation_pct', label: t('col_club_participation_pct') }, { key: 'avg_activities_per_student', label: t('col_avg_activities') },
    ];

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">{t('engagement_page_title')}</h2>
                <p className="text-sm text-slate-400 mt-1.5">{t('engagement_page_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ width: '100%' }}>
                <KpiCard title={t('kpi_satisfaction')} value={`${data.summary.avg_satisfaction_pct}%`} icon="😊" color="teal" />
                <KpiCard title={t('kpi_avg_nps')} value={data.summary.avg_nps != null ? data.summary.avg_nps : 'N/A'} icon="📈" color="indigo" delay={100} />
                <KpiCard title={t('kpi_records')} value={data.summary.total_records} icon="📋" color="amber" delay={200} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ width: '100%' }}>
                <ChartCard title={t('chart_student_satisfaction')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byFaculty}>
                            <XAxis dataKey="faculty" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Bar dataKey={satisfactionLabel} fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={28} />
                            <Bar dataKey={clubLabel} fill="#818cf8" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title={t('chart_satisfaction_trend')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={byYear}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Line type="monotone" dataKey={avgSatisfactionLabel} stroke="#2dd4bf" strokeWidth={3} dot={{ r: 6, fill: '#2dd4bf', stroke: '#020617', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <DataTable columns={columns} data={data.data} filename="engagement_metrics" />
        </div>
    );
}
