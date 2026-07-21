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

const catalogExamples = [
  ['column', 'Column', 'Comparison'],
  ['horizontal-bar', 'Horizontal bar module', 'Ranking'],
  ['grouped-bar', 'Grouped bar module', 'Comparison'],
  ['stacked-bar', 'Stacked bar', 'Composition'],
  ['area', 'Area module', 'Trend'],
  ['spline', 'Spline', 'Trend'],
  ['step', 'Step line', 'Trend'],
  ['stacked-area', 'Stacked area', 'Composition'],
  ['lollipop', 'Lollipop', 'Ranking'],
  ['dot-plot', 'Dot plot', 'Comparison'],
  ['slope', 'Slope', 'Change'],
  ['dumbbell', 'Dumbbell', 'Change'],
  ['waterfall', 'Waterfall', 'Finance'],
  ['funnel', 'Funnel', 'Process'],
  ['pyramid', 'Pyramid', 'Hierarchy'],
  ['gauge', 'Gauge', 'Progress'],
  ['progress', 'Progress bar', 'Progress'],
  ['polar-area', 'Polar area', 'Radial'],
  ['radar', 'Radar', 'Multivariate'],
  ['heatmap', 'Heatmap', 'Matrix'],
  ['histogram', 'Histogram', 'Distribution'],
  ['stock', 'Stock line', 'Financial'],
  ['volume', 'Volume', 'Financial'],
  ['range', 'Range', 'Uncertainty'],
  ['error-bar', 'Error bar', 'Uncertainty'],
  ['timeline', 'Timeline', 'Time'],
  ['gantt', 'Gantt', 'Scheduling'],
].map(([type, name, tag], index) => ({
  id: `catalog-${type}`,
  name,
  type,
  family: ['gauge', 'polar-area', 'radar'].includes(type) ? 'radial' : 'cartesian',
  tag,
  theme: themes[index % themes.length],
  summary: `A production-ready ${name.toLowerCase()} renderer with themes, accessibility, and interactions.`,
  bestFor: `${tag} stories that need a focused, reusable ${name.toLowerCase()} view.`,
  options: {
    ...(type === 'stacked-bar' ? { stacked: true } : {}),
    ...(type === 'gantt' ? { horizontal: true } : {}),
    ...(type === 'range' ? { fill: true } : {}),
    dataLabels: { show: ['gauge', 'progress', 'funnel', 'pyramid'].includes(type) },
  },
  labels: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'],
  datasets:
    type === 'gauge' || type === 'progress'
      ? [{ label: 'Completion', values: [72, 0, 0, 0, 0] }]
      : [
          {
            label: 'Current',
            values: [22, 38, 31, 54, 46],
            ...(type === 'range'
              ? { lowerValues: [18, 31, 26, 47, 40], upperValues: [27, 45, 38, 62, 52] }
              : {}),
            ...(type === 'error-bar' ? { errorValues: [3, 5, 4, 6, 4] } : {}),
            ...(type === 'gantt'
              ? { startValues: [0, 2, 5, 7, 10], endValues: [4, 6, 9, 12, 14] }
              : {}),
          },
          { label: 'Previous', values: [17, 29, 36, 41, 39] },
        ],
}));

charts.push(...catalogExamples);

