import { useTranslation } from 'react-i18next';
import { useFilters } from '../context/FilterContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function FilterBar() {
    const { t } = useTranslation();
    const { years, faculties, selectedYear, selectedFaculty, setSelectedYear, setSelectedFaculty } = useFilters();

    return (
        <div className="flex items-center gap-4 px-6 lg:px-8 xl:px-10 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10" style={{ width: '100%' }}>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{t('filters')}</span>
            <select
                value={selectedYear || ''}
                onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:border-teal-400/50 focus:outline-none transition cursor-pointer"
            >
                <option value="">{t('all_years')}</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
                value={selectedFaculty || ''}
                onChange={e => setSelectedFaculty(e.target.value || undefined)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:border-teal-400/50 focus:outline-none transition cursor-pointer"
            >
                <option value="">{t('all_faculties')}</option>
                {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div className="flex-1" />
            <LanguageSwitcher />
        </div>
    );
}
