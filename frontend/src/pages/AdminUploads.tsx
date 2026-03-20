import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';

interface UploadItem {
    id: number;
    filename: string;
    created_at: string;
    created_by: string;
    status: string;
    errors_count: number;
    warnings_count: number;
    is_active: boolean;
}

export function AdminUploads() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const token = localStorage.getItem('admin_token');
    const fileRef = useRef<HTMLInputElement>(null);

    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!token) { navigate('/admin'); return; }
        loadUploads();
    }, []);

    const loadUploads = async () => {
        try {
            const res = await api.getUploads(token!);
            setUploads(res.uploads);
        } catch {
            localStorage.removeItem('admin_token');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadResult(null);
        setMsg('');
        try {
            const res = await api.uploadFile(token!, file);
            setUploadResult(res);
            if (res.errors_count === 0) {
                setMsg(t('upload_success'));
            }
            loadUploads();
        } catch (err: any) {
            setMsg(err.message || t('upload_failed'));
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handlePublish = async (id: number) => {
        try {
            await api.publish(token!, id);
            setMsg(t('dataset_published', { id }));
            loadUploads();
        } catch (err: any) {
            setMsg(err.message || t('publish_failed'));
        }
    };

    const handleRollback = async (id: number) => {
        try {
            await api.rollback(token!, id);
            setMsg(t('rolled_back_to', { id }));
            loadUploads();
        } catch (err: any) {
            setMsg(err.message || t('rollback_failed'));
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await api.downloadTemplate(token!);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'social_dashboard_template.xlsx'; a.click();
            URL.revokeObjectURL(url);
        } catch {
            setMsg(t('template_failed'));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin');
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="text-teal-400 text-lg">{t('loading')}</div></div>;

    return (
        <div className="min-h-screen p-4 lg:p-8" style={{ background: 'var(--color-bg)' }}>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">📂 {t('admin_panel')}</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">{t('admin_manage')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/dashboard')} className="btn-secondary text-xs">{t('back_to_dashboard')}</button>
                        <button onClick={handleLogout} className="btn-secondary text-xs text-rose-400 border-rose-400/50 hover:bg-rose-500/10">{t('logout')}</button>
                    </div>
                </div>

                {msg && (
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 text-sm text-teal-400">{msg}</div>
                )}

                <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('upload_new_dataset')}</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input ref={fileRef} type="file" accept=".xlsx,.xls"
                            className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-teal-500/20 file:text-teal-400 file:px-3 file:py-1 file:text-sm file:font-medium" />
                        <button onClick={handleUpload} disabled={uploading} className="btn-primary whitespace-nowrap">
                            {uploading ? `⏳ ${t('uploading')}` : `📤 ${t('upload_validate')}`}
                        </button>
                        <button onClick={handleDownloadTemplate} className="btn-secondary whitespace-nowrap text-sm">
                            📥 {t('template')}
                        </button>
                    </div>
                </div>

                {uploadResult && (
                    <div className="glass-card p-6 space-y-3">
                        <h3 className="text-lg font-semibold">{t('validation_result')}</h3>
                        <div className="flex gap-3">
                            <span className={`badge ${uploadResult.errors_count ? 'badge-danger' : 'badge-success'}`}>
                                {uploadResult.errors_count} {t('errors').toLowerCase()}
                            </span>
                            <span className="badge badge-warning">
                                {uploadResult.warnings_count} warnings
                            </span>
                            <span className={`badge ${uploadResult.status === 'draft' ? 'badge-info' : 'badge-danger'}`}>
                                {uploadResult.status}
                            </span>
                        </div>
                        {uploadResult.errors?.length > 0 && (
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {uploadResult.errors.map((e: any, i: number) => (
                                    <div key={i} className="text-xs text-red-400 bg-red-500/5 rounded px-3 py-1.5">
                                        <strong>[{e.sheet}]</strong> Row {e.row} → <strong>{e.field}</strong>: {e.message}
                                    </div>
                                ))}
                            </div>
                        )}
                        {uploadResult.warnings?.length > 0 && (
                            <details className="cursor-pointer">
                                <summary className="text-xs text-amber-400">{t('show_warnings', { count: uploadResult.warnings.length })}</summary>
                                <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                                    {uploadResult.warnings.map((w: any, i: number) => (
                                        <div key={i} className="text-xs text-amber-400 bg-amber-500/5 rounded px-3 py-1.5">
                                            <strong>[{w.sheet}]</strong> Row {w.row} → <strong>{w.field}</strong>: {w.message}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )}
                    </div>
                )}

                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)]">
                        <h2 className="text-lg font-semibold">{t('upload_history')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)]">
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('id')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('file')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('date')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('status')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('errors')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploads.map(u => (
                                    <tr key={u.id} className={`border-b border-[var(--color-border)]/50 transition ${u.is_active ? 'bg-teal-500/5' : 'hover:bg-white/3'}`}>
                                        <td className="px-4 py-3 font-mono text-xs">#{u.id}</td>
                                        <td className="px-4 py-3">{u.filename}</td>
                                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${u.status === 'published' ? 'badge-success' : u.status === 'failed' ? 'badge-danger' : 'badge-info'}`}>{u.status}</span>
                                            {u.is_active && <span className="badge badge-success ml-1">{t('active')}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.errors_count > 0 && <span className="text-red-400">{u.errors_count}</span>}
                                            {u.warnings_count > 0 && <span className="text-amber-400 ml-2">⚠{u.warnings_count}</span>}
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            {u.status !== 'failed' && !u.is_active && (
                                                <button onClick={() => handlePublish(u.id)} className="btn-primary text-xs py-1 px-3">{t('publish')}</button>
                                            )}
                                            {u.status !== 'failed' && !u.is_active && (
                                                <button onClick={() => handleRollback(u.id)} className="btn-secondary text-xs py-1 px-3">{t('rollback')}</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {uploads.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-[var(--color-text-muted)]">{t('no_uploads')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
