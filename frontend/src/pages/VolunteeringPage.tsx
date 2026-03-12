import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFilters } from '../context/FilterContext';
import { api } from '../api';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';

const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#f1f5f9' };

export function VolunteeringPage() {
    const { selectedYear, selectedFaculty, refreshVersion } = useFilters();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getVolunteering(selectedYear, selectedFaculty)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [selectedYear, selectedFaculty, refreshVersion]);

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="flex items-center gap-3 text-teal-400"><div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /><span className="text-lg font-medium">Loading...</span></div></div>;
    if (!data?.data?.length) return <div className="flex flex-col items-center justify-center h-[60vh] w-full"><div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6">🌱</div><h3 className="text-xl font-semibold text-slate-300">No volunteering data available</h3></div>;

    const byFaculty = Object.values(data.data.reduce((acc: any, r: any) => {
        if (!acc[r.faculty]) acc[r.faculty] = { faculty: r.faculty, students: 0, staff: 0 };
        acc[r.faculty].students += r.volunteers_students;
        acc[r.faculty].staff += r.volunteers_staff;
        return acc;
    }, {})).map((f: any) => ({
        faculty: f.faculty.length > 15 ? f.faculty.substring(0, 15) + '…' : f.faculty,
        Students: f.students,
        Staff: f.staff,
    }));

    const columns = [
        { key: 'year', label: 'Year' }, { key: 'faculty', label: 'Faculty' },
        { key: 'volunteers_students', label: 'Student Volunteers' }, { key: 'volunteers_staff', label: 'Staff Volunteers' },
        { key: 'total_hours', label: 'Total Hours' }, { key: 'projects_count', label: 'Projects' },
        { key: 'top_direction', label: 'Top Direction' },
    ];

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Volunteering & Social Projects</h2>
                <p className="text-sm text-slate-400 mt-1.5">Community engagement and volunteer activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ width: '100%' }}>
                <KpiCard title="Total Volunteers" value={data.summary.total_volunteers.toLocaleString()} icon="🤲" color="teal" />
                <KpiCard title="Total Hours" value={data.summary.total_hours.toLocaleString()} icon="⏱️" color="indigo" delay={100} />
                <KpiCard title="Projects" value={data.summary.total_projects} icon="📁" color="green" delay={200} />
            </div>

            <div style={{ width: '100%' }}>
                <ChartCard title="Volunteers by Faculty (Students vs Staff)">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byFaculty}>
                            <XAxis dataKey="faculty" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            <Bar dataKey="Students" fill="#2dd4bf" radius={[6, 6, 0, 0]} barSize={32} />
                            <Bar dataKey="Staff" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <DataTable columns={columns} data={data.data} filename="volunteering_metrics" />
        </div>
    );
}
