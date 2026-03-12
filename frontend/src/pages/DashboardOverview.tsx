import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#22c55e'];

const TOOLTIP_STYLE = { background: '#114190ff', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' };

export function DashboardOverview() {
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getSummary(selectedYear, selectedFaculty)
            .then(setSummary)
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-teal-400">
                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-lg font-medium">Loading dashboard...</span>
            </div>
        </div>
    );

    if (!summary || (!summary.gender?.records && !summary.engagement?.records))
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">📊</div>
                <h3 className="text-xl font-semibold text-slate-300">No data available</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md">Upload and publish an Excel file from the Admin panel to see your metrics here.</p>
            </div>
        );

    const genderChartData = [
        { name: 'Female', value: summary.gender.avg_female_pct },
        { name: 'Male', value: summary.gender.avg_male_pct },
    ];

    const overviewBars = [
        { name: 'Satisfaction', value: summary.engagement.avg_satisfaction_pct, fill: COLORS[0] },
        { name: 'Women Leadership', value: summary.gender.avg_women_leadership_pct || 0, fill: COLORS[1] },
        { name: 'ESG Coverage', value: summary.esg_courses.avg_esg_students_pct || 0, fill: COLORS[2] },
    ];

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold text-white">Dashboard Overview</h2>
                <p className="text-sm text-slate-400 mt-1">Key social impact metrics at a glance</p>
            </div>

            {/* KPI Cards — 12-col grid: 4 cards each taking 3 cols on xl */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
                <KpiCard
                    title="Avg. Female Representation"
                    value={`${summary.gender.avg_female_pct}%`}
                    subtitle={`${summary.gender.records} records`}
                    icon="⚖️" color="teal" delay={0}
                />
                <KpiCard
                    title="Avg. Satisfaction"
                    value={`${summary.engagement.avg_satisfaction_pct}%`}
                    subtitle={summary.engagement.avg_nps != null ? `NPS: ${summary.engagement.avg_nps}` : undefined}
                    icon="😊" color="indigo" delay={100}
                />
                <KpiCard
                    title="Total Volunteers"
                    value={summary.volunteering.total_volunteers.toLocaleString()}
                    subtitle={`${summary.volunteering.total_hours.toLocaleString()} hours`}
                    icon="🤲" color="green" delay={200}
                />
                <KpiCard
                    title="ESG Courses"
                    value={summary.esg_courses.total_courses}
                    subtitle={summary.esg_courses.avg_esg_students_pct != null ? `${summary.esg_courses.avg_esg_students_pct}% coverage` : undefined}
                    icon="📚" color="amber" delay={300}
                />
            </div>

            {/* Charts — 2-col on large screens, full width */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                <ChartCard title="Gender Distribution (Average)">
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

                <ChartCard title="Key Metrics Comparison">
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
