let _allQueries = [];

function _escapeHtml(s) {
    return String(s || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function _renderQueries(items) {
    const tbody = document.getElementById('studentQueryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No messages found.</td></tr>';
        return;
    }

    items.forEach((q) => {
        const status = q.is_read
            ? '<span class="badge bg-secondary">Read</span>'
            : '<span class="badge bg-primary">New</span>';

        tbody.innerHTML += `
            <tr data-query-id="${q.id}">
                <td>${status}</td>
                <td class="fw-semibold">${_escapeHtml(q.name)}</td>
                <td>${_escapeHtml(q.email)}</td>
                <td>${_escapeHtml(q.message_preview)}</td>
                <td>${_escapeHtml(q.created_at)}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-primary view-query-btn" data-query-id="${q.id}">View</button>
                </td>
            </tr>
        `;
    });
}

function _applySearch() {
    const q = (document.getElementById('querySearch')?.value || '').trim().toLowerCase();
    if (!q) {
        _renderQueries(_allQueries);
        return;
    }

    const filtered = _allQueries.filter((it) => {
        const n = (it.name || '').toLowerCase();
        const e = (it.email || '').toLowerCase();
        return n.includes(q) || e.includes(q);
    });
    _renderQueries(filtered);
}

async function _loadQueries() {
    try {
        const res = await fetch('/admin/api/student_queries');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load messages');

        _allQueries = Array.isArray(data.queries) ? data.queries : [];
        _applySearch();
    } catch (err) {
        console.error(err);
        _allQueries = [];
        _renderQueries([]);
    }
}

async function _openQuery(queryId) {
    try {
        const res = await fetch(`/admin/api/student_queries/${encodeURIComponent(queryId)}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load message');

        const q = data.query;
        const nameEl = document.getElementById('modalQueryName');
        const emailEl = document.getElementById('modalQueryEmail');
        const dateEl = document.getElementById('modalQueryDate');
        const msgEl = document.getElementById('modalQueryMessage');
        if (nameEl) nameEl.textContent = q.name || '--';
        if (emailEl) emailEl.textContent = q.email || '--';
        if (dateEl) dateEl.textContent = q.created_at || '--';
        if (msgEl) msgEl.textContent = q.message || '--';

        const idx = _allQueries.findIndex((it) => String(it.id) === String(queryId));
        if (idx >= 0) {
            _allQueries[idx].is_read = true;
        }
        _applySearch();

        const modalEl = document.getElementById('queryModal');
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
            const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to load message');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('querySearch')?.addEventListener('input', _applySearch);

    document.getElementById('studentQueryTableBody')?.addEventListener('click', (ev) => {
        const btn = ev.target?.closest?.('.view-query-btn');
        if (!btn) return;
        const id = btn.getAttribute('data-query-id');
        if (!id) return;
        _openQuery(id);
    });

    _loadQueries();
});