const advancedExamples = [
  ['box-plot', 'Box plot', 'Statistical'],
  ['violin', 'Violin plot', 'Statistical'],
  ['density', 'Density', 'Statistical'],
  ['candlestick', 'Candlestick', 'Financial'],
  ['ohlc', 'OHLC', 'Financial'],
  ['correlation-matrix', 'Correlation matrix', 'Matrix'],
  ['treemap', 'Treemap', 'Hierarchy'],
  ['circle-packing', 'Circle packing', 'Hierarchy'],
  ['dendrogram', 'Dendrogram', 'Hierarchy'],
  ['network', 'Network graph', 'Relationships'],
  ['parallel-coordinates', 'Parallel coordinates', 'Relationships'],
].map(([type, name, tag], index) => ({
  id: `advanced-${type}`,
  name,
  type,
  family: ['treemap', 'circle-packing', 'dendrogram', 'network'].includes(type)
    ? 'radial'
    : 'cartesian',
  tag,
  theme: themes[(index + 3) % themes.length],
  summary: `${name} with a dedicated renderer and accessible Chartix configuration.`,
  bestFor: `${tag} analysis where structure, spread, or relationships matter.`,
  options: {},
  labels: ['A', 'B', 'C', 'D', 'E'],
  datasets: [
    {
      label: 'Series A',
      values: [12, 19, 8, 24, 17],
      ...(type === 'candlestick' || type === 'ohlc'
        ? {
            openValues: [10, 16, 10, 20, 15],
            highValues: [14, 22, 13, 27, 20],
            lowValues: [8, 14, 7, 18, 13],
            closeValues: [12, 19, 8, 24, 17],
          }
        : {}),
    },
    { label: 'Series B', values: [9, 14, 16, 18, 21] },
  ],
}));

charts.push(...advancedExamples);

const specializedExamples = [
  ['streamgraph', 'Streamgraph', 'Trend'],
  ['realtime', 'Real-time stream', 'Streaming'],
  ['calendar', 'Calendar', 'Time'],
  ['solid-gauge', 'Solid gauge', 'Progress'],
  ['bullet', 'Bullet', 'Progress'],
  ['radial-bar', 'Radial bar', 'Radial'],
  ['sunburst', 'Sunburst', 'Hierarchy'],
  ['icicle', 'Icicle', 'Hierarchy'],
  ['tree', 'Tree diagram', 'Hierarchy'],
  ['org-chart', 'Organization chart', 'Hierarchy'],
  ['mind-map', 'Mind map', 'Relationships'],
  ['flowchart', 'Flowchart', 'Flow'],
  ['dependency-graph', 'Dependency graph', 'Relationships'],
  ['ridgeline', 'Ridgeline', 'Statistical'],
  ['sankey', 'Sankey', 'Flow'],
  ['chord', 'Chord', 'Flow'],
  ['calendar-heatmap', 'Calendar heatmap', 'Matrix'],
  ['contour', 'Contour', 'Scientific'],
  ['marimekko', 'Marimekko', 'Composition'],
  ['pictogram', 'Pictogram', 'Specialized'],
  ['waffle', 'Waffle', 'Composition'],
  ['word-cloud', 'Word cloud', 'Text'],
  ['bump', 'Bump', 'Ranking'],
  ['pareto', 'Pareto', 'Quality'],
  ['renko', 'Renko', 'Financial'],
  ['geo-scatter', 'Geographic scatter', 'Map'],
  ['bubble-map', 'Bubble map', 'Map'],
  ['route-map', 'Route map', 'Map'],
  ['world-map', 'World map', 'Map'],
  ['choropleth', 'Choropleth', 'Map'],
  ['surface-3d', 'Surface 3D', 'Scientific'],
].map(([type, name, tag], index) => ({
  id: `special-${type}`,
  name,
  type,
  family: ['solid-gauge', 'radial-bar', 'sunburst', 'chord'].includes(type)
    ? 'radial'
    : 'cartesian',
  tag,
  theme: themes[(index + 5) % themes.length],
  summary: `${name} rendered with composable Chartix geometry and the shared interaction model.`,
  bestFor: `${tag} communication in dashboards, reports, and interactive data stories.`,
  options: {},
  labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  datasets: [
    {
      label: 'Series A',
      values: [32, 18, 54, 41, 66, 28, 75],
      ...(['geo-scatter', 'bubble-map', 'route-map', 'world-map'].includes(type)
        ? {
            points: [
              { x: -122.4, y: 37.8, r: 7 },
              { x: -74, y: 40.7, r: 10 },
              { x: -0.1, y: 51.5, r: 8 },
              { x: 139.7, y: 35.7, r: 12 },
            ],
          }
        : {}),
    },
    { label: 'Series B', values: [22, 42, 31, 57, 48, 61, 35] },
  ],
}));

