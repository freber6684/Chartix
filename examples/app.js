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
    options: { scales: { x: { title: 'Month' }, y: { title: 'Revenue' } } },
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
    options: {
      horizontal: true,
      scales: { x: { title: 'Score' }, y: { title: 'Department' } },
    },
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

const catalogPresets = {
  spline: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'This year', values: [32, 41, 38, 52, 61, 58] },
      { label: 'Last year', values: [26, 34, 40, 43, 49, 47] },
    ],
  },
  step: {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [{ label: 'Open tickets', values: [18, 24, 21, 29, 16, 12] }],
  },
  waterfall: {
    labels: ['Opening', 'New sales', 'Expansion', 'Churn', 'Costs', 'Closing'],
    datasets: [{ label: 'Net change', values: [120, 48, 22, -18, -31, 0] }],
  },
  funnel: {
    labels: ['Visitors', 'Sign-ups', 'Trials', 'Qualified', 'Customers'],
    datasets: [{ label: 'Conversion funnel', values: [1200, 820, 540, 310, 180] }],
  },
  pyramid: {
    labels: ['Awareness', 'Interest', 'Consideration', 'Intent', 'Purchase'],
    datasets: [{ label: 'Audience journey', values: [100, 78, 58, 39, 24] }],
  },
  gauge: {
    labels: ['Quarterly target'],
    datasets: [{ label: 'Attainment', values: [78] }],
  },
  progress: {
    labels: ['Migration progress'],
    datasets: [{ label: 'Completed', values: [72] }],
  },
  'polar-area': {
    labels: ['Product', 'Engineering', 'Sales', 'Support', 'Operations'],
    datasets: [{ label: 'Team capacity', values: [82, 94, 68, 74, 61] }],
  },
  radar: {
    labels: ['Speed', 'Quality', 'Ease', 'Support', 'Value'],
    datasets: [
      { label: 'Current release', values: [86, 91, 78, 82, 88] },
      { label: 'Previous release', values: [72, 84, 69, 76, 80] },
    ],
  },
  histogram: {
    labels: ['0–10', '11–20', '21–30', '31–40', '41–50'],
    datasets: [{ label: 'Response time distribution', values: [8, 24, 42, 31, 12] }],
  },
  stock: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ label: 'Close', values: [104.2, 106.8, 105.9, 109.4, 111.1] }],
  },
  volume: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ label: 'Shares traded', values: [1.8, 2.4, 1.9, 3.1, 2.7] }],
  },
  range: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Forecast range',
        values: [68, 72, 75, 71, 78],
        lowerValues: [62, 66, 69, 65, 71],
        upperValues: [74, 79, 82, 78, 85],
      },
    ],
  },
  'error-bar': {
    labels: ['Control', 'Variant A', 'Variant B', 'Variant C', 'Variant D'],
    datasets: [{ label: 'Conversion', values: [42, 48, 51, 46, 54], errorValues: [2, 3, 4, 3, 3] }],
  },
  gantt: {
    labels: ['Research', 'Design', 'Build', 'QA', 'Launch'],
    datasets: [
      {
        label: 'Project plan',
        values: [4, 4, 6, 3, 2],
        startValues: [0, 3, 6, 11, 14],
        endValues: [4, 7, 12, 14, 16],
      },
    ],
  },
};

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
].map(([type, name, tag], index) => {
  const preset = catalogPresets[type] ?? {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      { label: 'Current period', values: [32, 44, 39, 57, 63] },
      { label: 'Previous period', values: [28, 36, 42, 49, 54] },
    ],
  };
  return {
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
      ...(['funnel', 'pyramid'].includes(type) ? { showLegend: false } : {}),
      dataLabels: { show: ['gauge', 'progress', 'funnel', 'pyramid'].includes(type) },
    },
    labels: preset.labels,
    datasets: preset.datasets,
  };
});

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

const FONT_CATALOG = [
  'Space Mono',
  'Times New Roman',
  'Arial',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Nunito',
  'Raleway',
  'Ubuntu',
  'Merriweather',
  'Playfair Display',
  'Source Sans 3',
  'Source Serif 4',
  'Roboto Slab',
  'Roboto Condensed',
  'Oswald',
  'Noto Sans',
  'Noto Serif',
  'PT Sans',
  'PT Serif',
  'Work Sans',
  'DM Sans',
  'DM Serif Display',
  'Manrope',
  'Fira Sans',
  'Fira Code',
  'IBM Plex Sans',
  'IBM Plex Serif',
  'IBM Plex Mono',
  'Libre Franklin',
  'Libre Baskerville',
  'Archivo',
  'Barlow',
  'Barlow Condensed',
  'Cabin',
  'Karla',
  'Rubik',
  'Mulish',
  'Quicksand',
  'Josefin Sans',
  'Josefin Slab',
  'Bitter',
  'Arvo',
  'Alegreya',
  'Alegreya Sans',
  'Crimson Pro',
  'Cormorant Garamond',
  'EB Garamond',
  'Lora',
  'Spectral',
  'Vollkorn',
  'Zilla Slab',
  'Bree Serif',
  'Domine',
  'Cardo',
  'Newsreader',
  'Fraunces',
  'Literata',
  'Noto Sans Display',
  'Noto Serif Display',
  'Lexend',
  'Atkinson Hyperlegible',
  'Public Sans',
  'Red Hat Display',
  'Red Hat Text',
  'Plus Jakarta Sans',
  'Urbanist',
  'Outfit',
  'Sora',
  'Space Grotesk',
  'Geologica',
  'Onest',
  'Epilogue',
  'Syne',
  'Unbounded',
  'Chivo',
  'Assistant',
  'Heebo',
  'Hind',
  'Titillium Web',
  'Exo 2',
  'Rajdhani',
  'Orbitron',
  'Audiowide',
  'Comfortaa',
  'Varela Round',
  'M PLUS Rounded 1c',
  'Inconsolata',
  'JetBrains Mono',
  'Source Code Pro',
  'Roboto Mono',
  'Noto Sans Mono',
  'Courier Prime',
  'Azeret Mono',
  'Anonymous Pro',
  'Cutive Mono',
  'Nanum Gothic Coding',
  'Cousine',
  'Spline Sans Mono',
  'Permanent Marker',
  'Caveat',
  'Patrick Hand',
  'Kalam',
  'Pacifico',
  'Lobster',
  'Dancing Script',
  'Satisfy',
  'Great Vibes',
  'Bebas Neue',
];
const TEXT_ROLES = [
  ['title', 'Title'],
  ['subtitle', 'Subtitle'],
  ['xAxis', 'X-axis labels'],
  ['yAxis', 'Y-axis labels'],
  ['xAxisTitle', 'X-axis title'],
  ['yAxisTitle', 'Y-axis title'],
  ['dataLabel', 'Data labels'],
  ['legend', 'Legend'],
  ['tooltip', 'Tooltip'],
];
const PALETTE = [
  '#625bf6',
  '#0f9f8f',
  '#172033',
  '#ffffff',
  '#111827',
  '#f43f5e',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
];
const themeText = {
  dark: { strong: '#f8fafc', muted: '#a7b2c3', subtle: '#cbd5e1' },
  light: { strong: '#172033', muted: '#64748b', subtle: '#334155' },
};

