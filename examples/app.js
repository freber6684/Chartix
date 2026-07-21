/* global document, window, history, location, navigator */

const themes = [
  'light',
  'dark',
  'minimal',
  'vibrant',
  'corporate',
  'ocean',
  'forest',
  'sunset',
  'rose',
];
const themeBackgrounds = {
  light: '#ffffff',
  dark: '#111827',
  minimal: '#ffffff',
  vibrant: '#fffaff',
  corporate: '#f8fafc',
  ocean: '#f4fbff',
  forest: '#f7fbf5',
  sunset: '#fff9f4',
  rose: '#fff7fa',
};

const charts = [
  {
    id: 'bar',
    name: 'Vertical bar',
    type: 'bar',
    family: 'cartesian',
    tag: 'Comparison',
    theme: 'minimal',
    summary: 'Compare values across clear, discrete categories.',
    bestFor: 'Rankings, monthly totals, survey results, and side-by-side category comparisons.',
    options: {},
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Revenue', values: [120, 190, 164, 245, 278, 338] }],
  },
  {
    id: 'horizontal-bar',
    name: 'Horizontal bar',
    type: 'bar',
    family: 'cartesian',
    tag: 'Ranking',
    theme: 'corporate',
    summary: 'Make long category names and ranked values easy to scan.',
    bestFor: 'Leaderboards, feature comparisons, survey choices, and long category labels.',
    options: { horizontal: true },
    labels: ['Product design', 'Engineering', 'Marketing', 'Operations'],
    datasets: [{ label: 'Score', values: [88, 74, 63, 46] }],
  },
  {
    id: 'grouped-bar',
    name: 'Grouped bar',
    type: 'bar',
    family: 'cartesian',
    tag: 'Comparison',
    theme: 'light',
    summary: 'Compare several series across the same categories.',
    bestFor: 'Year-over-year performance, regional comparisons, and cohort reporting.',
    options: {},
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: '2025', values: [42, 58, 67, 82] },
      { label: '2026', values: [55, 66, 79, 94] },
    ],
  },
  {
    id: 'line',
    name: 'Line',
    type: 'line',
    family: 'cartesian',
    tag: 'Trend',
    theme: 'dark',
    summary: 'Reveal change, momentum, and patterns over time.',
    bestFor: 'Time series, product analytics, forecasts, and continuous measurements.',
    options: {},
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Active', values: [180, 248, 221, 310, 365, 342, 430] },
      { label: 'New', values: [96, 122, 108, 158, 174, 168, 210] },
    ],
  },
  {
    id: 'stacked-bar',
    name: '100% stacked bar',
    type: 'bar',
    family: 'cartesian',
    tag: 'Composition',
    theme: 'corporate',
    summary: 'Compare each category as a normalized part-to-whole stack.',
    bestFor: 'Market mix, survey responses, portfolio allocation, and category composition.',
    options: {
      stacked: true,
      stackMode: 'percent',
      scales: {
        y: { type: 'percentage', format: 'percent', title: 'Share' },
        x: { tickSkip: 'auto', title: 'Quarter' },
      },
    },
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Product', values: [44, 51, 48, 56] },
      { label: 'Services', values: [35, 31, 34, 29] },
      { label: 'Support', values: [21, 18, 18, 15] },
    ],
  },
  {
    id: 'combo',
    name: 'Dual-axis combo',
    type: 'combo',
    family: 'cartesian',
    tag: 'Composition',
    theme: 'ocean',
    summary: 'Place bar and line datasets on independent axes in one coordinated view.',
    bestFor: 'Revenue versus margin, price and volume, weather, and operational dashboards.',
    options: {
      scales: {
        y: { title: 'Orders', format: 'compact' },
        y1: { title: 'Conversion', type: 'percentage', format: 'percent' },
      },
    },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Orders', type: 'bar', values: [420, 510, 490, 620, 680, 760] },
      { label: 'Conversion', type: 'line', yAxisId: 'y1', values: [42, 48, 46, 55, 61, 68] },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    type: 'line',
    family: 'cartesian',
    tag: 'Trend',
    theme: 'vibrant',
    summary: 'Emphasize the magnitude behind a changing series.',
    bestFor: 'Traffic, capacity, cumulative totals, and volume over time.',
    options: { fill: true },
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Sessions', values: [34, 52, 47, 69, 81, 96] }],
  },
  {
    id: 'pie',
    name: 'Pie',
    type: 'pie',
    family: 'radial',
    tag: 'Composition',
    theme: 'sunset',
    summary: 'Show how a small number of parts make up a whole.',
    bestFor: 'Simple market share, budget allocation, and category composition with few slices.',
    options: { dataLabels: { show: true, position: 'outside' } },
    labels: ['Product', 'Services', 'Support', 'Other'],
    datasets: [{ label: 'Revenue mix', values: [48, 27, 17, 8] }],
  },
  {
    id: 'doughnut',
    name: 'Doughnut',
    type: 'doughnut',
    family: 'radial',
    tag: 'Composition',
    theme: 'ocean',
    summary: 'Present proportions with a lighter, dashboard-friendly shape.',
    bestFor: 'KPIs, traffic sources, progress composition, and compact dashboards.',
    options: { innerRadius: 0.62, dataLabels: { show: true, position: 'inside' } },
    labels: ['Organic', 'Search', 'Social', 'Email'],
    datasets: [{ label: 'Traffic', values: [42, 31, 18, 9] }],
  },
  {
    id: 'scatter',
    name: 'Scatter',
    type: 'scatter',
    family: 'cartesian',
    tag: 'Correlation',
    theme: 'forest',
    summary: 'Explore correlation, clusters, and unusual observations.',
    bestFor: 'Relationships between two numeric variables, experiments, and outlier detection.',
    options: {},
    labels: ['12', '18', '27', '35', '43', '56'],
    datasets: [
      { label: 'Campaign A', values: [24, 38, 32, 57, 63, 82] },
      { label: 'Campaign B', values: [18, 29, 46, 48, 71, 76] },
    ],
  },
  {
    id: 'bubble',
    name: 'Bubble',
    type: 'bubble',
    family: 'cartesian',
    tag: 'Relationship',
    theme: 'vibrant',
    summary: 'Encode a third numeric measure through point size.',
    bestFor: 'Portfolio maps, market analysis, experiment results, and multivariable comparisons.',
    options: { scales: { x: { title: 'Reach', min: 0 }, y: { title: 'Impact', reverse: false } } },
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        label: 'Campaigns',
        values: [24, 58, null, 74],
        points: [
          { x: 12, y: 24, r: 7 },
          { x: 28, y: 58, r: 13 },
          { x: 44, y: null, r: 9 },
          { x: 61, y: 74, r: 18 },
        ],
      },
    ],
  },
  {
    id: 'time-log',
    name: 'Time + log scale',
    type: 'scatter',
    family: 'cartesian',
    tag: 'Advanced axes',
    theme: 'dark',
    summary: 'Use real dates horizontally and logarithmic magnitudes vertically.',
    bestFor: 'Growth across orders of magnitude, scientific readings, and long-range metrics.',
    options: {
      scales: {
        x: { type: 'time', format: 'date', tickCount: 4 },
        y: { type: 'logarithmic', title: 'Magnitude', minorTicks: true, grid: { dash: 5 } },
      },
    },
    labels: ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'],
    datasets: [{ label: 'Scale', values: [1, 10, 100, 1000] }],
  },
];

