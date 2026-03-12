import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';

const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function EsgCoursesPage() {
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

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="flex items-center gap-3 text-teal-400"><div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /><span className="text-lg font-medium">Loading...</span></div></div>;
    if (!data?.data?.length) return <div className="flex flex-col items-center justify-center h-[60vh] w-full"><div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">📚</div><h3 className="text-xl font-semibold text-slate-300">No ESG courses data available</h3></div>;

    const byFaculty = Object.values(data.data.reduce((acc: any, r: any) => {
        if (!acc[r.faculty]) acc[r.faculty] = { faculty: r.faculty, courses: 0, green: 0 };
        acc[r.faculty].courses += r.courses_count;
        acc[r.faculty].green += r.green_program_students || 0;
        return acc;
    }, {})).map((f: any) => ({
        faculty: f.faculty.length > 15 ? f.faculty.substring(0, 15) + '…' : f.faculty,
        Courses: f.courses,
        'Green Students': f.green,
    }));

    const byYear = Object.values(data.data.reduce((acc: any, r: any) => {
        if (!acc[r.year]) acc[r.year] = { year: r.year, courses: 0, pctSum: 0, pctCount: 0 };
        acc[r.year].courses += r.courses_count;
        if (r.esg_students_pct != null) { acc[r.year].pctSum += r.esg_students_pct; acc[r.year].pctCount += 1; }
        return acc;
    }, {})).map((y: any) => ({
        year: y.year,
        'Total Courses': y.courses,
        'Avg ESG %': y.pctCount > 0 ? Math.round(y.pctSum / y.pctCount * 10) / 10 : 0,
    })).sort((a: any, b: any) => a.year - b.year);

    const columns = [
        { key: 'year', label: 'Year' }, { key: 'faculty', label: 'Faculty' },
        { key: 'courses_count', label: 'Courses' }, { key: 'esg_students_pct', label: 'ESG Students %' },
        { key: 'green_program_students', label: 'Green Program' },
    ];

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">ESG Courses & Awareness</h2>
                <p className="text-sm text-slate-400 mt-1.5">Environmental, Social & Governance curriculum coverage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ width: '100%' }}>
                <KpiCard title="Total Courses" value={data.summary.total_courses} icon="📚" color="teal" />
                <KpiCard title="Avg ESG Coverage" value={data.summary.avg_esg_students_pct != null ? `${data.summary.avg_esg_students_pct}%` : 'N/A'} icon="🎯" color="indigo" delay={100} />
                <KpiCard title="Green Program Students" value={data.summary.total_green_program_students} icon="🌿" color="green" delay={200} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" style={{ width: '100%' }}>
                <ChartCard title="Courses by Faculty">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byFaculty}>
                            <XAxis dataKey="faculty" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Bar dataKey="Courses" fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={28} />
                            <Bar dataKey="Green Students" fill="#34d399" radius={[6, 6, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Courses Growth Trend">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={byYear}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Line type="monotone" dataKey="Total Courses" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 6, fill: '#2dd4bf', stroke: '#020617', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="Avg ESG %" stroke="#818cf8" strokeWidth={3} dot={{ r: 6, fill: '#818cf8', stroke: '#020617', strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <DataTable columns={columns} data={data.data} filename="esg_courses_metrics" />
        </div>
    );
}