function defaultTextStyle(role, theme) {
  const color = theme === 'dark' ? themeText.dark : themeText.light;
  const presets = {
    title: { fontSize: 20, fontWeight: 700, color: color.strong, lineHeight: 1.2 },
    subtitle: { fontSize: 12, fontWeight: 400, color: color.muted, lineHeight: 1.45 },
    xAxis: { fontSize: 11, fontWeight: 400, color: color.muted, lineHeight: 1.3 },
    yAxis: { fontSize: 11, fontWeight: 400, color: color.muted, lineHeight: 1.3 },
    xAxisTitle: { fontSize: 11, fontWeight: 600, color: color.subtle, lineHeight: 1.3 },
    yAxisTitle: { fontSize: 11, fontWeight: 600, color: color.subtle, lineHeight: 1.3 },
    dataLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: color.strong,
      lineHeight: 1.25,
      padding: { top: 3, right: 5, bottom: 3, left: 5 },
    },
    legend: { fontSize: 11, fontWeight: 500, color: color.muted, lineHeight: 1.3 },
    tooltip: {
      fontSize: 12,
      fontWeight: 600,
      color: '#f8fafc',
      backgroundColor: '#0f172a',
      lineHeight: 1.45,
      padding: { top: 10, right: 12, bottom: 10, left: 12 },
    },
  };
  const preset = presets[role] ?? presets.legend;
  return {
    fontFamily: 'Space Mono',
    fontStyle: 'normal',
    backgroundColor: '#ffffff00',
    underline: false,
    href: '',
    effect: 'none',
    effectColor: '#625bf6',
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    letterSpacing: 0,
    ...preset,
  };
}

function colorTargets(chart) {
  const caps = chartCapabilities(chart);
  if (caps.radial && chart.datasets.length === 1)
    return chart.labels.map((label, index) => ({
      label,
      color: chart.datasets[0]?.colors?.[index],
    }));
  return chart.datasets.map((dataset) => ({ label: dataset.label, color: dataset.color }));
}

function initialSeriesColors(chart) {
  return colorTargets(chart).map(({ color }, index) => color ?? PALETTE[index % PALETTE.length]);
}

function editorAccent(editor) {
  return editor.seriesColors[1] ?? editor.seriesColors[0] ?? PALETTE[1];
}
const state = {
  selected: charts[0],
  playground: null,
  tab: 'playground',
  previewWidth: 0,
  previewHeight: 470,
  activeRole: 'title',
  controlTab: 'design',
  editor: null,
};

function chartCapabilities(chart) {
  const type = chart.type;
  const radial =
    chart.family === 'radial' ||
    [
      'pie',
      'doughnut',
      'gauge',
      'solid-gauge',
      'radar',
      'polar-area',
      'radial-bar',
      'sunburst',
      'chord',
    ].includes(type);
  const line = [
    'line',
    'area',
    'spline',
    'step',
    'stacked-area',
    'stock',
    'range',
    'error-bar',
    'realtime',
    'streamgraph',
    'bump',
    'pareto',
    'combo',
  ].includes(type);
  const bar = [
    'bar',
    'column',
    'horizontal-bar',
    'grouped-bar',
    'stacked-bar',
    'waterfall',
    'histogram',
    'volume',
    'gantt',
    'bullet',
    'marimekko',
  ].includes(type);
  const points = [
    'scatter',
    'bubble',
    'dot-plot',
    'lollipop',
    'slope',
    'dumbbell',
    'line',
    'area',
    'spline',
    'step',
    'combo',
  ].includes(type);
  return {
    radial,
    cartesian: !radial,
    line,
    bar,
    points,
    doughnut: type === 'doughnut',
    axes: !radial,
  };
}