const state = { selected: charts[0], playground: null, tab: 'playground' };
const controls = {
  theme: document.querySelector('#control-theme'),
  primary: document.querySelector('#control-primary'),
  accent: document.querySelector('#control-accent'),
  background: document.querySelector('#control-background'),
  font: document.querySelector('#control-font'),
  titleSize: document.querySelector('#control-title-size'),
  labelSize: document.querySelector('#control-label-size'),
  labels: document.querySelector('#control-labels'),
  position: document.querySelector('#control-position'),
  angle: document.querySelector('#control-angle'),
  tooltips: document.querySelector('#control-tooltips'),
  crosshair: document.querySelector('#control-crosshair'),
  interactionMode: document.querySelector('#control-interaction-mode'),
  legendPosition: document.querySelector('#control-legend-position'),
  zoom: document.querySelector('#control-zoom'),
  selection: document.querySelector('#control-selection'),
};

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
function baseConfig(chart, compact = false) {
  return {
    type: chart.type,
    theme: chart.theme,
    data: { labels: [...chart.labels], datasets: deepClone(chart.datasets) },
    options: {
      ...deepClone(chart.options),
      animation: false,
      responsive: true,
      showDataTable: !compact,
      showLegend: !compact || chart.datasets.length > 1,
      showGrid: chart.family !== 'radial',
      padding: compact ? 12 : 24,
      title: compact ? undefined : `${chart.name} example`,
      typography: { fontFamily: "'Space Mono', monospace" },
    },
  };
}

function renderGallery() {
  const grid = document.querySelector('#chart-grid');
  grid.innerHTML = charts
    .map(
      (chart, index) => `
    <article class="chart-card" data-family="${chart.family}">
      <div class="card-preview" id="preview-${chart.id}"></div>
      <div class="card-body">
        <div class="card-meta"><span>${String(index + 1).padStart(2, '0')} · ${chart.tag}</span><span>Open ↗</span></div>
        <h3>${chart.name}</h3><p>${chart.summary}</p>
      </div>
      <button class="card-open" type="button" data-open-chart="${chart.id}" aria-label="Open ${chart.name} playground"></button>
    </article>`,
    )
    .join('');

  charts.forEach((chart) => {
    const host = document.querySelector(`#preview-${chart.id}`);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:184px';
    host.append(canvas);
    new window.Chartix(canvas, baseConfig(chart, true));
  });
}

