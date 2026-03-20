import { useTranslation } from 'react-i18next';

export function MethodologyPage() {
    const { t } = useTranslation();

    return (
        <div style={{ width: '100%', maxWidth: 'none' }} className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">{t('methodology_title')}</h2>
                <p className="text-sm text-slate-400 mt-1.5">{t('methodology_subtitle')}</p>
            </div>

            <div className="glass-card p-8 space-y-8" style={{ width: '100%' }}>
                <section>
                    <h3 className="text-lg font-semibold text-teal-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-teal-500/15 flex items-center justify-center text-base">📊</span>
                        {t('methodology_data_collection')}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {t('methodology_data_collection_text')}
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-base">✅</span>
                        {t('methodology_validation')}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {t('methodology_validation_text')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-400 mt-3 space-y-1.5 ml-1">
                        <li>{t('methodology_validation_1')}</li>
                        <li>{t('methodology_validation_2')}</li>
                        <li>{t('methodology_validation_3')}</li>
                        <li>{t('methodology_validation_4')}</li>
                        <li>{t('methodology_validation_5')}</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-base">📐</span>
                        {t('methodology_calculations')}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {t('methodology_calculations_text')}
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-base">🔄</span>
                        {t('methodology_versioning')}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {t('methodology_versioning_text')}
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-semibold text-rose-300 mb-3 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-base">🏛️</span>
                        {t('methodology_esg_framework')}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        {t('methodology_esg_framework_text')}
                    </p>
                </section>
            </div>
        </div>
    );
}