function freshEditor(chart) {
  const caps = chartCapabilities(chart);
  const horizontal = chart.options.horizontal || chart.type === 'horizontal-bar';
  return {
    theme: chart.theme,
    seriesColors: initialSeriesColors(chart),
    background: themeBackgrounds[chart.theme],
    title: `${chart.name} example`,
    subtitle: 'Interactive Chartix visualization',
    xTitle:
      chart.options.scales?.x?.title ??
      (caps.axes ? (chart.type === 'scatter' ? 'X value' : horizontal ? 'Value' : 'Category') : ''),
    yTitle:
      chart.options.scales?.y?.title ??
      (caps.axes ? (chart.type === 'scatter' ? 'Y value' : horizontal ? 'Category' : 'Value') : ''),
    y1Title: chart.options.scales?.y1?.title ?? 'Secondary value',
    textStyles: Object.fromEntries(
      TEXT_ROLES.map(([role]) => [role, defaultTextStyle(role, chart.theme)]),
    ),
    showLabels: Boolean(chart.options.dataLabels?.show),
    labelPosition: chart.options.dataLabels?.position ?? 'outside',
    xAngle: 0,
    yAngle: 0,
    showXAxis: chart.options.scales?.x?.display !== false,
    showYAxis: chart.options.scales?.y?.display !== false,
    xAxisColor: chart.options.scales?.x?.line?.color ?? '#cbd5e1',
    yAxisColor: chart.options.scales?.y?.line?.color ?? '#cbd5e1',
    xAxisWidth: chart.options.scales?.x?.line?.width ?? 1,
    yAxisWidth: chart.options.scales?.y?.line?.width ?? 1,
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    titleOffset: 12,
    xAxisOffset: chart.options.scales?.x?.titleOffset ?? 12,
    yAxisOffset: chart.options.scales?.y?.titleOffset ?? 12,
    y1AxisOffset: chart.options.scales?.y1?.titleOffset ?? 12,
    xAxisPosition: chart.options.scales?.x?.position ?? 'bottom',
    yAxisPosition: chart.options.scales?.y?.position ?? 'left',
    y1AxisPosition: chart.options.scales?.y1?.position ?? 'right',
    plotGap: 0,
    layout: { title: {}, subtitle: {}, plot: { widthScale: 1, heightScale: 1 } },
    lineStyle: chart.datasets[0]?.lineStyle ?? 'straight',
    borderWidth: chart.datasets[0]?.borderWidth ?? 2,
    pointSize: chart.datasets[0]?.pointSizes?.[0] ?? 4,
    stacked: Boolean(chart.options.stacked),
    fill: Boolean(chart.options.fill),
    yScale: chart.options.scales?.y?.type ?? 'linear',
    reverseAxis: Boolean(chart.options.scales?.y?.reverse),
    startAngle: chart.options.startAngle ?? -90,
    innerRadius: chart.type === 'doughnut' ? (chart.options.innerRadius ?? 0.58) : 0,
    radialCornerRadius: chart.options.radialCornerRadius ?? 3,
    cornerRadius: chart.options.cornerRadius ?? 8,
    radialGap: chart.options.radialGap ?? 1,
    tooltips: true,
    pinTooltip: false,
    crosshair: chart.family === 'cartesian',
    interactionMode: chart.datasets.length > 1 ? 'index' : 'nearest',
    showLegend: chart.options.showLegend ?? true,
    legendPosition: chart.options.legend?.position ?? 'top',
    legendBackgroundEnabled: Boolean(chart.options.legend?.backgroundColor),
    legendBackground: chart.options.legend?.backgroundColor ?? '#ffffff',
    legendBorderColor: chart.options.legend?.borderColor ?? '#d7dce5',
    legendBorderWidth: chart.options.legend?.borderWidth ?? 0,
    legendCornerRadius: chart.options.legend?.cornerRadius ?? 8,
    legendPadding: chart.options.legend?.padding ?? 8,
    legendItemGap: chart.options.legend?.itemGap ?? 18,
    legendMarkerSize: chart.options.legend?.markerSize ?? 10,
    zoom: false,
    htmlLegend: false,
    selection: 'off',
    patterns: false,
    duration: 420,
    stagger: 60,
    annotation: typeSupportsAnnotations(chart) ? 'none' : 'none',
    annotationImage: '',
    adaptive: true,
    rtl: false,
    highContrast: false,
    dyslexia: false,
    dataTable: true,
  };
}

function typeSupportsAnnotations(chart) {
  return chart.family === 'cartesian';
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character],
  );
}

function selectOptions(values, selected) {
  return values
    .map(
      (value) =>
        `<option value="${escapeHTML(Array.isArray(value) ? value[0] : value)}" ${String(Array.isArray(value) ? value[0] : value) === String(selected) ? 'selected' : ''}>${escapeHTML(Array.isArray(value) ? value[1] : value)}</option>`,
    )
    .join('');
}

function fontOptions(selected) {
  return FONT_CATALOG.map(
    (font) =>
      `<option value="${escapeHTML(font)}" style="font-family:'${escapeHTML(font)}', sans-serif" ${font === selected ? 'selected' : ''}>${escapeHTML(font)}</option>`,
  ).join('');
}

function controlSection(title, content, open = false) {
  return `<details class="control-section" ${open ? 'open' : ''}><summary><span>${title}</span><span class="section-chevron" aria-hidden="true"></span></summary><div class="control-section-body">${content}</div></details>`;
}

function toggleControl(label, key, checked) {
  return `<label class="toggle-row">${label}<input type="checkbox" data-setting="${key}" ${checked ? 'checked' : ''}><span></span></label>`;
}