function renderDetailNavigation() {
  document.querySelector('#detail-chart-list').innerHTML = charts
    .map(
      (chart) =>
        `<button type="button" data-open-chart="${chart.id}" class="${chart.id === state.selected.id ? 'is-active' : ''}">${chart.name}</button>`,
    )
    .join('');
}

function resetControls() {
  const chart = state.selected;
  controls.theme.value = chart.theme;
  controls.primary.value = chart.family === 'radial' ? '#625bf6' : '#625bf6';
  controls.accent.value = '#0f9f8f';
  controls.background.value = themeBackgrounds[chart.theme];
  controls.font.value = "'Space Mono', monospace";
  controls.titleSize.value = '17';
  controls.labelSize.value = '11';
  controls.angle.value = '0';
  controls.labels.checked = Boolean(chart.options.dataLabels?.show);
  controls.position.value = chart.options.dataLabels?.position ?? 'outside';
  controls.tooltips.checked = true;
  controls.crosshair.checked = chart.family === 'cartesian';
  controls.interactionMode.value = chart.datasets.length > 1 ? 'index' : 'nearest';
  controls.legendPosition.value = 'top';
  controls.zoom.checked = false;
  controls.selection.value = 'off';
  updateOutputs();
  renderPlayground();
}

function currentConfig() {
  const config = baseConfig(state.selected);
  config.theme = controls.theme.value;
  config.options.backgroundColor = controls.background.value;
  config.options.colors = [
    controls.primary.value,
    controls.accent.value,
    '#e78a2f',
    '#d94f70',
    '#3b82d0',
  ];
  config.options.typography = {
    fontFamily: controls.font.value,
    titleSize: Number(controls.titleSize.value),
    labelSize: Number(controls.labelSize.value),
    tickSize: Number(controls.labelSize.value),
  };
  config.options.xLabels = {
    rotation: Number(controls.angle.value),
    fontSize: Number(controls.labelSize.value),
  };
  config.options.dataLabels = {
    show: controls.labels.checked,
    position: controls.position.value,
    fontSize: Number(controls.labelSize.value),
    fontFamily: controls.font.value,
  };
  config.options.tooltip = { enabled: controls.tooltips.checked };
  config.options.crosshair = { enabled: controls.crosshair.checked, color: '#94a3b888' };
  config.options.interaction = { mode: controls.interactionMode.value, keyboard: true };
  config.options.legend = { interactive: true, position: controls.legendPosition.value };
  config.options.zoom = {
    enabled: controls.zoom.checked,
    wheel: true,
    pan: true,
    box: true,
    resetButton: true,
  };
  config.options.selection = {
    enabled: controls.selection.value !== 'off',
    mode: controls.selection.value === 'lasso' ? 'lasso' : 'brush',
    color: controls.accent.value,
  };
  if (state.selected.id === 'bar') {
    config.options.drilldown = {
      '0:0': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{ label: 'January revenue', values: [22, 34, 29, 35] }],
      },
    };
  }
  if (state.selected.type === 'line') {
    config.options.annotations = [
      { type: 'line', value: 300, label: 'Target', color: controls.accent.value, width: 1.5 },
    ];
  }
  return config;
}

function renderPlayground() {
  updateOutputs();
  state.playground?.destroy();
  const host = document.querySelector('#playground-canvas');
  host.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:470px';
  host.append(canvas);
  const config = currentConfig();
  state.playground = new window.Chartix(canvas, config);
  updateGeneratedCode(config);
}

