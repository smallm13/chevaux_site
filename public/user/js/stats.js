const csrfToken = document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content");
document.addEventListener('DOMContentLoaded', () => {
    const buttons = Array.from(document.querySelectorAll('.stats-toggle'));
    const chartCanvas = document.getElementById('stats-chart');
    const summary = document.getElementById('stats-summary');
    const favoritesCount = document.getElementById('favorites-count');
    const logoutBtn = document.getElementById('logout-btn-user');
    const colorInput = document.getElementById('stats-color-input');
    let chartInstance = null;
    let horses = [];
    let currentColor = colorInput ? colorInput.value : '#8B4513';

    function normalizeId(id) {
        return String(id ?? '');
    }

    function getFavorites() {
        try {
            const raw = JSON.parse(localStorage.getItem('horse_favorites')) || [];
            if (!Array.isArray(raw)) return [];
            return [...new Set(raw.map((item) => normalizeId(item && typeof item === 'object' ? item.id : item)))];
        } catch (e) {
            return [];
        }
    }

    if (favoritesCount) {
        favoritesCount.textContent = getFavorites().length;
    }

    function normalizeSex(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getSexLabel(value) {
        const v = normalizeSex(value);
        if (!v) return 'Non renseigne';
        if (v.includes('fem')) return 'Femelle';
        if (v.includes('male') || v.includes('mâ') || v.includes('mal') || v.includes('hongre')) return 'Male';
        return value;
    }

    function getCoatLabel(value) {
        const v = String(value || '').trim();
        return v !== '' ? v : 'Non renseigne';
    }

    function parseHeight(value) {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(String(value).replace(',', '.'));
        return Number.isFinite(num) ? num : null;
    }

    function heightBucket(height) {
        if (height === null) return 'Non renseigne';
        if (height < 1.55) return '< 1.55 m';
        if (height < 1.65) return '1.55 - 1.64 m';
        if (height < 1.75) return '1.65 - 1.74 m';
        return '>= 1.75 m';
    }

    function parseAge(horse) {
        const direct = Number(horse.age ?? horse.age_years ?? null);
        if (Number.isFinite(direct)) return direct;
        const birthYear = Number(horse.birth_year ?? horse.annee_naissance ?? null);
        if (Number.isFinite(birthYear)) {
            return new Date().getFullYear() - birthYear;
        }
        return null;
    }

    function ageBucket(age) {
        if (age === null) return 'Non renseigne';
        if (age <= 4) return '0 - 4 ans';
        if (age <= 9) return '5 - 9 ans';
        if (age <= 14) return '10 - 14 ans';
        if (age <= 19) return '15 - 19 ans';
        return '20+ ans';
    }

    function buildCounts(getKey) {
        const counts = new Map();
        horses.forEach((horse) => {
            const key = getKey(horse) || 'Non renseigne';
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        const labels = Array.from(counts.keys());
        const data = labels.map((label) => counts.get(label));
        return { labels, data };
    }

    function updateSummary(title, total) {
        if (!summary) return;
        summary.innerHTML = `
            <div class="stats-summary-card">
                <div class="stats-summary-title">${title}</div>
                <div class="stats-summary-value">${total}</div>
                <div class="stats-summary-sub">chevaux au total</div>
            </div>
        `;
    }

    function hexToRgb(hex) {
        const cleaned = String(hex || '').replace('#', '').trim();
        if (cleaned.length !== 6) return { r: 139, g: 69, b: 19 };
        return {
            r: parseInt(cleaned.slice(0, 2), 16),
            g: parseInt(cleaned.slice(2, 4), 16),
            b: parseInt(cleaned.slice(4, 6), 16),
        };
    }

    function buildPalette(count) {
        const base = hexToRgb(currentColor);
        const palette = [];
        for (let i = 0; i < count; i += 1) {
            const mix = 0.15 + (i / Math.max(count - 1, 1)) * 0.6;
            const r = Math.round(base.r + (255 - base.r) * mix);
            const g = Math.round(base.g + (255 - base.g) * mix);
            const b = Math.round(base.b + (255 - base.b) * mix);
            palette.push(`rgb(${r}, ${g}, ${b})`);
        }
        return palette;
    }

    function renderChart(kind) {
        if (!chartCanvas) return;
        if (!horses.length) {
            updateSummary('Aucune donnee', 0);
            return;
        }

        let dataset;
        let chartType = 'doughnut';
        let title = '';

        if (kind === 'sex') {
            dataset = buildCounts((horse) => getSexLabel(horse.sex ?? horse.sexe));
            chartType = 'doughnut';
            title = 'Repartition par sexe';
        } else if (kind === 'coat') {
            dataset = buildCounts((horse) => getCoatLabel(horse.coat ?? horse.robe));
            chartType = 'bar';
            title = 'Repartition par robe';
        } else if (kind === 'height') {
            dataset = buildCounts((horse) => heightBucket(parseHeight(horse.height ?? horse.taille)));
            chartType = 'bar';
            title = 'Repartition par taille';
        } else {
            dataset = buildCounts((horse) => ageBucket(parseAge(horse)));
            chartType = 'bar';
            title = 'Repartition par age';
        }

        const colors = buildPalette(dataset.labels.length);

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(chartCanvas, {
            type: chartType,
            data: {
                labels: dataset.labels,
                datasets: [{
                    label: title,
                    data: dataset.data,
                    backgroundColor: dataset.labels.map((_, i) => colors[i % colors.length]),
                    borderColor: '#ffffff',
                    borderWidth: chartType === 'doughnut' ? 2 : 0,
                    borderRadius: chartType === 'bar' ? 8 : 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: chartType === 'doughnut' ? 'bottom' : 'top',
                        labels: {
                            color: '#5a4a3a',
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        color: '#2c1810',
                        font: { size: 16, weight: '600' }
                    }
                },
                scales: chartType === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#5a4a3a' },
                        grid: { color: 'rgba(90,74,58,0.1)' }
                    },
                    x: {
                        ticks: { color: '#5a4a3a' },
                        grid: { display: false }
                    }
                } : {}
            }
        });

        updateSummary(title, horses.length);
    }

    function setActiveButton(kind) {
        buttons.forEach((btn) => {
            const isActive = btn.dataset.chart === kind;
            btn.classList.toggle('active', isActive);
        });
    }

    async function loadHorses() {
        const response = await fetch('/horses', { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
            throw new Error('Chargement des chevaux impossible');
        }
        horses = await response.json();
    }

    async function init() {
        try {
            await loadHorses();
            setActiveButton('sex');
            renderChart('sex');
        } catch (error) {
            if (summary) {
                summary.innerHTML = '<div class="stats-error">Impossible de charger les statistiques.</div>';
            }
            console.error(error);
        }
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const kind = btn.dataset.chart;
            setActiveButton(kind);
            renderChart(kind);
        });
    });

    if (colorInput) {
        colorInput.addEventListener('input', () => {
            currentColor = colorInput.value || '#8B4513';
            const active = document.querySelector('.stats-toggle.active');
            const kind = active?.dataset.chart || 'sex';
            renderChart(kind);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': token
                },
                body: JSON.stringify({ _token: token })
            });
            if (response.ok) {
                window.location.href = '/';
            }
        });
    }

    init();
});