function rangeControl(label, key, value, min, max, step = 1, suffix = '') {
  return `<label class="range-label">${label}<output>${value}${suffix}</output><input type="range" data-setting="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
}

function colorEditor(label, key, value) {
  const hex = colorToHex(value);
  const rgb = hexToRgb(hex);
  return `<div class="color-editor" data-color-key="${key}"><span class="color-label">${label}</span><button class="color-trigger" type="button" data-color-trigger aria-expanded="false"><span class="color-chip" style="background:${hex}"></span><code>${hex.toUpperCase()}</code><span class="color-trigger-arrow" aria-hidden="true"></span></button><div class="color-popover" hidden><div class="color-popover-header"><strong>${label}</strong><button type="button" data-color-close aria-label="Close ${label} color palette">×</button></div><label class="visual-picker">Choose visually<input type="color" value="${hex}" data-color-part="picker"></label><label>HEX<input class="code-input" value="${hex.toUpperCase()}" data-color-part="hex" aria-label="${label} hex"></label><div class="rgb-row"><label>R<input type="number" min="0" max="255" value="${rgb.r}" data-color-part="r"></label><label>G<input type="number" min="0" max="255" value="${rgb.g}" data-color-part="g"></label><label>B<input type="number" min="0" max="255" value="${rgb.b}" data-color-part="b"></label></div><div class="palette-row" aria-label="Suggested colors">${PALETTE.map((color) => `<button type="button" data-palette="${color}" aria-label="Use ${color}" title="${color}" style="background:${color}"></button>`).join('')}</div><small>${hex.toUpperCase()} · rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</small></div></div>`;
}

function colorToHex(value) {
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.slice(0, 7).toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value))
    return `#${value
      .slice(1)
      .split('')
      .map((c) => c + c)
      .join('')}`.toLowerCase();
  const parts = String(value).match(/\d+/g);
  if (!parts || parts.length < 3) return '#000000';
  return `#${parts
    .slice(0, 3)
    .map((n) =>
      Math.max(0, Math.min(255, Number(n)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
function hexToRgb(value) {
  const hex = colorToHex(value).slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function renderControls() {
  const editor = state.editor;
  const style = editor.textStyles[state.activeRole];
  const caps = chartCapabilities(state.selected);
  const hasY1 = state.selected.datasets.some((dataset) => dataset.yAxisId === 'y1');
  const axes = caps.axes
    ? controlSection(
        'Axes and labels',
        `${toggleControl('Show data labels', 'showLabels', editor.showLabels)}<label>Data-label position<select data-setting="labelPosition">${selectOptions(
          [
            ['outside', 'Outside'],
            ['inside', 'Inside'],
            ['center', 'Center'],
          ],
          editor.labelPosition,
        )}</select></label>${toggleControl('Show X axis', 'showXAxis', editor.showXAxis)}<label>X-axis title<input type="text" data-setting="xTitle" value="${escapeHTML(editor.xTitle)}"></label><label>X-axis side<select data-setting="xAxisPosition">${selectOptions(
          [
            ['bottom', 'Bottom'],
            ['top', 'Top'],
          ],
          editor.xAxisPosition,
        )}</select></label>${rangeControl('X title spacing', 'xAxisOffset', editor.xAxisOffset, 0, 100, 1, 'px')}${rangeControl('X label angle', 'xAngle', editor.xAngle, -90, 90, 1, '°')}${rangeControl('X-axis line width', 'xAxisWidth', editor.xAxisWidth, 0, 6, 0.5, 'px')}${colorEditor('X-axis line', 'xAxisColor', editor.xAxisColor)}${toggleControl('Show Y axis', 'showYAxis', editor.showYAxis)}<label>Y-axis title<input type="text" data-setting="yTitle" value="${escapeHTML(editor.yTitle)}"></label><label>Y-axis side<select data-setting="yAxisPosition">${selectOptions(
          [
            ['left', 'Left'],
            ['right', 'Right'],
          ],
          editor.yAxisPosition,
        )}</select></label>${rangeControl('Y title spacing', 'yAxisOffset', editor.yAxisOffset, 0, 100, 1, 'px')}${rangeControl('Y label angle', 'yAngle', editor.yAngle, -90, 90, 1, '°')}${rangeControl('Y-axis line width', 'yAxisWidth', editor.yAxisWidth, 0, 6, 0.5, 'px')}${colorEditor('Y-axis line', 'yAxisColor', editor.yAxisColor)}<label>Y scale<select data-setting="yScale">${selectOptions(
          [
            ['linear', 'Linear'],
            ['logarithmic', 'Logarithmic'],
            ['percentage', 'Percentage'],
          ],
          editor.yScale,
        )}</select></label>${toggleControl('Reverse Y direction', 'reverseAxis', editor.reverseAxis)}${
          hasY1
            ? `<label>Y2-axis title<input type="text" data-setting="y1Title" value="${escapeHTML(editor.y1Title)}"></label><label>Y2-axis side<select data-setting="y1AxisPosition">${selectOptions(
                [
                  ['left', 'Left'],
                  ['right', 'Right'],
                ],
                editor.y1AxisPosition,
              )}</select></label>${rangeControl('Y2 title spacing', 'y1AxisOffset', editor.y1AxisOffset, 0, 100, 1, 'px')}`
            : ''
        }`,
        true,
      )
    : '';
  const line = caps.line
    ? controlSection(
        'Line and area',
        `<label>Line style<select data-setting="lineStyle">${selectOptions(
          [
            ['straight', 'Straight'],
            ['smooth', 'Smooth'],
            ['step-after', 'Step'],
          ],
          editor.lineStyle,
        )}</select></label>${rangeControl('Line width', 'borderWidth', editor.borderWidth, 1, 10)}${toggleControl('Fill area', 'fill', editor.fill)}`,
      )
    : '';
  const bar = caps.bar
    ? controlSection(
        'Bars',
        `${toggleControl('Stack datasets', 'stacked', editor.stacked)}${rangeControl('Corner roundness', 'cornerRadius', editor.cornerRadius, 0, 30, 1, 'px')}`,
      )
    : '';
  const points = caps.points
    ? controlSection('Markers', rangeControl('Marker size', 'pointSize', editor.pointSize, 1, 20))
    : '';
  const radial = caps.radial
    ? controlSection(
        'Radial chart',
        `${rangeControl('Start angle', 'startAngle', editor.startAngle, -180, 180, 1, '°')}${rangeControl('Slice gap', 'radialGap', editor.radialGap, 0, 12, 0.5, '°')}${rangeControl('Corner roundness', 'radialCornerRadius', editor.radialCornerRadius, 0, 20, 1, 'px')}${caps.doughnut ? rangeControl('Inner radius', 'innerRadius', editor.innerRadius, 0.1, 0.9, 0.01) : ''}`,
        true,
      )
    : '';
  const panels = {
    design: `${controlSection(
      'Chart colors',
      `${colorTargets(state.selected)
        .map(({ label }, index) =>
          colorEditor(label, `seriesColors.${index}`, editor.seriesColors[index]),
        )
        .join(
          '',
        )}<small class="panel-intro">Colors follow the chart data. Every new series receives its own distinct color automatically.</small>${colorEditor('Canvas background', 'background', editor.background)}`,
      true,
    )}${controlSection('Legend', `${toggleControl('Show legend', 'showLegend', editor.showLegend)}<label>Position<select data-setting="legendPosition">${selectOptions(['top', 'bottom', 'left', 'right', 'inside'], editor.legendPosition)}</select></label>${toggleControl('Background panel', 'legendBackgroundEnabled', editor.legendBackgroundEnabled)}${colorEditor('Legend background', 'legendBackground', editor.legendBackground)}${colorEditor('Legend border', 'legendBorderColor', editor.legendBorderColor)}${rangeControl('Border width', 'legendBorderWidth', editor.legendBorderWidth, 0, 6, 1, 'px')}${rangeControl('Corner roundness', 'legendCornerRadius', editor.legendCornerRadius, 0, 24, 1, 'px')}${rangeControl('Inner padding', 'legendPadding', editor.legendPadding, 0, 30, 1, 'px')}${rangeControl('Item spacing', 'legendItemGap', editor.legendItemGap, 0, 48, 1, 'px')}${rangeControl('Marker size', 'legendMarkerSize', editor.legendMarkerSize, 4, 24, 1, 'px')}<small class="panel-intro">Use Text → Legend for font, size, style, text color, and text background.</small>`, true)}`,
    text: `${controlSection('Text target', `<label>Editing<select data-role>${selectOptions(TEXT_ROLES, state.activeRole)}</select></label><div class="text-preview" style="font-family:'${escapeHTML(style.fontFamily)}';font-size:${style.fontSize}px;font-weight:${style.fontWeight};font-style:${style.fontStyle};color:${style.color};background:${style.backgroundColor};text-decoration:${style.underline ? 'underline' : 'none'}">Chartix typography</div>`, true)}${controlSection(
      'Font and style',
      `<label>Font family<select data-text-setting="fontFamily" class="font-select" style="font-family:'${escapeHTML(style.fontFamily)}', sans-serif">${fontOptions(style.fontFamily)}</select><small>${FONT_CATALOG.length} fonts. Every name is previewed in its own typeface when supported by the browser.</small></label>${rangeControl('Font size', 'text.fontSize', style.fontSize, 8, 72, 1, 'px')}<div class="button-group" aria-label="Text style"><button type="button" data-text-toggle="fontWeight" class="${style.fontWeight >= 700 ? 'is-active' : ''}" aria-label="Bold" aria-pressed="${style.fontWeight >= 700}" title="Toggle bold"><strong>B</strong></button><button type="button" data-text-toggle="fontStyle" class="${style.fontStyle === 'italic' ? 'is-active' : ''}" aria-label="Italic" aria-pressed="${style.fontStyle === 'italic'}" title="Toggle italic"><em>I</em></button><button type="button" data-text-toggle="underline" class="${style.underline ? 'is-active' : ''}" aria-label="Underline" aria-pressed="${style.underline}" title="Toggle underline"><u>U</u></button></div><small class="style-status">Active for ${escapeHTML(TEXT_ROLES.find(([role]) => role === state.activeRole)?.[1] ?? state.activeRole)}: ${[style.fontWeight >= 700 ? 'Bold' : '', style.fontStyle === 'italic' ? 'Italic' : '', style.underline ? 'Underline' : ''].filter(Boolean).join(', ') || 'Regular'}</small><label>Text effect<select data-text-setting="effect">${selectOptions(
        [
          ['none', 'None'],
          ['soft-shadow', 'Soft shadow'],
          ['outline', 'Outline'],
          ['emboss', 'Emboss'],
          ['gradient', 'Gradient'],
        ],
        style.effect,
      )}</select></label>`,
      true,
    )}${controlSection('Text colors', `${colorEditor('Font color', 'text.color', style.color)}${colorEditor('Text background', 'text.backgroundColor', style.backgroundColor)}${colorEditor('Effect color', 'text.effectColor', style.effectColor)}`)}${controlSection('Spacing and link', `<label>Hyperlink<input type="url" data-text-setting="href" value="${escapeHTML(style.href)}" placeholder="https://example.com"></label>${rangeControl('Line height', 'text.lineHeight', style.lineHeight, 0.8, 3, 0.1)}${rangeControl('Letter spacing', 'text.letterSpacing', style.letterSpacing, -2, 12, 0.5, 'px')}<div class="spacing-grid"><span>Text padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="80" data-text-padding="${side}" value="${style.padding[side]}"></label>`).join('')}</div><button class="apply-all-button" type="button" data-apply-all>Apply this text style to all</button>`)}`,
    layout: `${controlSection('Titles', `<label>Title<input type="text" data-setting="title" value="${escapeHTML(editor.title)}"></label><label>Subtitle<input type="text" data-setting="subtitle" value="${escapeHTML(editor.subtitle)}"></label>`, true)}${controlSection('Chart spacing', `<div class="spacing-grid"><span>Chart padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="120" data-padding="${side}" value="${editor.padding[side]}"></label>`).join('')}</div>${rangeControl('Title spacing', 'titleOffset', editor.titleOffset, 0, 80)}${rangeControl('Plot spacing', 'plotGap', editor.plotGap, -40, 100)}`, true)}`,
    chart: `${axes}${line}${bar}${points}${radial || ''}${controlSection(
      'Motion and annotations',
      `${rangeControl('Animation duration', 'duration', editor.duration, 0, 2000, 20, 'ms')}${rangeControl('Series stagger', 'stagger', editor.stagger, 0, 300, 10, 'ms')}${
        caps.cartesian
          ? `<label>Annotation<select data-setting="annotation">${selectOptions(
              [
                ['none', 'None'],
                ['line', 'Reference line'],
                ['box', 'Highlight box'],
                ['point', 'Point label'],
                ['arrow', 'Arrow'],
                ['image', 'Image'],
              ],
              editor.annotation,
            )}</select></label>${editor.annotation === 'image' ? `<label>Image URL<input type="url" data-setting="annotationImage" value="${escapeHTML(editor.annotationImage)}"></label>` : ''}`
          : ''
      }`,
    )}`,
    interaction: `${controlSection(
      'Tooltips and legend',
      `${toggleControl('Tooltips', 'tooltips', editor.tooltips)}${toggleControl('Pin tooltip on click', 'pinTooltip', editor.pinTooltip)}${caps.cartesian ? toggleControl('Crosshair', 'crosshair', editor.crosshair) : ''}<label>Tooltip mode<select data-setting="interactionMode">${selectOptions(
        [
          ['nearest', 'Nearest'],
          ['index', 'Same index'],
          ['dataset', 'Dataset'],
          ['intersect', 'Intersect'],
        ],
        editor.interactionMode,
      )}</select></label>${toggleControl('HTML legend', 'htmlLegend', editor.htmlLegend)}`,
      true,
    )}${controlSection(
      'Navigation and selection',
      `${caps.cartesian ? toggleControl('Zoom and pan', 'zoom', editor.zoom) : ''}<label>Drag selection<select data-setting="selection">${selectOptions(
        [
          ['off', 'Off'],
          ['brush', 'Box selection'],
          ['lasso', 'Lasso selection'],
        ],
        editor.selection,
      )}</select></label>${toggleControl('Adaptive layout', 'adaptive', editor.adaptive)}`,
    )}${controlSection('Accessibility', `${toggleControl('Accessible patterns', 'patterns', editor.patterns)}${toggleControl('Screen-reader table', 'dataTable', editor.dataTable)}${toggleControl('High contrast', 'highContrast', editor.highContrast)}${toggleControl('Dyslexia-friendly text', 'dyslexia', editor.dyslexia)}${toggleControl('Right-to-left layout', 'rtl', editor.rtl)}`)}`,
  };
  const tabs = [
    ['design', 'Design'],
    ['text', 'Text'],
    ['layout', 'Layout'],
    ['chart', 'Chart'],
    ['interaction', 'Interact'],
  ];
  document.querySelector('#chart-controls').innerHTML =
    `<div class="control-tabs" role="tablist" aria-label="Chart settings">${tabs.map(([key, label]) => `<button type="button" role="tab" data-control-tab="${key}" aria-selected="${state.controlTab === key}" class="${state.controlTab === key ? 'is-active' : ''}">${label}</button>`).join('')}</div><div class="control-panel" role="tabpanel" data-control-panel="${state.controlTab}">${panels[state.controlTab]}</div>`;
}

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
      showLegend: chart.options.showLegend ?? (!compact || chart.datasets.length > 1),
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
  const groups = charts.reduce((result, chart) => {
    const group = chart.family === 'radial' ? 'Radial charts' : 'Cartesian charts';
    (result[group] ??= []).push(chart);
    return result;
  }, {});
  document.querySelector('#chart-type-select').innerHTML = Object.entries(groups)
    .map(
      ([label, items]) =>
        `<optgroup label="${label}">${items.map((chart) => `<option value="${chart.id}" ${chart.id === state.selected.id ? 'selected' : ''}>${escapeHTML(chart.name)}</option>`).join('')}</optgroup>`,
    )
    .join('');
}

function resetControls() {
  state.editor = freshEditor(state.selected);
  state.activeRole = 'title';
  state.controlTab = 'design';
  state.previewWidth = 0;
  state.previewHeight = 470;
  renderControls();
  applyPreviewSize(0, 470);
  renderPlayground();
}

function resolvedEditorLayout() {
  const editor = state.editor;
  return {
    padding: deepClone(editor.padding),
    title: deepClone(editor.layout.title),
    subtitle: {
      ...deepClone(editor.layout.subtitle),
      ...(editor.layout.subtitle.y === undefined
        ? { y: editor.padding.top + editor.textStyles.title.fontSize + editor.titleOffset }
        : {}),
    },
    plot: {
      ...deepClone(editor.layout.plot),
      y: (editor.layout.plot.y ?? 0) + Number(editor.plotGap),
    },
  };
}

function currentConfig() {
  const config = baseConfig(state.selected);
  const editor = state.editor;
  config.theme = editor.theme;
  config.options.backgroundColor = editor.background;
  const targetCount = colorTargets(state.selected).length;
  while (editor.seriesColors.length < targetCount)
    editor.seriesColors.push(PALETTE[editor.seriesColors.length % PALETTE.length]);
  config.options.colors = editor.seriesColors.slice(0, targetCount);
  const textStyles = deepClone(editor.textStyles);
  const tooltipStyle = textStyles.tooltip;
  delete textStyles.tooltip;
  config.options.title = editor.title;
  config.options.subtitle = editor.subtitle;
  config.options.typography = textStyles;
  config.options.xLabels = { ...textStyles.xAxis, rotation: Number(editor.xAngle) };
  config.options.yLabels = { ...textStyles.yAxis, rotation: Number(editor.yAngle) };
  config.options.dataLabels = {
    ...textStyles.dataLabel,
    show: editor.showLabels,
    position: editor.labelPosition,
  };
  config.options.tooltip = {
    enabled: editor.tooltips,
    pinOnClick: editor.pinTooltip,
    textStyle: tooltipStyle,
    backgroundColor: tooltipStyle.backgroundColor,
    color: tooltipStyle.color,
    rowGap: 5,
  };
  config.options.crosshair = {
    enabled: editor.crosshair,
    color: '#64748b55',
    width: 1,
    mode: 'x',
    dash: [4, 5],
  };
  config.options.interaction = { mode: editor.interactionMode, keyboard: true };
  config.options.legend = {
    interactive: true,
    position: editor.legendPosition,
    html: editor.htmlLegend,
    backgroundColor: editor.legendBackgroundEnabled ? editor.legendBackground : undefined,
    borderColor: editor.legendBorderColor,
    borderWidth: Number(editor.legendBorderWidth),
    cornerRadius: Number(editor.legendCornerRadius),
    padding: Number(editor.legendPadding),
    itemGap: Number(editor.legendItemGap),
    markerSize: Number(editor.legendMarkerSize),
  };
  config.options.showLegend = editor.showLegend;
  config.options.zoom = {
    enabled: editor.zoom,
    wheel: true,
    pinch: true,
    pan: true,
    box: true,
    resetButton: true,
  };
  config.options.stacked = editor.stacked;
  config.options.fill = editor.fill;
  config.options.animation = {
    duration: Number(editor.duration),
    stagger: Number(editor.stagger),
    easing: 'easeOutCubic',
  };
  config.options.responsiveMode = editor.adaptive ? 'adaptive' : 'fixed';
  config.options.resizable = false;
  config.options.direction = editor.rtl ? 'rtl' : 'ltr';
  config.options.showDataTable = editor.dataTable;
  config.options.editable = true;
  config.options.accessibility = {
    autoSummary: true,
    keyboardHelp: true,
    explorationMode: true,
    highContrast: editor.highContrast,
    dyslexiaFriendly: editor.dyslexia,
    automaticPatterns: editor.patterns,
  };
  config.options.scales = {
    ...config.options.scales,
    x: {
      ...config.options.scales?.x,
      display: editor.showXAxis,
      title: editor.xTitle,
      titleOffset: editor.xAxisOffset,
      position: editor.xAxisPosition,
      line: { color: editor.xAxisColor, width: Number(editor.xAxisWidth) },
    },
    y: {
      ...config.options.scales?.y,
      display: editor.showYAxis,
      title: editor.yTitle,
      titleOffset: editor.yAxisOffset,
      position: editor.yAxisPosition,
      type: editor.yScale,
      reverse: editor.reverseAxis,
      line: { color: editor.yAxisColor, width: Number(editor.yAxisWidth) },
    },
    ...(config.options.scales?.y1
      ? {
          y1: {
            ...config.options.scales.y1,
            title: editor.y1Title,
            titleOffset: editor.y1AxisOffset,
            position: editor.y1AxisPosition,
          },
        }
      : {}),
  };
  config.options.padding = undefined;
  config.options.layout = resolvedEditorLayout();
  config.options.startAngle = Number(editor.startAngle);
  config.options.radialGap = Number(editor.radialGap);
  config.options.radialCornerRadius = Number(editor.radialCornerRadius);
  config.options.cornerRadius = Number(editor.cornerRadius);
  if (state.selected.type === 'doughnut') config.options.innerRadius = Number(editor.innerRadius);
  else delete config.options.innerRadius;
  config.options.width = state.previewWidth || undefined;
  config.options.height = state.previewHeight;
  config.data.datasets = config.data.datasets.map((dataset, index) => ({
    ...dataset,
    color: editor.seriesColors[index] ?? dataset.color,
    ...(chartCapabilities(state.selected).radial && config.data.datasets.length === 1
      ? { colors: editor.seriesColors.slice(0, dataset.values.length) }
      : {}),
    lineStyle: editor.lineStyle,
    borderWidth: Number(editor.borderWidth),
    pointSizes: Array(dataset.values.length).fill(Number(editor.pointSize)),
  }));
  config.options.selection = {
    enabled: editor.selection !== 'off',
    mode: editor.selection === 'lasso' ? 'lasso' : 'brush',
    color: editorAccent(editor),
  };
  if (state.selected.id === 'bar') {
    config.options.drilldown = {
      '0:0': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{ label: 'January revenue', values: [22, 34, 29, 35] }],
      },
    };
  }
  const annotationType = editor.annotation;
  if (annotationType === 'line')
    config.options.annotations = [
      { type: 'line', value: 300, label: 'Target', color: editorAccent(editor), width: 1.5 },
    ];
  else if (annotationType === 'box')
    config.options.annotations = [
      { type: 'box', x: 1, x2: 3, from: 100, to: 260, color: '#0f9f8f44' },
    ];
  else if (annotationType === 'point')
    config.options.annotations = [
      { type: 'point', x: 2, value: 200, label: 'Review', color: editorAccent(editor) },
    ];
  else if (annotationType === 'arrow')
    config.options.annotations = [
      { type: 'arrow', x: 1, value: 150, x2: 3, y2: 275, color: editorAccent(editor) },
    ];
  else if (annotationType === 'image' && editor.annotationImage)
    config.options.annotations = [
      {
        type: 'image',
        x: 2,
        value: 220,
        imageUrl: editor.annotationImage,
        imageWidth: 48,
        imageHeight: 48,
      },
    ];
  return config;
}