function updateGeneratedCode(config) {
  const clean = deepClone(config);
  delete clean.options.height;
  const json = JSON.stringify(clean, null, 2).replace(/'/g, '&#39;');
  document.querySelector('#generated-code').textContent =
    `<script src="https://freber6684.github.io/Chartix/dist/chartix.min.js"></script>\n\n<div data-chartix data-config='${json}'></div>`;
}

function renderDocumentation() {
  const chart = state.selected;
  document.querySelector('#chart-documentation').innerHTML = `
    <h3>When to use it</h3><p>${chart.bestFor}</p>
    <h3>Data model</h3><p>Set <code>type: '${chart.type}'</code>. Labels define categories${chart.type === 'scatter' ? ' or numeric x values' : ''}; each dataset supplies aligned numeric values.</p>
    <h3>Useful options</h3><ul>
      <li><code>theme</code> selects any of nine built-in visual systems.</li>
      <li><code>colors</code> replaces the categorical palette.</li>
      <li><code>dataLabels</code> controls visibility, placement, fonts, angles, and color.</li>
      <li><code>responsive</code> follows the container; <code>resizable</code> adds a drag handle.</li>
      <li><code>tooltip</code>, <code>crosshair</code>, and <code>interaction</code> configure pointer, touch, and keyboard exploration.</li>
      <li><code>annotations</code> adds reference lines or highlighted numeric ranges.</li>
      <li><code>scales</code> supports time, logarithmic, percentage, reversed, bounded, dual, formatted, and discontinuous axes.</li>
      <li><code>stacked</code>, per-dataset <code>type</code>, object points, null gaps, and <code>transforms</code> cover advanced composition.</li>
      <li>Click or keyboard-activate a legend item to show or hide a dataset.</li>
      ${chart.type === 'doughnut' ? '<li><code>innerRadius</code> controls the center opening.</li>' : ''}
      ${chart.type === 'bar' ? '<li><code>horizontal</code> switches between vertical and horizontal layouts.</li>' : ''}
      ${chart.type === 'line' ? '<li><code>fill</code> turns a line chart into an area chart.</li>' : ''}
    </ul>
    <h3>Accessibility</h3><p>Chartix adds an informative canvas label and a visually hidden data table by default. Keep the table enabled unless equivalent content is already nearby.</p>`;
}

function openChart(id, updateHash = true) {
  const chart = charts.find((candidate) => candidate.id === id);
  if (!chart) return;
  state.selected = chart;
  document.body.classList.add('detail-active');
  document.querySelector('#overview-view').hidden = true;
  document.querySelector('#detail-view').hidden = false;
  document.querySelector('#detail-title').textContent = `${chart.name} chart`;
  document.querySelector('#detail-crumb').textContent = chart.name;
  document.querySelector('#detail-category').textContent = `${chart.tag} · ${chart.family}`;
  document.querySelector('#detail-summary').textContent = chart.summary;
  renderDetailNavigation();
  renderDocumentation();
  resetControls();
  switchTab('playground');
  if (updateHash) history.pushState(null, '', `#chart/${chart.id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeDetail() {
  state.playground?.destroy();
  state.playground = null;
  document.body.classList.remove('detail-active');
  document.querySelector('#overview-view').hidden = false;
  document.querySelector('#detail-view').hidden = true;
  history.pushState(null, '', '#gallery');
  document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.detail-tab').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
}

function updateOutputs() {
  document.querySelector('#title-size-value').textContent = `${controls.titleSize.value}px`;
  document.querySelector('#label-size-value').textContent = `${controls.labelSize.value}px`;
  document.querySelector('#angle-value').textContent = `${controls.angle.value}°`;
}

themes.forEach((theme) =>
  controls.theme.insertAdjacentHTML(
    'beforeend',
    `<option value="${theme}">${theme[0].toUpperCase()}${theme.slice(1)}</option>`,
  ),
);
document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-open-chart]');
  if (openButton) openChart(openButton.dataset.openChart);
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    document
      .querySelectorAll('.filter')
      .forEach((button) => button.classList.toggle('is-active', button === filter));
    document.querySelectorAll('.chart-card').forEach((card) => {
      card.hidden =
        filter.dataset.filter !== 'all' && card.dataset.family !== filter.dataset.filter;
    });
  }
  const tab = event.target.closest('[data-tab]');
  if (tab) switchTab(tab.dataset.tab);
});

document.querySelector('#back-to-gallery').addEventListener('click', closeDetail);
document.querySelector('#reset-controls').addEventListener('click', resetControls);
document.querySelector('#drill-up').addEventListener('click', () => state.playground?.drillUp());
Object.values(controls).forEach((control) =>
  control.addEventListener('input', () => {
    if (control === controls.theme)
      controls.background.value = themeBackgrounds[controls.theme.value];
    renderPlayground();
  }),
);
document.querySelector('#copy-code').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.querySelector('#generated-code').textContent);
    status.textContent = 'Copied to clipboard.';
  } catch {
    status.textContent = 'Select the code and copy it manually.';
  }
});
document.querySelectorAll('[data-export]').forEach((button) =>
  button.addEventListener('click', () => {
    state.playground?.download(button.dataset.export, `chartix-${state.selected.id}`);
    document.querySelector('#copy-status').textContent = `${button.textContent} export created.`;
  }),
);
window.addEventListener('hashchange', () => {
  const match = location.hash.match(/^#chart\/(.+)$/);
  if (match) openChart(match[1], false);
});
const initialMatch = location.hash.match(/^#chart\/(.+)$/);

async function initialize() {
  await document.fonts?.ready;
  renderGallery();
  if (initialMatch) openChart(initialMatch[1], false);
}

initialize();