charts.push(...specializedExamples);

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
  labelColor: document.querySelector('#control-label-color'),
  labelBackground: document.querySelector('#control-label-background'),
  lineStyle: document.querySelector('#control-line-style'),
  borderWidth: document.querySelector('#control-border-width'),
  yScale: document.querySelector('#control-y-scale'),
  reverseAxis: document.querySelector('#control-reverse-axis'),
  stacked: document.querySelector('#control-stacked'),
  fill: document.querySelector('#control-fill'),
  tooltips: document.querySelector('#control-tooltips'),
  pinTooltip: document.querySelector('#control-pin-tooltip'),
  crosshair: document.querySelector('#control-crosshair'),
  interactionMode: document.querySelector('#control-interaction-mode'),
  legendPosition: document.querySelector('#control-legend-position'),
  zoom: document.querySelector('#control-zoom'),
  htmlLegend: document.querySelector('#control-html-legend'),
  selection: document.querySelector('#control-selection'),
  adaptive: document.querySelector('#control-adaptive'),
  highContrast: document.querySelector('#control-high-contrast'),
  dyslexia: document.querySelector('#control-dyslexia'),
  dataTable: document.querySelector('#control-data-table'),
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
  controls.labelColor.value = '#172033';
  controls.labelBackground.value = '#ffffff';
  controls.lineStyle.value = chart.datasets[0]?.lineStyle ?? 'straight';
  controls.borderWidth.value = String(chart.datasets[0]?.borderWidth ?? 2);
  controls.yScale.value = chart.options.scales?.y?.type ?? 'linear';
  controls.reverseAxis.checked = Boolean(chart.options.scales?.y?.reverse);
  controls.stacked.checked = Boolean(chart.options.stacked);
  controls.fill.checked = Boolean(chart.options.fill);
  controls.labels.checked = Boolean(chart.options.dataLabels?.show);
  controls.position.value = chart.options.dataLabels?.position ?? 'outside';
  controls.tooltips.checked = true;
  controls.pinTooltip.checked = false;
  controls.crosshair.checked = chart.family === 'cartesian';
  controls.interactionMode.value = chart.datasets.length > 1 ? 'index' : 'nearest';
  controls.legendPosition.value = 'top';
  controls.zoom.checked = false;
  controls.htmlLegend.checked = false;
  controls.selection.value = 'off';
  controls.adaptive.checked = true;
  controls.highContrast.checked = false;
  controls.dyslexia.checked = false;
  controls.dataTable.checked = true;
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
    color: controls.labelColor.value,
    backgroundColor: controls.labelBackground.value,
  };
  config.options.tooltip = {
    enabled: controls.tooltips.checked,
    pinOnClick: controls.pinTooltip.checked,
  };
  config.options.crosshair = { enabled: controls.crosshair.checked, color: '#94a3b888' };
  config.options.interaction = { mode: controls.interactionMode.value, keyboard: true };
  config.options.legend = {
    interactive: true,
    position: controls.legendPosition.value,
    html: controls.htmlLegend.checked,
  };
  config.options.zoom = {
    enabled: controls.zoom.checked,
    wheel: true,
    pinch: true,
    pan: true,
    box: true,
    resetButton: true,
  };
  config.options.stacked = controls.stacked.checked;
  config.options.fill = controls.fill.checked;
  config.options.responsiveMode = controls.adaptive.checked ? 'adaptive' : 'fixed';
  config.options.showDataTable = controls.dataTable.checked;
  config.options.accessibility = {
    autoSummary: true,
    keyboardHelp: true,
    explorationMode: true,
    highContrast: controls.highContrast.checked,
    dyslexiaFriendly: controls.dyslexia.checked,
  };
  config.options.scales = {
    ...config.options.scales,
    y: {
      ...config.options.scales?.y,
      type: controls.yScale.value,
      reverse: controls.reverseAxis.checked,
    },
  };
  config.data.datasets = config.data.datasets.map((dataset) => ({
    ...dataset,
    lineStyle: controls.lineStyle.value,
    borderWidth: Number(controls.borderWidth.value),
  }));
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
  document.querySelector('#border-width-value').textContent = `${controls.borderWidth.value}px`;
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
