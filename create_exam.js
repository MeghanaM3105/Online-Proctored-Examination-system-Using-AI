let _questions = [];

let _allExams = [];

function _setCount() {
    const badge = document.getElementById('questionsCountBadge');
    if (badge) badge.innerText = `Questions Added: ${_questions.length}`;
}

function _clearQuestionInputs() {
    const ids = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD'];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const correct = document.getElementById('correctAnswer');
    if (correct) correct.selectedIndex = 0;
}

function _correctToIndex(val) {
    if (val === 'A') return 0;
    if (val === 'B') return 1;
    if (val === 'C') return 2;
    if (val === 'D') return 3;
    return null;
}

function _addManualQuestion() {
    const qText = (document.getElementById('questionText')?.value || '').trim();
    const a = (document.getElementById('optionA')?.value || '').trim();
    const b = (document.getElementById('optionB')?.value || '').trim();
    const c = (document.getElementById('optionC')?.value || '').trim();
    const d = (document.getElementById('optionD')?.value || '').trim();
    const correctVal = document.getElementById('correctAnswer')?.value;
    const correctIdx = _correctToIndex(correctVal);

    if (!qText || !a || !b || !c || !d || correctIdx === null) {
        alert('Please fill question text, all options, and select the correct option.');
        return;
    }

    _questions.push({
        question_text: qText,
        option_a: a,
        option_b: b,
        option_c: c,
        option_d: d,
        correct_option: correctIdx,
        marks: 1,
    });

    _setCount();
    _clearQuestionInputs();
}

async function _loadCsvToServer() {
    const file = document.getElementById('csvFile')?.files?.[0];
    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    const form = new FormData();
    form.append('csv_file', file);

    try {
        const res = await fetch('/admin/api/exams/parse_csv', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to parse CSV');

        const qs = data.questions || [];
        qs.forEach((q) => _questions.push(q));
        _setCount();
        alert(`Loaded ${qs.length} questions from CSV.`);
    } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to load CSV');
    }
}

function _renderExams(exams) {
    const tbody = document.getElementById('adminExamsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!exams || exams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No exams found.</td></tr>';
        return;
    }

    exams.forEach((e) => {
        const dur = (e.duration_minutes === null || e.duration_minutes === undefined) ? '--' : `${e.duration_minutes} min`;
        const marks = (e.total_marks === null || e.total_marks === undefined) ? '--' : String(e.total_marks);
        const qCount = (e.question_count === null || e.question_count === undefined) ? '--' : String(e.question_count);
        const statusBadge = e.is_active
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Disabled</span>';

        tbody.innerHTML += `
            <tr data-exam-id="${e.id}">
                <td class="fw-semibold">${e.name || '--'}</td>
                <td>${dur}</td>
                <td>${marks}</td>
                <td>${qCount}</td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-danger admin-delete-exam-btn" data-exam-id="${e.id}" data-exam-name="${(e.name || '').replaceAll('"', '&quot;')}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

async function _loadAllExams() {
    try {
        const res = await fetch('/admin/api/exams');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load exams');
        _allExams = Array.isArray(data.exams) ? data.exams : [];
        _renderExams(_allExams);
    } catch (err) {
        console.error(err);
        _renderExams([]);
    }
}

async function _deleteExam(examId, examName) {
    const ok = confirm(`Delete exam "${examName || examId}"? This will remove the exam and its questions.`);
    if (!ok) return;

    try {
        const res = await fetch(`/admin/api/exams/${encodeURIComponent(examId)}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete exam');

        _allExams = _allExams.filter((e) => String(e.id) !== String(examId));
        _renderExams(_allExams);
        alert('Exam deleted successfully.');
    } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to delete exam');
    }
}

async function _saveExam() {
    const name = (document.getElementById('examName')?.value || '').trim();
    const duration = (document.getElementById('examDuration')?.value || '').trim();
    const totalMarks = (document.getElementById('totalMarks')?.value || '').trim();
    const description = (document.getElementById('examDescription')?.value || '').trim();

    const attemptMode = (document.getElementById('attemptMode')?.value || 'single').trim();
    const allowReattempt = attemptMode === 'reattempt';
    const reattemptDaysRaw = (document.getElementById('reattemptDays')?.value || '').trim();
    const reattemptAfterDays = reattemptDaysRaw ? Number(reattemptDaysRaw) : null;
    const availableFrom = (document.getElementById('availableFrom')?.value || '').trim();

    if (!name) {
        alert('Exam name is required.');
        return;
    }
    if (_questions.length === 0) {
        alert('Please add at least one question (manual or CSV).');
        return;
    }

    const payload = {
        name,
        duration_minutes: duration ? Number(duration) : null,
        total_marks: totalMarks ? Number(totalMarks) : null,
        description,
        allow_reattempt: allowReattempt,
        reattempt_after_days: allowReattempt ? reattemptAfterDays : null,
        available_from: availableFrom || null,
        questions: _questions,
    };

    try {
        const res = await fetch('/admin/api/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create exam');

        alert('Exam created successfully.');
        window.location.href = '/admin_dashboard';
    } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to create exam');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addQuestionBtn')?.addEventListener('click', _addManualQuestion);
    document.getElementById('parseCsvBtn')?.addEventListener('click', _loadCsvToServer);
    document.getElementById('saveExamBtn')?.addEventListener('click', _saveExam);
    document.getElementById('cancelExamBtn')?.addEventListener('click', () => { window.location.href = '/admin_dashboard'; });

    document.getElementById('adminExamsTableBody')?.addEventListener('click', (ev) => {
        const btn = ev.target?.closest?.('.admin-delete-exam-btn');
        if (!btn) return;
        const examId = btn.getAttribute('data-exam-id');
        const examName = btn.getAttribute('data-exam-name') || '';
        if (!examId) return;
        _deleteExam(examId, examName);
    });

    const attemptMode = document.getElementById('attemptMode');
    const days = document.getElementById('reattemptDays');
    if (attemptMode && days) {
        const sync = () => {
            const allow = attemptMode.value === 'reattempt';
            days.disabled = !allow;
            if (!allow) {
                days.selectedIndex = 0;
            }
        };
        attemptMode.addEventListener('change', sync);
        sync();
    }

    _setCount();
    _loadAllExams();
});
