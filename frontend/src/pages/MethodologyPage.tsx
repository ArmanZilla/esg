export function MethodologyPage() {
    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Methodology</h2>
                <p className="text-sm text-slate-400 mt-1.5">How this dashboard collects and presents data</p>
            </div>

            <div className="glass-card p-8 space-y-8" style={{ width: '100%' }}>
                <section>
                    <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-base">📊</span>
                        Data Collection
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Data is collected from university departments using a standardized Excel template. The template includes
                        five sheets: <strong className="text-slate-200">Meta</strong>,{' '}
                        <strong className="text-slate-200">Gender</strong>,{' '}
                        <strong className="text-slate-200">Engagement</strong>,{' '}
                        <strong className="text-slate-200">Volunteering</strong>, and{' '}
                        <strong className="text-slate-200">ESG Courses</strong>. Each sheet has required and optional
                        fields to ensure data consistency while allowing flexibility.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-base">✅</span>
                        Validation
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Every uploaded file undergoes automated validation before it can be published:
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-400 mt-3 space-y-1.5 ml-1">
                        <li>Year fields must be valid integers</li>
                        <li>Percentage fields must be between 0 and 100</li>
                        <li>Count and hour fields must be non-negative</li>
                        <li>Required fields cannot be empty</li>
                        <li>Unknown columns generate warnings but do not block upload</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-base">📐</span>
                        Calculations
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Summary KPIs are computed as averages (for percentages) or totals (for counts and hours) across all
                        records matching the selected filters. Gender distributions show the average male/female percentages.
                        Engagement metrics show average satisfaction and NPS. Volunteering combines student and staff volunteers
                        into totals.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base">🔄</span>
                        Versioning & Real-time Updates
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Each upload creates a versioned dataset. Admins can preview, publish, or rollback to any valid version.
                        When a new dataset is published, connected dashboard clients receive an instant notification via
                        Server-Sent Events (SSE) and automatically refresh their data.
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-rose-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-base">🏛️</span>
                        ESG Framework
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        This dashboard focuses on the <strong className="text-slate-200">Social</strong> pillar of
                        ESG, covering four key dimensions: Gender Balance & Diversity, Student/Staff Engagement, Volunteering &
                        Social Projects, and ESG Courses & Awareness. These dimensions align with UN Sustainable Development
                        Goals (SDGs) including SDG 4 (Quality Education), SDG 5 (Gender Equality), and SDG 10 (Reduced
                        Inequalities).
                    </p>
                </section>
            </div>
        </div>
    );
}
