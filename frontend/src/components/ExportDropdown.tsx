import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useExport } from '../context/ExportContext';

export function ExportDropdown() {
  const { t } = useTranslation();
  const { getHandlers, hasHandlers, exporting, setExporting } = useExport();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!hasHandlers) return null;

  const handleExport = async (type: 'csv' | 'png' | 'pdf') => {
    const handlers = getHandlers();
    const fn = handlers[type];
    if (!fn || exporting) return;
    try {
      setExporting(type);
      await fn();
    } catch (err) {
      console.error(`Export ${type} failed:`, err);
    } finally {
      setExporting(null);
      setOpen(false);
    }
  };

  const handlers = getHandlers();
  const items: { type: 'csv' | 'png' | 'pdf'; icon: string; label: string; primary?: boolean }[] = [];
  if (handlers.csv) items.push({ type: 'csv', icon: '📄', label: t('export_csv') });
  if (handlers.png) items.push({ type: 'png', icon: '🖼️', label: t('export_png') });
  if (handlers.pdf) items.push({ type: 'pdf', icon: '📑', label: t('export_pdf'), primary: true });

  return (
    <div ref={ref} className="relative export-exclude">
      <button
        onClick={() => setOpen(!open)}
        disabled={!!exporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all duration-200 cursor-pointer disabled:opacity-50 hover:shadow-lg hover:shadow-teal-500/25 border border-teal-400"
      >
        {exporting ? (
          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>📥</span>
        )}
        <span>{exporting ? t('exporting') : t('export')}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-up" style={{ animationDuration: '0.15s' }}>
          {items.map((item) => (
            <button
              key={item.type}
              onClick={() => handleExport(item.type)}
              disabled={!!exporting}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 cursor-pointer disabled:opacity-40 ${
                item.primary
                  ? 'text-teal-300 font-semibold hover:bg-teal-500/10 border-t border-slate-800'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {exporting === item.type && (
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
