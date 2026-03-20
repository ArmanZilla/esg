import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';

const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function EsgCoursesPage() {
    const { t } = useTranslation();
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getEsgCourses(selectedYear, selectedFaculty)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="flex items-center gap-3 text-teal-400"><div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /><span className="text-lg font-medium">{t('loading')}</span></div></div>;
    if (!data?.data?.length) return <div className="flex flex-col items-center justify-center h-[60vh] w-full"><div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">📚</div><h3 className="text-xl font-semibold text-slate-300">{t('no_esg_data')}</h3></div>;

    const coursesLabel = t('courses_label');
    const greenLabel = t('green_students');
    const totalCoursesLabel = t('total_courses');
    const avgEsgLabel = t('avg_esg_pct');

    const byFaculty = Object.values(data.data.reduce((acc: any, r: any) => {
        if (!acc[r.faculty]) acc[r.faculty] = { faculty: r.faculty, courses: 0, green: 0 };
        acc[r.faculty].courses += r.courses_count;
        acc[r.faculty].green += r.green_program_students || 0;
        return acc;
    }, {})).map((f: any) => ({
        faculty: f.faculty.length > 15 ? f.faculty.substring(0, 15) + '…' : f.faculty,
        [coursesLabel]: f.courses,
        [greenLabel]: f.green,
    }));

    const byYear = Object.values(data.data.reduce((acc: any, r: any) => {
        if (!acc[r.year]) acc[r.year] = { year: r.year, courses: 0, pctSum: 0, pctCount: 0 };
        acc[r.year].courses += r.courses_count;
        if (r.esg_students_pct != null) { acc[r.year].pctSum += r.esg_students_pct; acc[r.year].pctCount += 1; }
        return acc;
    }, {})).map((y: any) => ({
        year: y.year,
        [totalCoursesLabel]: y.courses,
        [avgEsgLabel]: y.pctCount > 0 ? Math.round(y.pctSum / y.pctCount * 10) / 10 : 0,
    })).sort((a: any, b: any) => a.year - b.year);

    const columns = [
        { key: 'year', label: t('col_year') }, { key: 'faculty', label: t('col_faculty') },
        { key: 'courses_count', label: t('col_courses') }, { key: 'esg_students_pct', label: t('col_esg_students_pct') },
        { key: 'green_program_students', label: t('col_green_program') },
    ];

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">{t('esg_courses_page_title')}</h2>
                <p className="text-sm text-slate-400 mt-1.5">{t('esg_courses_page_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ width: '100%' }}>
                <KpiCard title={t('kpi_total_courses')} value={data.summary.total_courses} icon="📚" color="teal" />
                <KpiCard title={t('kpi_avg_esg_coverage')} value={data.summary.avg_esg_students_pct != null ? `${data.summary.avg_esg_students_pct}%` : 'N/A'} icon="🎯" color="indigo" delay={100} />
                <KpiCard title={t('kpi_green_program')} value={data.summary.total_green_program_students} icon="🌿" color="green" delay={200} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ width: '100%' }}>
                <ChartCard title={t('chart_esg_courses')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byFaculty}>
                            <XAxis dataKey="faculty" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Bar dataKey={coursesLabel} fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={28} />
                            <Bar dataKey={greenLabel} fill="#34d399" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title={t('chart_courses_trend')}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={byYear}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Line type="monotone" dataKey={totalCoursesLabel} stroke="#2dd4bf" strokeWidth={3} dot={{ r: 6, fill: '#2dd4bf', stroke: '#020617', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey={avgEsgLabel} stroke="#818cf8" strokeWidth={3} dot={{ r: 6, fill: '#818cf8', stroke: '#020617', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <DataTable columns={columns} data={data.data} filename="esg_courses_metrics" />
        </div>
    );
}
