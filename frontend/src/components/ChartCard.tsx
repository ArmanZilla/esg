import { forwardRef, useRef } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToPNG } from '../utils/exportUtils';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  exportFilename?: string;
}

export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(
  function ChartCard({ title, children, exportFilename }, ref) {
    const { t } = useTranslation();
    const innerRef = useRef<HTMLDivElement>(null);
    const cardRef = (ref as React.RefObject<HTMLDivElement>) || innerRef;

    const handlePNG = async () => {
      if (!cardRef.current) return;
      const name = exportFilename || title.toLowerCase().replace(/\s+/g, '-');
      await exportToPNG(cardRef.current, `${name}-${new Date().getFullYear()}.png`);
    };

    return (
      <div
        ref={cardRef}
        className="glass-card p-6 group min-w-0 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</h3>
          <button
            onClick={handlePNG}
            title={t('export_png')}
            className="export-exclude opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          >
            📷 <span>PNG</span>
          </button>
        </div>
        {/* Fixed height container — never zero. No state, no effects, no loops. */}
        <div className="w-full min-w-0" style={{ height: 360 }}>
          {children}
        </div>
      </div>
    );
  },
);
