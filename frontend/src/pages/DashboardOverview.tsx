import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { useExport } from '../context/ExportContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { PageSkeleton } from '../components/SkeletonLoader';
import { exportToCSV, exportToPNG, exportToPDF } from '../utils/exportUtils';

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#22c55e'];
const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function DashboardOverview() {
    const { t } = useTranslation();
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const { registerHandlers, clearHandlers } = useExport();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const chartRef1 = useRef<HTMLDivElement>(null);
    const chartRef2 = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    // Keep latest values in refs so export callbacks are always stable
    const stateRef = useRef({ summary, selectedYear, selectedFaculty, t });
    stateRef.current = { summary, selectedYear, selectedFaculty, t };

    useEffect(() => {
        setLoading(true);
        api.getSummary(selectedYear, selectedFaculty)
            .then(setSummary)
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    // Register export handlers ONCE on mount, clear on unmount
    useEffect(() => {
        registerHandlers({
            csv: () => {
                const { summary: s, selectedYear: yr, t: tr } = stateRef.current;
                if (!s) return;
                const cols = [
                    { key: 'metric', label: tr('metric') },
                    { key: 'value', label: tr('value') },
                ];
                const rows = [
                    { metric: tr('kpi_female_representation'), value: `${s.gender.avg_female_pct}%` },
                    { metric: tr('kpi_satisfaction'), value: `${s.engagement.avg_satisfaction_pct}%` },
                    { metric: tr('kpi_volunteers'), value: s.volunteering.total_volunteers },
                    { metric: tr('kpi_esg_courses'), value: s.esg_courses.total_courses },
                ];
                exportToCSV(cols, rows, `overview-${yr || 'all'}`);
            },
            png: async () => {
                if (!pageRef.current) return;
                await exportToPNG(pageRef.current, `dashboard-overview-${stateRef.current.selectedYear || 'all'}.png`);
            },
            pdf: async () => {
                const { summary: s, selectedYear: yr, selectedFaculty: fac, t: tr } = stateRef.current;
                if (!s) return;
                const sections: { title: string; element: HTMLElement }[] = [];
                if (chartRef1.current) sections.push({ title: tr('chart_gender_distribution'), element: chartRef1.current });
                if (chartRef2.current) sections.push({ title: tr('chart_key_metrics'), element: chartRef2.current });
                await exportToPDF({
                    title: tr('report_title'),
                    subtitle: tr('dashboard_description'),
                    year: yr,
                    faculty: fac,
                    generatedAt: new Date().toLocaleString(),
                    kpis: [
                        { label: tr('kpi_female_representation'), value: `${s.gender.avg_female_pct}%` },
                        { label: tr('kpi_satisfaction'), value: `${s.engagement.avg_satisfaction_pct}%` },
                        { label: tr('kpi_volunteers'), value: String(s.volunteering.total_volunteers) },
                        { label: tr('kpi_esg_courses'), value: String(s.esg_courses.total_courses) },
                    ],
                    sections,
                    t: tr,
                });
            },
        });
        return () => clearHandlers();
    }, [registerHandlers, clearHandlers]);

    if (loading) return <PageSkeleton />;

    if (!summary || (!summary.gender?.records && !summary.engagement?.records))
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">📊</div>
                <h3 className="text-xl font-semibold text-slate-300">{t('no_data_title')}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">{t('no_data_description')}</p>
            </div>
        );

    const genderChartData = [
        { name: t('female'), value: summary.gender.avg_female_pct },
        { name: t('male'), value: summary.gender.avg_male_pct },
    ];

    const overviewBars = [
        { name: t('satisfaction'), value: summary.engagement.avg_satisfaction_pct, fill: COLORS[0] },
        { name: t('women_leadership'), value: summary.gender.avg_women_leadership_pct || 0, fill: COLORS[1] },
        { name: t('esg_coverage'), value: summary.esg_courses.avg_esg_students_pct || 0, fill: COLORS[2] },
    ];

    return (
        <div ref={pageRef} className="w-full min-w-0 space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">{t('dashboard_overview')}</h2>
                <p className="text-sm text-slate-400 mt-1">{t('dashboard_description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full min-w-0">
                <KpiCard title={t('kpi_female_representation')} value={`${summary.gender.avg_female_pct}%`} subtitle={`${summary.gender.records} ${t('records')}`} icon="⚖️" color="teal" delay={0} />
                <KpiCard title={t('kpi_satisfaction')} value={`${summary.engagement.avg_satisfaction_pct}%`} subtitle={summary.engagement.avg_nps != null ? `NPS: ${summary.engagement.avg_nps}` : undefined} icon="😊" color="indigo" delay={100} />
                <KpiCard title={t('kpi_volunteers')} value={summary.volunteering.total_volunteers.toLocaleString()} subtitle={`${summary.volunteering.total_hours.toLocaleString()} ${t('hours')}`} icon="🤲" color="green" delay={200} />
                <KpiCard title={t('kpi_esg_courses')} value={summary.esg_courses.total_courses} subtitle={summary.esg_courses.avg_esg_students_pct != null ? `${summary.esg_courses.avg_esg_students_pct}% ${t('coverage')}` : undefined} icon="📚" color="amber" delay={300} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full min-w-0 overflow-hidden">
                <ChartCard ref={chartRef1} title={t('chart_gender_distribution')} exportFilename="gender-distribution">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={genderChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                {genderChartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard ref={chartRef2} title={t('chart_key_metrics')} exportFilename="key-metrics">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overviewBars} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 13 }} width={130} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                                {overviewBars.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}
