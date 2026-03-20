import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'kz', label: 'KZ' },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    return (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 text-sm">
            <span className="text-slate-400 mr-1">🌐</span>
            {LANGUAGES.map((lang, i) => (
                <span key={lang.code} className="flex items-center">
                    {i > 0 && <span className="text-slate-600 mx-1">|</span>}
                    <button
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`px-1.5 py-0.5 rounded-lg transition duration-200 cursor-pointer ${
                            i18n.language === lang.code
                                ? 'text-teal-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        {lang.label}
                    </button>
                </span>
            ))}
        </div>
    );
}
