const BASE = '';

async function fetchJSON(url: string, options?: RequestInit) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
    }
    return res.json();
}

function authHeaders(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
}

/* ── Public ─────────────────────────────────── */
export const api = {
    getActiveVersion: () => fetchJSON(`${BASE}/api/active-version`),
    getFilters: () => fetchJSON(`${BASE}/api/filters`),
    getSummary: (year?: number, faculty?: string) => {
        const p = new URLSearchParams();
        if (year) p.set('year', String(year));
        if (faculty) p.set('faculty', faculty);
        return fetchJSON(`${BASE}/api/summary?${p}`);
    },
    getGender: (year?: number, faculty?: string) => {
        const p = new URLSearchParams();
        if (year) p.set('year', String(year));
        if (faculty) p.set('faculty', faculty);
        return fetchJSON(`${BASE}/api/gender?${p}`);
    },
    getEngagement: (year?: number, faculty?: string) => {
        const p = new URLSearchParams();
        if (year) p.set('year', String(year));
        if (faculty) p.set('faculty', faculty);
        return fetchJSON(`${BASE}/api/engagement?${p}`);
    },
    getVolunteering: (year?: number, faculty?: string) => {
        const p = new URLSearchParams();
        if (year) p.set('year', String(year));
        if (faculty) p.set('faculty', faculty);
        return fetchJSON(`${BASE}/api/volunteering?${p}`);
    },
    getEsgCourses: (year?: number, faculty?: string) => {
        const p = new URLSearchParams();
        if (year) p.set('year', String(year));
        if (faculty) p.set('faculty', faculty);
        return fetchJSON(`${BASE}/api/esg-courses?${p}`);
    },

    /* ── Admin ──────────────────────────────────── */
    login: (username: string, password: string) =>
        fetchJSON(`${BASE}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        }),
    getUploads: (token: string) =>
        fetchJSON(`${BASE}/api/admin/uploads`, { headers: authHeaders(token) }),
    uploadFile: (token: string, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return fetchJSON(`${BASE}/api/admin/upload`, {
            method: 'POST',
            headers: authHeaders(token),
            body: fd,
        });
    },
    publish: (token: string, id: number) =>
        fetchJSON(`${BASE}/api/admin/publish/${id}`, {
            method: 'POST',
            headers: authHeaders(token),
        }),
    rollback: (token: string, id: number) =>
        fetchJSON(`${BASE}/api/admin/rollback/${id}`, {
            method: 'POST',
            headers: authHeaders(token),
        }),
    downloadTemplate: (token: string) =>
        fetch(`${BASE}/api/admin/template`, { headers: authHeaders(token) })
            .then(r => r.blob()),
};