function renderPlayground() {
  state.playground?.destroy();
  const host = document.querySelector('#playground-canvas');
  host.innerHTML = '';
  host.style.height = `${state.previewHeight}px`;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.append(canvas);
  const config = currentConfig();
  state.playground = new window.Chartix(canvas, config);
  updateGeneratedCode(config);
}

function updateGeneratedCode(config) {
  const clean = deepClone(config);
  const json = JSON.stringify(clean, null, 2).replace(/'/g, '&#39;');
  document.querySelector('#generated-code').textContent =
    `<script src="https://freber6684.github.io/Chartix/dist/chartix.min.js"></script>\n\n<div data-chartix data-config='${json}'></div>`;
}

function applyPreviewSize(width, height) {
  const safeWidth = width ? Math.max(280, Math.min(1600, Number(width))) : 0;
  const safeHeight = Math.max(240, Math.min(1200, Number(height) || 470));
  state.previewWidth = safeWidth;
  state.previewHeight = safeHeight;
  const host = document.querySelector('#playground-canvas');
  host.style.width = safeWidth ? `min(100%, ${safeWidth}px)` : '100%';
  host.style.height = `${safeHeight}px`;
  host.dataset.viewport = safeWidth === 390 ? 'phone' : safeWidth === 768 ? 'tablet' : 'custom';
  document.querySelector('#preview-width-input').value = safeWidth || host.clientWidth;
  document.querySelector('#preview-height-input').value = safeHeight;
  document.querySelector('#preview-size').textContent = safeWidth
    ? `${safeWidth} × ${safeHeight}px`
    : `Fluid · ${safeHeight}px high`;
  document.querySelectorAll('[data-preview-width]').forEach((button) => {
    const active =
      Number(button.dataset.previewWidth) === safeWidth &&
      Number(button.dataset.previewHeight) === safeHeight;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  window.requestAnimationFrame(() => {
    state.playground?.updateOptions({
      width: safeWidth || undefined,
      height: safeHeight,
    });
    state.playground?.resize();
    updateGeneratedCode(currentConfig());
  });
}

function loadFont(font) {
  if (
    ['system-ui', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS'].includes(
      font,
    ) ||
    document.querySelector(`link[data-chartix-font="${window.CSS.escape(font)}"]`)
  )
    return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.chartixFont = font;
  const family = encodeURIComponent(font).replace(/%20/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
  link.addEventListener(
    'error',
    () => {
      link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    },
    { once: true },
  );
  link.addEventListener(
    'load',
    () => {
      if (Object.values(state.editor.textStyles).some((style) => style.fontFamily === font))
        renderPlayground();
    },
    { once: true },
  );
  document.head.append(link);
}

function rerenderFromEditor(rebuildControls = false) {
  if (rebuildControls) renderControls();
  renderPlayground();
}

function updateColorEditor(container, color) {
  const hex = colorToHex(color);
  const rgb = hexToRgb(hex);
  container.querySelector('[data-color-part="picker"]').value = hex;
  container.querySelector('[data-color-part="hex"]').value = hex.toUpperCase();
  container.querySelector('[data-color-part="r"]').value = rgb.r;
  container.querySelector('[data-color-part="g"]').value = rgb.g;
  container.querySelector('[data-color-part="b"]').value = rgb.b;
  container.querySelector('.color-chip').style.background = hex;
  container.querySelector('.color-trigger code').textContent = hex.toUpperCase();
  container.querySelector('small').textContent =
    `${hex.toUpperCase()} · rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  return hex;
}

function setColor(key, color, container) {
  const normalized = updateColorEditor(container, color);
  if (key.startsWith('text.')) state.editor.textStyles[state.activeRole][key.slice(5)] = normalized;
  else if (key.startsWith('seriesColors.'))
    state.editor.seriesColors[Number(key.slice('seriesColors.'.length))] = normalized;
  else state.editor[key] = normalized;
  rerenderFromEditor();
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
      <li><code>responsive</code> follows the container; the preview controls test exact custom widths and heights.</li>
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
  const preview = event.target.closest('[data-preview-width]');
  if (preview)
    applyPreviewSize(Number(preview.dataset.previewWidth), Number(preview.dataset.previewHeight));
  const controlTab = event.target.closest('[data-control-tab]');
  if (controlTab) {
    state.controlTab = controlTab.dataset.controlTab;
    renderControls();
  }
  const colorTrigger = event.target.closest('[data-color-trigger]');
  if (colorTrigger) {
    const editor = colorTrigger.closest('[data-color-key]');
    const popover = editor.querySelector('.color-popover');
    const willOpen = popover.hidden;
    document.querySelectorAll('.color-popover').forEach((panel) => {
      panel.hidden = true;
      panel
        .closest('[data-color-key]')
        ?.querySelector('[data-color-trigger]')
        ?.setAttribute('aria-expanded', 'false');
    });
    popover.hidden = !willOpen;
    colorTrigger.setAttribute('aria-expanded', String(willOpen));
  }
  const colorClose = event.target.closest('[data-color-close]');
  if (colorClose) {
    const editor = colorClose.closest('[data-color-key]');
    editor.querySelector('.color-popover').hidden = true;
    editor.querySelector('[data-color-trigger]').setAttribute('aria-expanded', 'false');
  }
  if (!event.target.closest('[data-color-key]')) {
    document.querySelectorAll('.color-popover').forEach((panel) => {
      panel.hidden = true;
      panel
        .closest('[data-color-key]')
        ?.querySelector('[data-color-trigger]')
        ?.setAttribute('aria-expanded', 'false');
    });
  }
  const toggle = event.target.closest('[data-text-toggle]');
  if (toggle) {
    const style = state.editor.textStyles[state.activeRole];
    const key = toggle.dataset.textToggle;
    if (key === 'fontWeight') style.fontWeight = style.fontWeight >= 700 ? 400 : 700;
    if (key === 'fontStyle') style.fontStyle = style.fontStyle === 'italic' ? 'normal' : 'italic';
    if (key === 'underline') style.underline = !style.underline;
    if (key === 'fontWeight' || key === 'fontStyle') loadFont(style.fontFamily);
    rerenderFromEditor(true);
  }
  if (event.target.closest('[data-apply-all]')) {
    const source = deepClone(state.editor.textStyles[state.activeRole]);
    TEXT_ROLES.forEach(([role]) => {
      state.editor.textStyles[role] = deepClone(source);
    });
    rerenderFromEditor(true);
  }
  const swatch = event.target.closest('[data-palette]');
  if (swatch)
    setColor(
      swatch.closest('[data-color-key]').dataset.colorKey,
      swatch.dataset.palette,
      swatch.closest('[data-color-key]'),
    );
});

document.querySelector('#back-to-gallery').addEventListener('click', closeDetail);
const resetDialog = document.querySelector('#reset-dialog');
document.querySelector('#reset-controls').addEventListener('click', () => {
  document.querySelector('#reset-chart-name').textContent = state.selected?.name ?? 'this chart';
  resetDialog.showModal();
});
document.querySelector('#cancel-reset').addEventListener('click', () => resetDialog.close());
document.querySelector('#confirm-reset').addEventListener('click', () => {
  resetControls();
  resetDialog.close();
});
resetDialog.addEventListener('click', (event) => {
  if (event.target === resetDialog) resetDialog.close();
});
document.querySelector('#apply-preview-size').addEventListener('click', () => {
  applyPreviewSize(
    Number(document.querySelector('#preview-width-input').value),
    Number(document.querySelector('#preview-height-input').value),
  );
});
document.querySelectorAll('#preview-width-input, #preview-height-input').forEach((input) =>
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.querySelector('#apply-preview-size').click();
    }
  }),
);
document.querySelector('#chart-type-select').addEventListener('change', (event) => {
  openChart(event.target.value);
});
document.querySelector('#chart-controls').addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('[data-role]')) {
    state.activeRole = target.value;
    renderControls();
    return;
  }
  if (target.matches('[data-text-setting]')) {
    state.editor.textStyles[state.activeRole][target.dataset.textSetting] = target.value;
    if (target.dataset.textSetting === 'fontFamily') loadFont(target.value);
    rerenderFromEditor(true);
    return;
  }
  if (target.matches('[data-setting]')) {
    const key = target.dataset.setting;
    const value =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'range' || target.type === 'number'
          ? Number(target.value)
          : target.value;
    if (key.startsWith('text.')) state.editor.textStyles[state.activeRole][key.slice(5)] = value;
    else state.editor[key] = value;
    if (key === 'theme') state.editor.background = themeBackgrounds[target.value];
    rerenderFromEditor(key === 'theme');
  }
});
document.querySelector('#chart-controls').addEventListener('input', (event) => {
  const target = event.target;
  if (
    target.matches('input[type="text"][data-setting]') &&
    ['title', 'subtitle', 'xTitle', 'yTitle', 'y1Title'].includes(target.dataset.setting)
  ) {
    state.editor[target.dataset.setting] = target.value;
    rerenderFromEditor();
  }
});
document.querySelector('#chart-controls').addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches('[data-color-part]')) {
    const container = target.closest('[data-color-key]');
    const part = target.dataset.colorPart;
    if (part === 'hex' && !/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(target.value)) return;
    if (part === 'picker' || part === 'hex')
      setColor(container.dataset.colorKey, target.value, container);
    else {
      const rgb = ['r', 'g', 'b'].map((name) =>
        Number(container.querySelector(`[data-color-part="${name}"]`).value),
      );
      setColor(container.dataset.colorKey, `rgb(${rgb.join(',')})`, container);
    }
    return;
  }
  if (target.matches('[data-text-padding]')) {
    state.editor.textStyles[state.activeRole].padding[target.dataset.textPadding] = Number(
      target.value,
    );
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-padding]')) {
    state.editor.padding[target.dataset.padding] = Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-setting], [data-text-setting]')) {
    const rangeOutput = target.closest('.range-label')?.querySelector('output');
    if (rangeOutput) rangeOutput.textContent = target.value;
  }
});
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
