/* global document, window, history, location, navigator, fetch */

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

const barDesignExamples = [
  {
    id: 'bar-design-aurora',
    designLabel: 'Example 1',
    designName: 'Aurora scorecard',
    showcaseOnly: true,
    name: 'Aurora scorecard',
    type: 'bar',
    family: 'cartesian',
    tag: 'Bar design',
    theme: 'dark',
    summary: 'A luminous dark scorecard with rounded progress tracks and ranked values.',
    bestFor: 'Executive scorecards, department rankings, KPI reviews, and dark dashboards.',
    options: {
      horizontal: true,
      kicker: '●  Q3 PERFORMANCE REVIEW',
      title: 'Department Score',
      subtitle: 'Composite score by department,\nindexed to 100',
      textBoxes: [
        {
          id: 'aurora-source',
          name: 'Source note',
          text: 'Source: internal scorecard · Updated Jul 2026',
          x: 5,
          y: 94,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            color: '#667085',
          },
        },
      ],
      backgroundColor: '#0f172a',
      showLegend: false,
      showGrid: false,
      exportToolbar: { enabled: false },
      cornerRadius: 12,
      barGapRatio: 0.58,
      barTrack: { enabled: true, color: '#18223a', cornerRadius: 12 },
      dataLabels: { show: true, position: 'outside', offset: 8 },
      interaction: { mode: 'intersect', keyboard: true },
      crosshair: { enabled: false },
      highlight: { type: 'fill', backgroundColor: '#ffffff', opacity: 0.08, borderRadius: 12 },
      scales: {
        x: { display: true },
        y: { display: true, min: 0, max: 100, beginAtZero: true },
      },
      xLabels: { color: '#7c849b', fontSize: 11 },
      yLabels: { color: '#f8fafc', fontSize: 13, fontWeight: 650, maxWidth: 150 },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        kicker: { color: '#7c849b', fontSize: 11, fontWeight: 700, letterSpacing: 2 },
        title: { color: '#f8fafc', fontSize: 27, fontWeight: 750 },
        subtitle: { color: '#929bb2', fontSize: 14, fontWeight: 400 },
        dataLabel: { color: '#f8fafc', fontSize: 14, fontWeight: 750 },
      },
      layout: { padding: { top: 34, right: 64, bottom: 38, left: 36 } },
    },
    labels: ['Product Design', 'Engineering', 'Marketing', 'Operations'],
    datasets: [
      {
        label: 'Score',
        values: [94, 78, 64, 47],
        colors: ['#f6bd3f', '#5767f7', '#5869f5', '#5969ef'],
        shadow: { color: '#3b82f644', blur: 12, offsetX: 5 },
      },
    ],
  },
  {
    id: 'bar-design-editorial',
    designLabel: 'Example 2',
    designName: 'Editorial report',
    showcaseOnly: true,
    name: 'Editorial report',
    type: 'bar',
    family: 'cartesian',
    tag: 'Bar design',
    theme: 'minimal',
    summary: 'An editorial scorecard with serif hierarchy, restrained color, and clean tracks.',
    bestFor: 'Board reports, annual reviews, print-inspired stories, and formal publications.',
    options: {
      horizontal: true,
      kicker: 'THE QUARTERLY SCORECARD',
      title: 'Department Score',
      subtitle: 'A composite index of performance\nacross four departments, Q3 2026.',
      textBoxes: [
        {
          id: 'editorial-source',
          name: 'Source note',
          text: 'Source: internal scorecard',
          x: 5,
          y: 94,
          style: { fontFamily: 'Georgia, serif', fontSize: 10, color: '#6f7068' },
        },
        {
          id: 'editorial-index',
          name: 'Index note',
          text: 'Index, 0–100',
          x: 95,
          y: 94,
          align: 'right',
          style: { fontFamily: 'Georgia, serif', fontSize: 10, color: '#6f7068' },
        },
      ],
      backgroundColor: '#f8f7f3',
      showLegend: false,
      showGrid: false,
      exportToolbar: { enabled: false },
      cornerRadius: 0,
      barGapRatio: 0.72,
      barTrack: { enabled: true, color: '#e9e5db', cornerRadius: 0 },
      dataLabels: { show: true, position: 'outside', offset: 8 },
      interaction: { mode: 'intersect', keyboard: true },
      crosshair: { enabled: false },
      highlight: { type: 'fill', backgroundColor: '#b74331', opacity: 0.1, borderRadius: 2 },
      scales: {
        x: { display: false },
        y: { display: true, min: 0, max: 100, beginAtZero: true },
      },
      yLabels: {
        color: '#1d1d1a',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        fontWeight: 700,
        maxWidth: 170,
      },
      typography: {
        fontFamily: 'Georgia, serif',
        kicker: { color: '#a84636', fontSize: 10, fontWeight: 700, letterSpacing: 2.3 },
        title: { color: '#171714', fontSize: 26, fontWeight: 750 },
        subtitle: { color: '#6f7068', fontSize: 13, fontWeight: 600, fontStyle: 'italic' },
        dataLabel: { color: '#171714', fontSize: 14, fontWeight: 750 },
      },
      layout: { padding: { top: 32, right: 62, bottom: 38, left: 34 } },
    },
    labels: ['Product Design', 'Engineering', 'Marketing', 'Operations'],
    datasets: [
      {
        label: 'Score',
        values: [94, 78, 64, 47],
        colors: ['#b74331', '#1b1b18', '#1b1b18', '#1b1b18'],
      },
    ],
  },
  {
    id: 'bar-design-terminal',
    designLabel: 'Example 3',
    designName: 'Terminal monitor',
    showcaseOnly: true,
    name: 'Terminal monitor',
    type: 'bar',
    family: 'cartesian',
    tag: 'Bar design',
    theme: 'dark',
    summary:
      'A command-line monitor with patterned remainder tracks and high-contrast status color.',
    bestFor: 'Developer tools, operations monitors, cyber dashboards, and technical status pages.',
    options: {
      horizontal: true,
      kicker: '$ ./scorecard --quarter Q3 --format bar',
      title: 'DEPARTMENT_SCORE.LOG',
      subtitle: 'index: 0–100 · run: 2026-07-22T09:14:02',
      textBoxes: [
        {
          id: 'terminal-divider',
          name: 'Footer divider',
          text: '----------------------------------------',
          x: 5,
          y: 94,
          style: {
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: '#24472d',
            letterSpacing: 1,
          },
        },
      ],
      backgroundColor: '#061009',
      showLegend: false,
      showGrid: false,
      exportToolbar: { enabled: false },
      cornerRadius: 0,
      barGapRatio: 0.62,
      barTrack: {
        enabled: true,
        color: '#43f17a',
        pattern: 'dots',
        patternPlacement: 'remainder',
        cornerRadius: 0,
      },
      dataLabels: {
        show: true,
        position: 'outside',
        offset: 7,
        backgroundColor: '#061009',
        padding: { top: 2, right: 4, bottom: 2, left: 4 },
      },
      interaction: { mode: 'intersect', keyboard: true },
      crosshair: { enabled: false },
      highlight: { type: 'fill', backgroundColor: '#43f17a', opacity: 0.1, borderRadius: 1 },
      scales: {
        x: { display: false },
        y: { display: true, min: 0, max: 100, beginAtZero: true },
      },
      yLabels: { color: '#d9fbe4', fontSize: 12, fontWeight: 500, maxWidth: 190 },
      typography: {
        fontFamily: "'Space Mono', monospace",
        kicker: { color: '#48d878', fontSize: 13, fontWeight: 500 },
        title: { color: '#45f27d', fontSize: 23, fontWeight: 700 },
        subtitle: { color: '#598164', fontSize: 11, fontWeight: 500 },
        dataLabel: { color: '#43f17a', fontSize: 14, fontWeight: 700 },
      },
      layout: { padding: { top: 32, right: 70, bottom: 34, left: 34 } },
    },
    labels: ['01 · product_design', '02 · engineering', '03 · marketing', '04 · operations'],
    datasets: [
      {
        label: 'Score',
        values: [94, 78, 64, 47],
        colors: ['#f7c545', '#43ed7c', '#43ed7c', '#43ed7c'],
      },
    ],
  },
  {
    id: 'bar-design-poster',
    designLabel: 'Example 4',
    designName: 'Quarterly poster',
    showcaseOnly: true,
    name: 'Quarterly poster',
    type: 'bar',
    family: 'cartesian',
    tag: 'Column design',
    theme: 'minimal',
    summary: 'A bold vertical scorecard with ranked columns and a restrained editorial palette.',
    bestFor: 'Presentation slides, campaign reports, infographics, and quarterly scorecards.',
    options: {
      horizontal: false,
      kicker: 'Q3 2026 · INTERNAL SCORECARD',
      title: 'Department\nScore',
      subtitle: 'Composite performance index\nacross four departments,\nscaled 0–100.',
      textBoxes: [
        {
          id: 'poster-quarter',
          name: 'Quarter watermark',
          text: 'Q3',
          x: 94,
          y: 5,
          align: 'right',
          layer: 'back',
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            color: '#dededb',
          },
        },
        {
          id: 'poster-index',
          name: 'Index note',
          text: 'INDEX 0–100',
          x: 5,
          y: 94,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            color: '#77766d',
          },
        },
        {
          id: 'poster-source',
          name: 'Source note',
          text: 'INTERNAL SCORECARD',
          x: 95,
          y: 94,
          align: 'right',
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            color: '#77766d',
          },
        },
      ],
      backgroundColor: '#f7f7f4',
      showLegend: false,
      showGrid: false,
      exportToolbar: { enabled: false },
      cornerRadius: 0,
      barGapRatio: 0.12,
      dataLabels: { show: true, position: 'outside', offset: 7 },
      interaction: { mode: 'intersect', keyboard: true },
      crosshair: { enabled: false },
      highlight: { type: 'fill', backgroundColor: '#dc4c2b', opacity: 0.1, borderRadius: 2 },
      scales: {
        x: { display: true, line: { color: '#171714', width: 3 } },
        y: { display: false, min: 0, max: 100, beginAtZero: true },
      },
      xLabels: { color: '#171714', fontSize: 10, fontWeight: 700, maxWidth: 130 },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        kicker: { color: '#d94d2c', fontSize: 11, fontWeight: 750, letterSpacing: 2 },
        title: { color: '#111110', fontSize: 29, fontWeight: 800, lineHeight: 1.02 },
        subtitle: { color: '#5f605a', fontSize: 13, fontWeight: 450, lineHeight: 1.35 },
        dataLabel: { color: '#111110', fontSize: 16, fontWeight: 800 },
      },
      layout: { padding: { top: 30, right: 34, bottom: 42, left: 34 } },
    },
    labels: ['PRODUCT\nDESIGN', 'ENGINEERING', 'MARKETING', 'OPERATIONS'],
    datasets: [
      {
        label: 'Score',
        values: [94, 78, 64, 47],
        colors: ['#dc4c2b', '#36342d', '#62615a', '#969488'],
      },
    ],
  },
];

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
  ...barDesignExamples,
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
  ['kicker', 'Kicker'],
  ['title', 'Title'],
  ['subtitle', 'Subtitle'],
  ['xAxis', 'X-axis labels'],
  ['yAxis', 'Y-axis labels'],
  ['xAxisTitle', 'X-axis title'],
  ['yAxisTitle', 'Y-axis title'],
  ['dataLabel', 'Data labels'],
  ['legend', 'Legend'],
  ['tooltip', 'Tooltip'],
  ['exportAction', 'Export button text'],
];
const EXPORT_ACTIONS = [
  ['csv', 'CSV'],
  ['json', 'JSON'],
  ['png', 'PNG'],
  ['jpeg', 'JPG'],
  ['copy', 'Copy'],
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
    kicker: { fontSize: 10, fontWeight: 700, color: color.muted, lineHeight: 1.2 },
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
    exportAction: { fontSize: 11, fontWeight: 600, color: '#172033', lineHeight: 1.2 },
    tooltip: {
      fontSize: 12,
      fontWeight: 600,
      color: '#f8fafc',
      backgroundColor: '#0f172a',
      lineHeight: 1.45,
      padding: { top: 10, right: 12, bottom: 10, left: 12 },
      borderColor: '#334155',
      borderWidth: 1,
      borderRadius: 10,
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
    borderColor: '#cbd5e1',
    borderWidth: 0,
    borderRadius: 6,
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
  activeTextBoxId: null,
  controlTab: 'chart',
  editor: null,
  importedData: null,
  importRows: [],
  importFields: [],
  importMapping: { category: '', values: [] },
  codeEdited: false,
  codeTimer: null,
  lastConfig: null,
};

function activeData() {
  return (
    state.importedData ?? {
      labels: state.selected.labels,
      datasets: state.selected.datasets,
    }
  );
}

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
    barSpacing: ['bar', 'column', 'horizontal-bar', 'grouped-bar', 'stacked-bar'].includes(type),
    points,
    doughnut: type === 'doughnut',
    axes: !radial,
  };
}

function normalizeTextBox(box, index, chart) {
  const presetStyle = box.style ?? {};
  return {
    id: box.id || `text-box-${index + 1}`,
    name: box.name || `Text box ${index + 1}`,
    text: box.text ?? '',
    visible: box.visible !== false,
    anchor: box.anchor ?? 'canvas',
    unit: box.unit ?? 'percent',
    x: box.x ?? 8,
    y: box.y ?? 10 + index * 6,
    align: box.align ?? 'left',
    rotation: box.rotation ?? 0,
    layer: box.layer ?? 'front',
    style: {
      fontFamily:
        presetStyle.fontFamily ?? chart.options.typography?.fontFamily ?? "'Space Mono', monospace",
      fontSize: presetStyle.fontSize ?? 13,
      fontWeight: presetStyle.fontWeight ?? 500,
      fontStyle: presetStyle.fontStyle ?? 'normal',
      color: presetStyle.color ?? '#172033',
      backgroundColor: presetStyle.backgroundColor ?? '#ffffff00',
      borderColor: presetStyle.borderColor ?? '#d7dce5',
      borderWidth: presetStyle.borderWidth ?? 0,
      borderRadius: presetStyle.borderRadius ?? 6,
      underline: Boolean(presetStyle.underline),
      effect: presetStyle.effect ?? 'none',
      effectColor: presetStyle.effectColor ?? '#00000055',
      lineHeight: presetStyle.lineHeight ?? 1.3,
      letterSpacing: presetStyle.letterSpacing ?? 0,
      padding: {
        top: presetStyle.padding?.top ?? 0,
        right: presetStyle.padding?.right ?? 0,
        bottom: presetStyle.padding?.bottom ?? 0,
        left: presetStyle.padding?.left ?? 0,
      },
    },
  };
}

function freshEditor(chart) {
  const caps = chartCapabilities(chart);
  const horizontal = chart.options.horizontal || chart.type === 'horizontal-bar';
  const legendPadding = chart.options.legend?.padding;
  const normalizedLegendPadding =
    typeof legendPadding === 'number'
      ? { top: legendPadding, right: legendPadding, bottom: legendPadding, left: legendPadding }
      : {
          top: legendPadding?.top ?? 8,
          right: legendPadding?.right ?? 8,
          bottom: legendPadding?.bottom ?? 8,
          left: legendPadding?.left ?? 8,
        };
  const presetTypography = chart.options.typography ?? {};
  const presetAll = presetTypography.all ?? {};
  const presetPadding = chart.options.layout?.padding ?? {};
  const textStyles = Object.fromEntries(
    TEXT_ROLES.map(([role]) => {
      const optionRole =
        role === 'xAxis'
          ? chart.options.xLabels
          : role === 'yAxis'
            ? chart.options.yLabels
            : role === 'dataLabel'
              ? chart.options.dataLabels
              : {};
      return [
        role,
        {
          ...defaultTextStyle(role, chart.theme),
          ...(presetTypography.fontFamily ? { fontFamily: presetTypography.fontFamily } : {}),
          ...presetAll,
          ...optionRole,
          ...(presetTypography[role] ?? {}),
          padding: {
            ...defaultTextStyle(role, chart.theme).padding,
            ...presetAll.padding,
            ...optionRole?.padding,
            ...(presetTypography[role]?.padding ?? {}),
          },
        },
      ];
    }),
  );
  return {
    theme: chart.theme,
    seriesColors: initialSeriesColors(chart),
    background: chart.options.backgroundColor ?? themeBackgrounds[chart.theme],
    canvasBorderColor: chart.options.canvas?.borderColor ?? '#d7dce5',
    canvasBorderWidth: chart.options.canvas?.borderWidth ?? 0,
    canvasBorderRadius: chart.options.canvas?.borderRadius ?? 8,
    highlightType: chart.options.highlight?.type ?? 'fill',
    highlightColor: chart.options.highlight?.color ?? chart.datasets[0]?.colors?.[0] ?? '#625bf6',
    highlightBackground:
      chart.options.highlight?.backgroundColor ?? chart.datasets[0]?.colors?.[0] ?? '#625bf6',
    highlightBorderWidth: chart.options.highlight?.borderWidth ?? 1,
    highlightBorderRadius: chart.options.highlight?.borderRadius ?? 8,
    highlightOpacity: chart.options.highlight?.opacity ?? 0.16,
    highlightGlowBlur: chart.options.highlight?.glowBlur ?? 14,
    kicker: chart.options.kicker ?? '',
    title: chart.options.title ?? `${chart.name} example`,
    subtitle: chart.options.subtitle ?? 'Interactive Chartix visualization',
    source: chart.options.source ?? '',
    footnote: chart.options.footnote ?? '',
    watermark: chart.options.watermark ?? '',
    textBoxes: (chart.options.textBoxes ?? []).map((box, index) =>
      normalizeTextBox(box, index, chart),
    ),
    xTitle: chart.options.scales?.x?.title ?? '',
    yTitle: chart.options.scales?.y?.title ?? '',
    y1Title: chart.options.scales?.y1?.title ?? 'Secondary value',
    textStyles,
    showLabels: Boolean(chart.options.dataLabels?.show),
    labelPosition: chart.options.dataLabels?.position ?? 'outside',
    xAngle: chart.options.xLabels?.rotation ?? 0,
    yAngle: chart.options.yLabels?.rotation ?? 0,
    showXAxis: chart.options.scales?.x?.display !== false,
    showYAxis: chart.options.scales?.y?.display !== false,
    showHorizontalGrid:
      chart.options.grid?.horizontal ?? (chart.options.showGrid !== false && !horizontal),
    showVerticalGrid:
      chart.options.grid?.vertical ??
      (chart.options.showGrid !== false &&
        (horizontal || ['scatter', 'bubble'].includes(chart.type))),
    xAxisColor: chart.options.scales?.x?.line?.color ?? '#cbd5e1',
    yAxisColor: chart.options.scales?.y?.line?.color ?? '#cbd5e1',
    xAxisWidth: chart.options.scales?.x?.line?.width ?? 1,
    yAxisWidth: chart.options.scales?.y?.line?.width ?? 1,
    padding: {
      top: presetPadding.top ?? 24,
      right: presetPadding.right ?? 24,
      bottom: presetPadding.bottom ?? 24,
      left: presetPadding.left ?? 24,
    },
    titleOffset: 12,
    xAxisOffset: chart.options.scales?.x?.titleOffset ?? 12,
    yAxisOffset: chart.options.scales?.y?.titleOffset ?? 12,
    y1AxisOffset: chart.options.scales?.y1?.titleOffset ?? 12,
    xAxisPosition: chart.options.scales?.x?.position ?? 'bottom',
    yAxisPosition: chart.options.scales?.y?.position ?? 'left',
    y1AxisPosition: chart.options.scales?.y1?.position ?? 'right',
    plotGap: 0,
    layout: {
      kicker: { ...(chart.options.layout?.kicker ?? {}) },
      title: { ...(chart.options.layout?.title ?? {}) },
      subtitle: { ...(chart.options.layout?.subtitle ?? {}) },
      plot: { widthScale: 1, heightScale: 1, ...(chart.options.layout?.plot ?? {}) },
    },
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
    barGapPercent: Math.round((chart.options.barGapRatio ?? (horizontal ? 0.36 : 0.32)) * 100),
    barDatasetGap: chart.options.barDatasetGap ?? 3,
    barTrackEnabled: Boolean(chart.options.barTrack?.enabled),
    barTrackColor: chart.options.barTrack?.color ?? '#e2e8f0',
    barTrackPattern: chart.options.barTrack?.pattern ?? 'none',
    barTrackPatternPlacement: chart.options.barTrack?.patternPlacement ?? 'full',
    barTrackRadius: chart.options.barTrack?.cornerRadius ?? chart.options.cornerRadius ?? 8,
    categoryMode:
      (horizontal
        ? chart.options.scales?.y?.categoryMode
        : chart.options.scales?.x?.categoryMode) ?? 'auto',
    labelDensity: Math.round(
      ((horizontal
        ? chart.options.scales?.y?.labelDensity
        : chart.options.scales?.x?.labelDensity) ?? 0.7) * 100,
    ),
    radialGap: chart.options.radialGap ?? 1,
    tooltips: chart.options.tooltip?.enabled !== false,
    pinTooltip: Boolean(chart.options.tooltip?.pinOnClick),
    crosshair: Boolean(chart.options.crosshair?.enabled),
    interactionMode:
      chart.options.interaction?.mode ??
      (caps.bar || caps.radial ? 'intersect' : chart.datasets.length > 1 ? 'index' : 'nearest'),
    showLegend: chart.options.showLegend ?? true,
    legendPosition: chart.options.legend?.position ?? 'top',
    legendBackgroundEnabled: Boolean(chart.options.legend?.backgroundColor),
    legendBackground: chart.options.legend?.backgroundColor ?? '#ffffff',
    legendBorderColor: chart.options.legend?.borderColor ?? '#d7dce5',
    legendBorderWidth: chart.options.legend?.borderWidth ?? 0,
    legendCornerRadius: chart.options.legend?.cornerRadius ?? 8,
    legendPadding: normalizedLegendPadding,
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
    visibleDataTable: false,
    dataTableSearch: true,
    dataTableSort: true,
    dataTablePageSize: 10,
    importEnabled: true,
    exportToolbar: chart.options.exportToolbar?.enabled ?? true,
    exportCSV: true,
    exportJSON: true,
    exportPNG: true,
    exportJPEG: false,
    exportCopy: true,
    exportPosition: 'top-right',
    exportGap: 6,
    exportPadding: { top: 12, right: 12, bottom: 12, left: 12 },
    exportLayout: 'grouped',
    exportDisplay: 'text',
    exportIconSize: 16,
    exportButtonBackground: '#ffffff',
    exportButtonHover: '#eef2f7',
    exportButtonBorder: '#94a3b8',
    exportButtonBorderWidth: 1,
    exportButtonRadius: 7,
    exportButtonPadding: { top: 6, right: 8, bottom: 6, left: 8 },
    exportActions: Object.fromEntries(
      EXPORT_ACTIONS.map(([key, label]) => [
        key,
        {
          label,
          display: 'inherit',
          iconUrl: '',
          iconSize: 16,
          position: 'top-right',
          padding: { top: 12, right: 12, bottom: 12, left: 12 },
        },
      ]),
    ),
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

function activeTextBox() {
  return state.editor.textBoxes.find((box) => box.id === state.activeTextBoxId) ?? null;
}

function textBoxControls(editor) {
  const box = activeTextBox();
  const items = editor.textBoxes
    .map(
      (item) =>
        `<button type="button" class="text-box-item ${item.id === state.activeTextBoxId ? 'is-active' : ''}" data-select-text-box="${escapeHTML(item.id)}"><span><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.text || 'Empty text box')}</small></span><i aria-hidden="true">${item.visible ? 'On' : 'Off'}</i></button>`,
    )
    .join('');
  const editorPanel = box
    ? `<div class="text-box-editor">
        <div class="text-box-editor-heading"><strong>Design independently</strong><button type="button" class="text-box-delete" data-delete-text-box="${escapeHTML(box.id)}">Delete</button></div>
        <label>Box name<input type="text" data-textbox-setting="name" value="${escapeHTML(box.name)}"></label>
        <label>Text<textarea rows="4" data-textbox-setting="text" placeholder="Write anything…">${escapeHTML(box.text)}</textarea></label>
        <label class="toggle-row">Show text box<input type="checkbox" data-textbox-setting="visible" ${box.visible ? 'checked' : ''}><span></span></label>
        <div class="two-column-controls"><label>Anchor<select data-textbox-setting="anchor">${selectOptions(
          [
            ['canvas', 'Whole canvas'],
            ['plot', 'Plot area'],
          ],
          box.anchor,
        )}</select></label><label>Position unit<select data-textbox-setting="unit">${selectOptions(
          [
            ['percent', 'Responsive %'],
            ['pixel', 'Exact pixels'],
          ],
          box.unit,
        )}</select></label></div>
        <div class="two-column-controls"><label>X position<input type="number" step="1" data-textbox-setting="x" value="${box.x}"></label><label>Y position<input type="number" step="1" data-textbox-setting="y" value="${box.y}"></label></div>
        <div class="two-column-controls"><label>Alignment<select data-textbox-setting="align">${selectOptions(['left', 'center', 'right'], box.align)}</select></label><label>Layer<select data-textbox-setting="layer">${selectOptions(
          [
            ['front', 'In front of chart'],
            ['back', 'Behind chart'],
          ],
          box.layer,
        )}</select></label></div>
        ${rangeControl('Rotation', 'textBox.rotation', box.rotation, -180, 180, 1, '°')}
        <label>Font family<select class="font-select" data-textbox-style="fontFamily" style="font-family:'${escapeHTML(box.style.fontFamily)}', sans-serif">${fontOptions(box.style.fontFamily)}</select></label>
        ${rangeControl('Font size', 'textBox.fontSize', box.style.fontSize, 8, 96, 1, 'px')}
        <div class="button-group" aria-label="Text box style"><button type="button" data-textbox-toggle="fontWeight" class="${box.style.fontWeight >= 700 ? 'is-active' : ''}" aria-pressed="${box.style.fontWeight >= 700}"><strong>B</strong></button><button type="button" data-textbox-toggle="fontStyle" class="${box.style.fontStyle === 'italic' ? 'is-active' : ''}" aria-pressed="${box.style.fontStyle === 'italic'}"><em>I</em></button><button type="button" data-textbox-toggle="underline" class="${box.style.underline ? 'is-active' : ''}" aria-pressed="${box.style.underline}"><u>U</u></button></div>
        ${colorEditor('Font color', 'textBox.color', box.style.color)}
        ${colorEditor('Background', 'textBox.backgroundColor', box.style.backgroundColor)}
        ${colorEditor('Border color', 'textBox.borderColor', box.style.borderColor)}
        ${rangeControl('Border width', 'textBox.borderWidth', box.style.borderWidth, 0, 12, 1, 'px')}
        ${rangeControl('Corner roundness', 'textBox.borderRadius', box.style.borderRadius, 0, 40, 1, 'px')}
        ${rangeControl('Line height', 'textBox.lineHeight', box.style.lineHeight, 0.8, 3, 0.1)}
        ${rangeControl('Letter spacing', 'textBox.letterSpacing', box.style.letterSpacing, -2, 12, 0.5, 'px')}
        <div class="spacing-grid"><span>Inner padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="80" data-textbox-padding="${side}" value="${box.style.padding[side]}"></label>`).join('')}</div>
      </div>`
    : `<div class="text-box-empty"><strong>No independent text boxes yet</strong><p>Add notes, labels, callouts, sources, badges, or any other text.</p></div>`;
  return `<div class="text-box-toolbar"><div><strong>Independent text boxes</strong><small>${editor.textBoxes.length} created · unlimited</small></div><button type="button" data-add-text-box>+ Add text box</button></div><div class="text-box-list">${items}</div>${editorPanel}<p class="panel-intro">Every box is stored in <code>options.textBoxes</code>, updates the generated code live, and can use responsive percentage positioning.</p>`;
}

function exportActionEditor(editor, key, fallbackLabel) {
  const action = editor.exportActions[key];
  return `<details class="control-subsection"><summary>${escapeHTML(fallbackLabel)} button</summary><div class="control-subsection-body"><label>Button text<input type="text" data-export-action="${key}" data-export-property="label" value="${escapeHTML(action.label)}"></label><label>Content<select data-export-action="${key}" data-export-property="display">${selectOptions(
    [
      ['inherit', 'Use toolbar default'],
      ['text', 'Text only'],
      ['icon', 'Icon only'],
      ['icon-text', 'Icon and text'],
    ],
    action.display,
  )}</select></label><label>Icon URL<input type="url" data-export-action="${key}" data-export-property="iconUrl" value="${escapeHTML(action.iconUrl)}" placeholder="https://example.com/icon.svg"></label>${rangeControl(`Icon size`, `exportAction.${key}.iconSize`, action.iconSize, 8, 64, 1, 'px')}<label>Independent position<select data-export-action="${key}" data-export-property="position">${selectOptions(
    [
      ['top-right', 'Top right'],
      ['top-left', 'Top left'],
      ['bottom-right', 'Bottom right'],
      ['bottom-left', 'Bottom left'],
    ],
    action.position,
  )}</select></label><div class="spacing-grid"><span>Edge padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="120" data-export-action="${key}" data-export-padding="${side}" value="${action.padding[side]}"></label>`).join('')}</div></div></details>`;
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
  if (!editor.textBoxes.some((box) => box.id === state.activeTextBoxId))
    state.activeTextBoxId = editor.textBoxes[0]?.id ?? null;
  const style = editor.textStyles[state.activeRole];
  const caps = chartCapabilities(state.selected);
  const hasY1 = state.selected.datasets.some((dataset) => dataset.yAxisId === 'y1');
  const axes = caps.axes
    ? controlSection(
        'Axes and labels',
        `${toggleControl('Horizontal gridlines', 'showHorizontalGrid', editor.showHorizontalGrid)}${toggleControl('Vertical gridlines', 'showVerticalGrid', editor.showVerticalGrid)}<p class="control-note">Show either direction, both directions, or turn both off for a clean plot.</p>${toggleControl('Show data labels', 'showLabels', editor.showLabels)}<label>Data-label position<select data-setting="labelPosition">${selectOptions(
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
        `${toggleControl('Stack datasets', 'stacked', editor.stacked)}${rangeControl('Corner roundness', 'cornerRadius', editor.cornerRadius, 0, 30, 1, 'px')}${toggleControl('Show full-value tracks', 'barTrackEnabled', editor.barTrackEnabled)}${
          editor.barTrackEnabled
            ? `${colorEditor('Track color', 'barTrackColor', editor.barTrackColor)}<label>Track texture<select data-setting="barTrackPattern">${selectOptions(
                [
                  ['none', 'Solid'],
                  ['dots', 'Dots'],
                  ['diagonal', 'Diagonal'],
                  ['crosshatch', 'Crosshatch'],
                ],
                editor.barTrackPattern,
              )}</select></label>${
                editor.barTrackPattern === 'none'
                  ? ''
                  : `<label>Texture coverage<select data-setting="barTrackPatternPlacement">${selectOptions(
                      [
                        ['remainder', 'Unfilled remainder only'],
                        ['full', 'Full track'],
                      ],
                      editor.barTrackPatternPlacement,
                    )}</select></label>`
              }${rangeControl('Track roundness', 'barTrackRadius', editor.barTrackRadius, 0, 30, 1, 'px')}`
            : ''
        }${
          caps.barSpacing
            ? `${rangeControl('Gap between categories', 'barGapPercent', editor.barGapPercent, 0, 90, 1, '%')}${rangeControl('Gap between series', 'barDatasetGap', editor.barDatasetGap, 0, 24, 1, 'px')}<label>Dense-axis display<select data-setting="categoryMode">${selectOptions(
                [
                  ['auto', 'Automatic (recommended)'],
                  ['categorical', 'Categorical — show every label'],
                  ['continuous', 'Continuous — sample labels evenly'],
                ],
                editor.categoryMode,
              )}</select></label>${editor.categoryMode === 'categorical' ? '' : rangeControl('Label density', 'labelDensity', editor.labelDensity, 10, 100, 5, '%')}<small class="panel-intro">Every bar remains visible. Automatic and continuous modes only reduce crowded axis labels; continuous mode always keeps the first and last label.</small>`
            : ''
        }`,
        caps.barSpacing,
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
  const chartDesign = `${controlSection(
    'Chart colors',
    `${colorTargets({ ...state.selected, ...activeData() })
      .map(({ label }, index) =>
        colorEditor(label, `seriesColors.${index}`, editor.seriesColors[index]),
      )
      .join(
        '',
      )}<small class="panel-intro">Colors follow the chart data. Every new series receives its own distinct color automatically.</small>`,
    true,
  )}${controlSection(
    'Canvas',
    `${colorEditor('Canvas background', 'background', editor.background)}${colorEditor('Canvas border', 'canvasBorderColor', editor.canvasBorderColor)}${rangeControl('Border width', 'canvasBorderWidth', editor.canvasBorderWidth, 0, 12, 1, 'px')}${rangeControl('Corner roundness', 'canvasBorderRadius', editor.canvasBorderRadius, 0, 40, 1, 'px')}`,
  )}${controlSection(
    'Highlight',
    `<label>Highlight style<select data-setting="highlightType">${selectOptions(
      [
        ['none', 'None'],
        ['outline', 'Outline'],
        ['glow', 'Glow'],
        ['fill', 'Color wash'],
        ['x-band', 'Vertical plot band'],
        ['y-band', 'Horizontal plot band'],
      ],
      editor.highlightType,
    )}</select></label>${editor.highlightType !== 'none' ? `${colorEditor('Highlight color', 'highlightColor', editor.highlightColor)}${['fill', 'x-band', 'y-band'].includes(editor.highlightType) ? `${colorEditor('Highlight background', 'highlightBackground', editor.highlightBackground)}${rangeControl('Background opacity', 'highlightOpacity', editor.highlightOpacity, 0.04, 0.8, 0.02)}` : ''}${rangeControl('Border width', 'highlightBorderWidth', editor.highlightBorderWidth, 1, 10, 1, 'px')}${rangeControl('Corner roundness', 'highlightBorderRadius', editor.highlightBorderRadius, 0, 30, 1, 'px')}${editor.highlightType === 'glow' ? rangeControl('Glow strength', 'highlightGlowBlur', editor.highlightGlowBlur, 0, 40, 1, 'px') : ''}` : ''}<small class="panel-intro">Applied consistently when users hover, tap, or explore with the keyboard.</small>`,
    true,
  )}${controlSection(
    'Legend',
    `${toggleControl('Show legend', 'showLegend', editor.showLegend)}<label>Position<select data-setting="legendPosition">${selectOptions(['top', 'bottom', 'left', 'right', 'inside'], editor.legendPosition)}</select></label>${toggleControl('Background panel', 'legendBackgroundEnabled', editor.legendBackgroundEnabled)}${colorEditor('Legend background', 'legendBackground', editor.legendBackground)}${colorEditor('Legend border', 'legendBorderColor', editor.legendBorderColor)}${rangeControl('Border width', 'legendBorderWidth', editor.legendBorderWidth, 0, 6, 1, 'px')}${rangeControl('Corner roundness', 'legendCornerRadius', editor.legendCornerRadius, 0, 24, 1, 'px')}<div class="spacing-grid"><span>Legend box padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="80" data-legend-padding="${side}" value="${editor.legendPadding[side]}"></label>`).join('')}</div>${rangeControl('Item spacing', 'legendItemGap', editor.legendItemGap, 0, 48, 1, 'px')}${rangeControl('Marker size', 'legendMarkerSize', editor.legendMarkerSize, 4, 24, 1, 'px')}<small class="panel-intro">Use Text → Legend to style each legend label and its own border.</small>`,
    true,
  )}`;
  const panels = {
    content: `${controlSection(
      'Chart text',
      `<p class="panel-intro content-intro">Every visible heading and note is editable here and included in the generated code.</p><label>Kicker<input type="text" data-setting="kicker" value="${escapeHTML(editor.kicker)}" placeholder="Optional section label"></label><label>Title<textarea rows="2" data-setting="title" placeholder="Chart title">${escapeHTML(editor.title)}</textarea></label><label>Subtitle<textarea rows="3" data-setting="subtitle" placeholder="Optional explanation">${escapeHTML(editor.subtitle)}</textarea></label><label>Source<input type="text" data-setting="source" value="${escapeHTML(editor.source)}" placeholder="Optional source"></label><label>Footnote<input type="text" data-setting="footnote" value="${escapeHTML(editor.footnote)}" placeholder="Optional footnote"></label><label>Watermark<input type="text" data-setting="watermark" value="${escapeHTML(editor.watermark)}" placeholder="Optional watermark"></label>`,
      true,
    )}${controlSection('Independent text boxes', textBoxControls(editor), true)}${
      caps.axes
        ? controlSection(
            'Axis titles',
            `<label>X-axis title<input type="text" data-setting="xTitle" value="${escapeHTML(editor.xTitle)}" placeholder="Leave blank to hide"></label><label>Y-axis title<input type="text" data-setting="yTitle" value="${escapeHTML(editor.yTitle)}" placeholder="Leave blank to hide"></label>${caps.dualAxis ? `<label>Y2-axis title<input type="text" data-setting="y1Title" value="${escapeHTML(editor.y1Title)}" placeholder="Leave blank to hide"></label>` : ''}<small class="panel-intro">Axis titles are never inserted automatically. A blank box means no title is drawn.</small>`,
            true,
          )
        : ''
    }`,
    text: `${controlSection('Text target', `<label>Editing<select data-role>${selectOptions(TEXT_ROLES, state.activeRole)}</select></label><div class="text-preview" style="font-family:'${escapeHTML(style.fontFamily)}';font-size:${style.fontSize}px;font-weight:${style.fontWeight};font-style:${style.fontStyle};color:${style.color};background:${style.backgroundColor};border:${style.borderWidth}px solid ${style.borderColor};border-radius:${style.borderRadius}px;padding:${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px;text-decoration:${style.underline ? 'underline' : 'none'}">Chartix typography</div>`, true)}${controlSection(
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
    )}${controlSection('Text colors', `${colorEditor('Font color', 'text.color', style.color)}${colorEditor('Text background', 'text.backgroundColor', style.backgroundColor)}${colorEditor('Effect color', 'text.effectColor', style.effectColor)}`)}${controlSection('Border and spacing', `${colorEditor('Border color', 'text.borderColor', style.borderColor)}${rangeControl('Border width', 'text.borderWidth', style.borderWidth, 0, 12, 1, 'px')}${rangeControl('Corner roundness', 'text.borderRadius', style.borderRadius, 0, 40, 1, 'px')}<label>Hyperlink<input type="url" data-text-setting="href" value="${escapeHTML(style.href)}" placeholder="https://example.com"></label>${rangeControl('Line height', 'text.lineHeight', style.lineHeight, 0.8, 3, 0.1)}${rangeControl('Letter spacing', 'text.letterSpacing', style.letterSpacing, -2, 12, 0.5, 'px')}<div class="spacing-grid"><span>Text box padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="80" data-text-padding="${side}" value="${style.padding[side]}"></label>`).join('')}</div><button class="apply-all-button" type="button" data-apply-all>Apply this text style to all</button>`)}`,
    layout: `${controlSection('Chart spacing', `<div class="spacing-grid"><span>Chart padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="120" data-padding="${side}" value="${editor.padding[side]}"></label>`).join('')}</div>${rangeControl('Title spacing', 'titleOffset', editor.titleOffset, 0, 80)}${rangeControl('Plot spacing', 'plotGap', editor.plotGap, -40, 100)}`, true)}`,
    chart: `${chartDesign}${axes}${line}${bar}${points}${radial || ''}${controlSection(
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
    )}${controlSection(
      'Export toolbar',
      `${toggleControl('Show export toolbar', 'exportToolbar', editor.exportToolbar)}${toggleControl('CSV data', 'exportCSV', editor.exportCSV)}${toggleControl('JSON data', 'exportJSON', editor.exportJSON)}${toggleControl('PNG image', 'exportPNG', editor.exportPNG)}${toggleControl('JPEG image', 'exportJPEG', editor.exportJPEG)}${toggleControl('Copy image', 'exportCopy', editor.exportCopy)}<label>Arrangement<select data-setting="exportLayout">${selectOptions(
        [
          ['grouped', 'Grouped toolbar'],
          ['separate', 'Separate movable buttons'],
        ],
        editor.exportLayout,
      )}</select></label><label>Default content<select data-setting="exportDisplay">${selectOptions(
        [
          ['text', 'Text only'],
          ['icon', 'Icon only'],
          ['icon-text', 'Icon and text'],
        ],
        editor.exportDisplay,
      )}</select></label><label>Grouped position<select data-setting="exportPosition">${selectOptions(
        [
          ['top-right', 'Top right'],
          ['top-left', 'Top left'],
          ['bottom-right', 'Bottom right'],
          ['bottom-left', 'Bottom left'],
        ],
        editor.exportPosition,
      )}</select></label>${rangeControl('Button spacing', 'exportGap', editor.exportGap, 0, 24, 1, 'px')}${rangeControl('Default icon size', 'exportIconSize', editor.exportIconSize, 8, 64, 1, 'px')}<div class="spacing-grid"><span>Grouped edge padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="120" data-export-padding="${side}" value="${editor.exportPadding[side]}"></label>`).join('')}</div>${colorEditor('Button background', 'exportButtonBackground', editor.exportButtonBackground)}${colorEditor('Hover background', 'exportButtonHover', editor.exportButtonHover)}${colorEditor('Button border', 'exportButtonBorder', editor.exportButtonBorder)}${rangeControl('Border width', 'exportButtonBorderWidth', editor.exportButtonBorderWidth, 0, 8, 1, 'px')}${rangeControl('Corner roundness', 'exportButtonRadius', editor.exportButtonRadius, 0, 32, 1, 'px')}<div class="spacing-grid"><span>Button padding</span>${['top', 'right', 'bottom', 'left'].map((side) => `<label>${side}<input type="number" min="0" max="40" data-export-button-padding="${side}" value="${editor.exportButtonPadding[side]}"></label>`).join('')}</div><p class="panel-intro">Design export typography under <strong>Text → Export button text</strong>. Each action can use its own label, icon URL, icon size, and corner.</p>${EXPORT_ACTIONS.map(([key, label]) => exportActionEditor(editor, key, label)).join('')}`,
      true,
    )}${controlSection(
      'Data tools',
      `${toggleControl('Show import button', 'importEnabled', editor.importEnabled)}<button class="apply-all-button" type="button" data-open-import ${editor.importEnabled ? '' : 'disabled'}>Import or connect data</button>${toggleControl('Show table below chart', 'visibleDataTable', editor.visibleDataTable)}${toggleControl('Table search', 'dataTableSearch', editor.dataTableSearch)}${toggleControl('Sortable columns', 'dataTableSort', editor.dataTableSort)}${rangeControl('Rows per page', 'dataTablePageSize', editor.dataTablePageSize, 5, 50, 5)}<small class="panel-intro">Upload CSV/JSON, paste rows, or load a public API. Map a category field and one or more numeric value fields.</small>`,
      true,
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
    ['content', 'Content'],
    ['chart', 'Chart'],
    ['text', 'Text'],
    ['layout', 'Layout'],
    ['interaction', 'Interact'],
  ];
  document.querySelector('#chart-controls').innerHTML =
    `<div class="control-tabs" role="tablist" aria-label="Chart settings">${tabs.map(([key, label]) => `<button type="button" role="tab" data-control-tab="${key}" aria-selected="${state.controlTab === key}" class="${state.controlTab === key ? 'is-active' : ''}">${label}</button>`).join('')}</div><div class="control-panel" role="tabpanel" data-control-panel="${state.controlTab}">${panels[state.controlTab]}</div>`;
}

function deepClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
function baseConfig(chart, compact = false) {
  const data = compact || chart !== state.selected ? null : state.importedData;
  return {
    type: chart.type,
    theme: chart.theme,
    data: data
      ? deepClone(data)
      : { labels: [...chart.labels], datasets: deepClone(chart.datasets) },
    options: {
      ...deepClone(chart.options),
      animation: false,
      responsive: true,
      showDataTable: !compact,
      showLegend: chart.options.showLegend ?? (!compact || chart.datasets.length > 1),
      showGrid: chart.options.showGrid ?? chart.family !== 'radial',
      padding: compact ? 12 : (chart.options.padding ?? 24),
      title: compact ? undefined : (chart.options.title ?? `${chart.name} example`),
      typography: {
        fontFamily: "'Space Mono', monospace",
        ...(chart.options.typography ? deepClone(chart.options.typography) : {}),
      },
    },
  };
}

function renderGallery() {
  const grid = document.querySelector('#chart-grid');
  const galleryCharts = charts.filter((chart) => !chart.showcaseOnly);
  grid.innerHTML = galleryCharts
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

  galleryCharts.forEach((chart) => {
    const host = document.querySelector(`#preview-${chart.id}`);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:184px';
    host.append(canvas);
    new window.Chartix(canvas, baseConfig(chart, true));
  });
}

function renderDetailNavigation() {
  const groups = charts.reduce((result, chart) => {
    const group = chart.showcaseOnly
      ? 'Bar design presets'
      : chart.family === 'radial'
        ? 'Radial charts'
        : 'Cartesian charts';
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

function renderBarDesignTabs() {
  const switcher = document.querySelector('#bar-design-switcher');
  const tabs = document.querySelector('#bar-design-tabs');
  const visible = chartCapabilities(state.selected).barSpacing;
  switcher.hidden = !visible;
  if (!visible) {
    tabs.innerHTML = '';
    return;
  }
  tabs.innerHTML = barDesignExamples
    .map(
      (example) =>
        `<button type="button" role="tab" data-bar-design="${example.id}" aria-selected="${state.selected.id === example.id}" class="bar-design-tab ${state.selected.id === example.id ? 'is-active' : ''}"><span>${example.designLabel}</span><small>${example.designName}</small></button>`,
    )
    .join('');
}

function resetControls() {
  if (state.codeEdited) {
    state.selected = charts.find((chart) => chart.id === state.selected.id) ?? state.selected;
    state.codeEdited = false;
    state.importedData = null;
  }
  state.editor = freshEditor(state.selected);
  state.activeRole = 'title';
  state.activeTextBoxId = state.editor.textBoxes[0]?.id ?? null;
  state.controlTab = state.selected.showcaseOnly ? 'content' : 'chart';
  state.previewWidth = 0;
  state.previewHeight = 470;
  updateImportButton();
  renderControls();
  applyPreviewSize(0, 470);
  renderPlayground();
}

function resolvedEditorLayout() {
  const editor = state.editor;
  const textHeight = (value, style) => {
    const lines = String(value || '').split('\n').length;
    return (
      lines * Number(style.fontSize) * Number(style.lineHeight ?? 1.2) +
      Number(style.padding?.top ?? 0) +
      Number(style.padding?.bottom ?? 0) +
      Number(style.borderWidth ?? 0) * 2
    );
  };
  const kickerY = editor.layout.kicker.y ?? editor.padding.top;
  const titleY =
    editor.layout.title.y ??
    (editor.kicker
      ? Math.max(
          editor.padding.top + 22,
          kickerY + textHeight(editor.kicker, editor.textStyles.kicker) + 8,
        )
      : editor.padding.top);
  const subtitleY =
    editor.layout.subtitle.y ??
    titleY + textHeight(editor.title, editor.textStyles.title) + Number(editor.titleOffset);
  return {
    padding: deepClone(editor.padding),
    kicker: deepClone(editor.layout.kicker),
    title: { ...deepClone(editor.layout.title), y: titleY },
    subtitle: {
      ...deepClone(editor.layout.subtitle),
      y: subtitleY,
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
  const caps = chartCapabilities(state.selected);
  config.theme = editor.theme;
  config.options.backgroundColor = editor.background;
  config.options.canvas = {
    borderColor: editor.canvasBorderColor,
    borderWidth: Number(editor.canvasBorderWidth),
    borderRadius: Number(editor.canvasBorderRadius),
  };
  config.options.highlight = {
    type: editor.highlightType,
    color: editor.highlightColor,
    backgroundColor: editor.highlightBackground,
    borderWidth: Number(editor.highlightBorderWidth),
    borderRadius: Number(editor.highlightBorderRadius),
    opacity: Number(editor.highlightOpacity),
    glowBlur: Number(editor.highlightGlowBlur),
  };
  const targetCount = colorTargets(state.selected).length;
  while (editor.seriesColors.length < targetCount)
    editor.seriesColors.push(PALETTE[editor.seriesColors.length % PALETTE.length]);
  config.options.colors = editor.seriesColors.slice(0, targetCount);
  const textStyles = deepClone(editor.textStyles);
  const tooltipStyle = textStyles.tooltip;
  delete textStyles.tooltip;
  config.options.title = editor.title;
  config.options.subtitle = editor.subtitle;
  config.options.kicker = editor.kicker || undefined;
  config.options.source = editor.source || undefined;
  config.options.footnote = editor.footnote || undefined;
  config.options.watermark = editor.watermark || undefined;
  config.options.textBoxes = editor.textBoxes.map((box) => deepClone(box));
  config.options.typography = textStyles;
  config.options.xLabels = {
    ...config.options.xLabels,
    ...textStyles.xAxis,
    rotation: Number(editor.xAngle),
  };
  config.options.yLabels = {
    ...config.options.yLabels,
    ...textStyles.yAxis,
    rotation: Number(editor.yAngle),
  };
  config.options.dataLabels = {
    ...config.options.dataLabels,
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
    padding: deepClone(editor.legendPadding),
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
  config.options.dataTable = {
    enabled: editor.visibleDataTable,
    searchable: editor.dataTableSearch,
    sortable: editor.dataTableSort,
    pageSize: Number(editor.dataTablePageSize),
  };
  config.options.exportToolbar = {
    enabled: editor.exportToolbar,
    csv: editor.exportCSV,
    json: editor.exportJSON,
    png: editor.exportPNG,
    jpeg: editor.exportJPEG,
    copy: editor.exportCopy,
    position: editor.exportPosition,
    gap: Number(editor.exportGap),
    padding: deepClone(editor.exportPadding),
    layout: editor.exportLayout,
    display: editor.exportDisplay,
    iconSize: Number(editor.exportIconSize),
    buttonStyle: {
      backgroundColor: editor.exportButtonBackground,
      hoverBackgroundColor: editor.exportButtonHover,
      borderColor: editor.exportButtonBorder,
      borderWidth: Number(editor.exportButtonBorderWidth),
      borderRadius: Number(editor.exportButtonRadius),
      padding: deepClone(editor.exportButtonPadding),
      shadow: '0 2px 8px rgba(15,23,42,.08)',
    },
    actions: Object.fromEntries(
      EXPORT_ACTIONS.map(([key]) => {
        const action = editor.exportActions[key];
        return [
          key,
          {
            label: action.label,
            ...(action.display === 'inherit' ? {} : { display: action.display }),
            ...(action.iconUrl.trim() ? { iconUrl: action.iconUrl.trim() } : {}),
            iconSize: Number(action.iconSize),
            position: action.position,
            padding: deepClone(action.padding),
          },
        ];
      }),
    ),
  };
  config.options.editable = true;
  config.options.accessibility = {
    autoSummary: true,
    keyboardHelp: true,
    explorationMode: true,
    highContrast: editor.highContrast,
    dyslexiaFriendly: editor.dyslexia,
    automaticPatterns: editor.patterns,
  };
  if (caps.axes) {
    config.options.showGrid = editor.showHorizontalGrid || editor.showVerticalGrid;
    config.options.grid = {
      horizontal: editor.showHorizontalGrid,
      vertical: editor.showVerticalGrid,
    };
  } else {
    delete config.options.grid;
  }
  config.options.scales = {
    ...config.options.scales,
    x: {
      ...config.options.scales?.x,
      display: editor.showXAxis,
      title: editor.xTitle,
      titleOffset: editor.xAxisOffset,
      position: editor.xAxisPosition,
      line: { color: editor.xAxisColor, width: Number(editor.xAxisWidth) },
      ...(!config.options.horizontal && chartCapabilities(state.selected).barSpacing
        ? {
            categoryMode: editor.categoryMode,
            labelDensity: Number(editor.labelDensity) / 100,
            tickSkip: editor.categoryMode === 'categorical' ? 1 : 'auto',
          }
        : {}),
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
      ...(config.options.horizontal && chartCapabilities(state.selected).barSpacing
        ? {
            categoryMode: editor.categoryMode,
            labelDensity: Number(editor.labelDensity) / 100,
            tickSkip: editor.categoryMode === 'categorical' ? 1 : 'auto',
          }
        : {}),
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
  if (caps.bar) {
    config.options.barTrack = {
      enabled: editor.barTrackEnabled,
      color: editor.barTrackColor,
      ...(editor.barTrackPattern === 'none' ? {} : { pattern: editor.barTrackPattern }),
      ...(editor.barTrackPattern === 'none'
        ? {}
        : { patternPlacement: editor.barTrackPatternPlacement }),
      cornerRadius: Number(editor.barTrackRadius),
    };
  } else {
    delete config.options.barTrack;
  }
  if (chartCapabilities(state.selected).barSpacing) {
    config.options.barGapRatio = Number(editor.barGapPercent) / 100;
    config.options.barDatasetGap = Number(editor.barDatasetGap);
  } else {
    delete config.options.barGapRatio;
    delete config.options.barDatasetGap;
  }
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
  document.querySelector('.chartix-data-table')?.remove();
  host.style.height = `${state.previewHeight}px`;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  host.append(canvas);
  const config = currentConfig();
  state.playground = new window.Chartix(canvas, config);
  updateGeneratedCode(config);
}

function embedSnippet(config) {
  const clean = deepClone(config);
  const json = JSON.stringify(clean, null, 2).replace(/'/g, '&#39;');
  return `<script src="https://freber6684.github.io/Chartix/dist/chartix.min.js"></script>\n\n<div data-chartix data-config='${json}'></div>`;
}

function updateGeneratedCode(config, force = false) {
  state.lastConfig = deepClone(config);
  const editor = document.querySelector('#generated-code');
  if (force || document.activeElement !== editor) editor.value = JSON.stringify(config, null, 2);
}

function validateCodeConfiguration(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config))
    throw new Error('The configuration must be one JSON object.');
  if (typeof config.type !== 'string' || !config.type.trim())
    throw new Error('Add a valid chart "type".');
  if (!config.data || !Array.isArray(config.data.labels) || !Array.isArray(config.data.datasets))
    throw new Error('Data needs "labels" and "datasets" arrays.');
  if (!config.data.datasets.length) throw new Error('Add at least one dataset.');
  if (
    !config.data.datasets.every(
      (dataset) => dataset && typeof dataset === 'object' && Array.isArray(dataset.values),
    )
  )
    throw new Error('Every dataset needs a "values" array.');
  if (config.options !== undefined && (!config.options || typeof config.options !== 'object'))
    throw new Error('"options" must be a JSON object.');
}

function applyCodeConfiguration() {
  const codeEditor = document.querySelector('#generated-code');
  const status = document.querySelector('#copy-status');
  const previous = {
    selected: state.selected,
    importedData: state.importedData,
    editor: state.editor,
    codeEdited: state.codeEdited,
    previewWidth: state.previewWidth,
    previewHeight: state.previewHeight,
  };
  let mutated = false;
  try {
    const config = JSON.parse(codeEditor.value);
    validateCodeConfiguration(config);
    const typeTemplate = charts.find((chart) => chart.type === config.type && !chart.showcaseOnly);
    if (config.type !== state.selected.type && !typeTemplate)
      throw new Error(`Chart type "${config.type}" is not available in this playground.`);
    const selectionSource = config.type === state.selected.type ? state.selected : typeTemplate;
    state.selected = {
      ...selectionSource,
      type: config.type,
      family: typeTemplate?.family ?? selectionSource.family,
      theme: config.theme ?? selectionSource.theme,
      options: deepClone(config.options ?? {}),
      labels: [...config.data.labels],
      datasets: deepClone(config.data.datasets),
    };
    state.importedData = deepClone(config.data);
    state.editor = freshEditor(state.selected);
    state.codeEdited = true;
    mutated = true;
    state.activeRole = 'title';
    state.activeTextBoxId = state.editor.textBoxes[0]?.id ?? null;
    const nextWidth = Number(config.options?.width) || 0;
    const nextHeight = Number(config.options?.height) || state.previewHeight;
    renderDetailNavigation();
    renderBarDesignTabs();
    renderControls();
    applyPreviewSize(nextWidth, nextHeight);
    renderPlayground();
    codeEditor.setAttribute('aria-invalid', 'false');
    status.classList.remove('is-error');
    status.textContent = 'Applied. The chart and visual settings are synchronized.';
  } catch (error) {
    if (mutated) {
      state.selected = previous.selected;
      state.importedData = previous.importedData;
      state.editor = previous.editor;
      state.codeEdited = previous.codeEdited;
      renderDetailNavigation();
      renderBarDesignTabs();
      renderControls();
      applyPreviewSize(previous.previewWidth, previous.previewHeight);
      renderPlayground();
    }
    codeEditor.setAttribute('aria-invalid', 'true');
    status.classList.add('is-error');
    status.textContent = error instanceof Error ? error.message : 'The configuration is invalid.';
  }
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
  else if (key.startsWith('textBox.')) {
    const box = activeTextBox();
    if (box) box.style[key.slice('textBox.'.length)] = normalized;
  } else if (key.startsWith('seriesColors.'))
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
      <li><code>tooltip</code>, <code>highlight</code>, <code>crosshair</code>, and <code>interaction</code> configure pointer, touch, and keyboard exploration.</li>
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
  state.importedData = null;
  state.importRows = [];
  state.importFields = [];
  state.importMapping = { category: '', values: [] };
  state.codeEdited = false;
  document.body.classList.add('detail-active');
  document.querySelector('#overview-view').hidden = true;
  document.querySelector('#detail-view').hidden = false;
  document.querySelector('#detail-title').textContent = `${chart.name} chart`;
  document.querySelector('#detail-crumb').textContent = chart.name;
  document.querySelector('#detail-category').textContent = `${chart.tag} · ${chart.family}`;
  document.querySelector('#detail-summary').textContent = chart.summary;
  renderDetailNavigation();
  renderBarDesignTabs();
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
  if (tab === 'code' && state.editor) updateGeneratedCode(currentConfig(), true);
}

function updateImportButton() {
  const button = document.querySelector('#open-data-import');
  if (button) button.hidden = state.editor?.importEnabled === false;
}

function parseCSVRows(source) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index <= source.length; index += 1) {
    const character = source[index] ?? '\n';
    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(value.trim());
      value = '';
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
    } else value += character;
  }
  if (rows.length < 2) throw new Error('CSV needs a header and at least one data row.');
  const headers = rows[0].map((header, index) => header || `Field ${index + 1}`);
  return rows
    .slice(1)
    .map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])),
    );
}

function normalizeImportedRows(value) {
  const candidate = Array.isArray(value)
    ? value
    : (value?.data ?? value?.results ?? value?.items ?? value?.records);
  if (!Array.isArray(candidate) || !candidate.length)
    throw new Error('No row array was found. Use an array of objects or CSV with headers.');
  if (!candidate.every((row) => row && typeof row === 'object' && !Array.isArray(row)))
    throw new Error('Every imported row must be an object with named fields.');
  const fields = [...new Set(candidate.flatMap((row) => Object.keys(row)))];
  if (fields.length < 2) throw new Error('Import at least two fields to build a chart.');
  return candidate.map((row) =>
    Object.fromEntries(
      fields.map((field) => {
        const cell = row[field];
        return [field, cell === null || cell === undefined ? '' : cell];
      }),
    ),
  );
}

function parseImportedText(source, contentType = '') {
  const trimmed = source.trim();
  if (!trimmed) throw new Error('The data source is empty.');
  if (contentType.includes('json') || trimmed.startsWith('[') || trimmed.startsWith('{'))
    return normalizeImportedRows(JSON.parse(trimmed));
  return parseCSVRows(trimmed);
}

function fieldIsNumeric(field, rows) {
  const values = rows.map((row) => row[field]).filter((value) => value !== '');
  return (
    values.length > 0 &&
    values.filter((value) => Number.isFinite(Number(value))).length / values.length >= 0.8
  );
}

function setImportedRows(rows) {
  state.importRows = rows;
  state.importFields = Object.keys(rows[0] ?? {});
  const numeric = state.importFields.filter((field) => fieldIsNumeric(field, rows));
  const category =
    state.importFields.find((field) => !numeric.includes(field)) ?? state.importFields[0];
  state.importMapping = {
    category,
    values: numeric.filter((field) => field !== category).slice(0, 8),
  };
  if (!state.importMapping.values.length) {
    state.importMapping.values = state.importFields
      .filter((field) => field !== category)
      .slice(0, 1);
  }
  renderFieldMapper();
}

function renderFieldMapper() {
  const mapper = document.querySelector('#field-mapper');
  mapper.hidden = false;
  document.querySelector('#data-row-count').textContent =
    `${state.importRows.length} rows · ${state.importFields.length} fields`;
  document.querySelector('#category-field').innerHTML = state.importFields
    .map(
      (field) =>
        `<option value="${escapeHTML(field)}" ${field === state.importMapping.category ? 'selected' : ''}>${escapeHTML(field)}</option>`,
    )
    .join('');
  document.querySelector('#value-fields').innerHTML = state.importFields
    .filter((field) => field !== state.importMapping.category)
    .map((field) => {
      const numeric = fieldIsNumeric(field, state.importRows);
      return `<label class="field-choice"><input type="checkbox" value="${escapeHTML(field)}" ${state.importMapping.values.includes(field) ? 'checked' : ''}><span><strong>${escapeHTML(field)}</strong><small>${numeric ? 'Number · recommended' : 'Text · selectable'}</small></span></label>`;
    })
    .join('');
  const previewFields = state.importFields.slice(0, 6);
  const previewRows = state.importRows.slice(0, 5);
  document.querySelector('#data-preview-table').innerHTML =
    `<table><thead><tr>${previewFields.map((field) => `<th>${escapeHTML(field)}</th>`).join('')}</tr></thead><tbody>${previewRows.map((row) => `<tr>${previewFields.map((field) => `<td>${escapeHTML(row[field])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  document.querySelector('#data-import-status').textContent =
    'Fields are ready. Confirm the mapping below.';
  document.querySelector('#apply-data-import').disabled = !state.importMapping.values.length;
}

function openDataImport() {
  if (!state.editor.importEnabled) return;
  document.querySelector('#data-import-dialog').showModal();
}

function closeDataImport() {
  document.querySelector('#data-import-dialog').close();
}

async function readDataFile(file) {
  if (!file) return;
  const status = document.querySelector('#data-import-status');
  status.textContent = `Reading ${file.name}…`;
  try {
    setImportedRows(parseImportedText(await file.text(), file.type));
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'This file could not be read.';
  }
}

function applyImportedData() {
  const category = state.importMapping.category;
  const valueFields = state.importMapping.values;
  if (!category || !valueFields.length) return;
  state.importedData = {
    labels: state.importRows.map((row) => String(row[category] ?? '')),
    datasets: valueFields.map((field) => ({
      label: field,
      values: state.importRows.map((row) => {
        const numeric = Number(row[field]);
        return Number.isFinite(numeric) ? numeric : null;
      }),
    })),
  };
  state.editor.seriesColors = valueFields.map((_, index) => PALETTE[index % PALETTE.length]);
  state.editor.xTitle = category;
  state.editor.yTitle = valueFields.length === 1 ? valueFields[0] : 'Value';
  renderControls();
  renderPlayground();
  closeDataImport();
}

document.addEventListener('click', (event) => {
  const barDesign = event.target.closest('[data-bar-design]');
  if (barDesign) openChart(barDesign.dataset.barDesign);
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
  if (event.target.closest('[data-open-import]')) openDataImport();
  const addTextBox = event.target.closest('[data-add-text-box]');
  if (addTextBox) {
    let number = state.editor.textBoxes.length + 1;
    while (state.editor.textBoxes.some((box) => box.id === `text-box-${number}`)) number += 1;
    const box = normalizeTextBox(
      {
        id: `text-box-${number}`,
        name: `Text box ${number}`,
        text: 'New text',
        x: 8 + (((number - 1) * 4) % 28),
        y: 12 + (((number - 1) * 6) % 48),
      },
      number - 1,
      state.selected,
    );
    state.editor.textBoxes.push(box);
    state.activeTextBoxId = box.id;
    renderControls();
    rerenderFromEditor();
  }
  const selectTextBox = event.target.closest('[data-select-text-box]');
  if (selectTextBox) {
    state.activeTextBoxId = selectTextBox.dataset.selectTextBox;
    renderControls();
  }
  const deleteTextBox = event.target.closest('[data-delete-text-box]');
  if (deleteTextBox) {
    const index = state.editor.textBoxes.findIndex(
      (box) => box.id === deleteTextBox.dataset.deleteTextBox,
    );
    if (index >= 0) state.editor.textBoxes.splice(index, 1);
    state.activeTextBoxId =
      state.editor.textBoxes[Math.min(index, state.editor.textBoxes.length - 1)]?.id ?? null;
    renderControls();
    rerenderFromEditor();
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
  const textBoxToggle = event.target.closest('[data-textbox-toggle]');
  if (textBoxToggle && activeTextBox()) {
    const style = activeTextBox().style;
    const key = textBoxToggle.dataset.textboxToggle;
    if (key === 'fontWeight') style.fontWeight = style.fontWeight >= 700 ? 400 : 700;
    if (key === 'fontStyle') style.fontStyle = style.fontStyle === 'italic' ? 'normal' : 'italic';
    if (key === 'underline') style.underline = !style.underline;
    renderControls();
    rerenderFromEditor();
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
  if (target.matches('[data-textbox-setting]') && activeTextBox()) {
    const key = target.dataset.textboxSetting;
    activeTextBox()[key] =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
          ? Number(target.value)
          : target.value;
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-textbox-style]') && activeTextBox()) {
    activeTextBox().style[target.dataset.textboxStyle] = target.value;
    if (target.dataset.textboxStyle === 'fontFamily') loadFont(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-export-action][data-export-property]')) {
    state.editor.exportActions[target.dataset.exportAction][target.dataset.exportProperty] =
      target.value;
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
    else if (key.startsWith('textBox.') && activeTextBox()) {
      const property = key.slice('textBox.'.length);
      if (property === 'rotation') activeTextBox().rotation = value;
      else activeTextBox().style[property] = value;
    } else if (key.startsWith('exportAction.')) {
      const [, action, property] = key.split('.');
      state.editor.exportActions[action][property] = value;
    } else state.editor[key] = value;
    if (key === 'theme') state.editor.background = themeBackgrounds[target.value];
    if (key === 'importEnabled') updateImportButton();
    rerenderFromEditor(key === 'theme' || key === 'highlightType');
  }
});
document.querySelector('#chart-controls').addEventListener('input', (event) => {
  const target = event.target;
  if (target.matches('[data-textbox-setting]') && activeTextBox()) {
    activeTextBox()[target.dataset.textboxSetting] =
      target.type === 'checkbox'
        ? target.checked
        : target.type === 'number'
          ? Number(target.value)
          : target.value;
    const selectedItem = [...document.querySelectorAll('[data-select-text-box]')].find(
      (item) => item.dataset.selectTextBox === state.activeTextBoxId,
    );
    if (selectedItem) {
      selectedItem.querySelector('strong').textContent = activeTextBox().name;
      selectedItem.querySelector('small').textContent = activeTextBox().text || 'Empty text box';
    }
    rerenderFromEditor();
  }
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
  if (target.matches('[data-textbox-padding]') && activeTextBox()) {
    activeTextBox().style.padding[target.dataset.textboxPadding] = Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-legend-padding]')) {
    state.editor.legendPadding[target.dataset.legendPadding] = Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-export-action][data-export-padding]')) {
    state.editor.exportActions[target.dataset.exportAction].padding[target.dataset.exportPadding] =
      Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-export-padding]')) {
    state.editor.exportPadding[target.dataset.exportPadding] = Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (target.matches('[data-export-button-padding]')) {
    state.editor.exportButtonPadding[target.dataset.exportButtonPadding] = Number(target.value);
    rerenderFromEditor();
    return;
  }
  if (
    target.matches(
      'input[data-export-action][data-export-property="label"], input[data-export-action][data-export-property="iconUrl"]',
    )
  ) {
    state.editor.exportActions[target.dataset.exportAction][target.dataset.exportProperty] =
      target.value;
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
const codeEditor = document.querySelector('#generated-code');
codeEditor.addEventListener('input', () => {
  window.clearTimeout(state.codeTimer);
  const status = document.querySelector('#copy-status');
  status.classList.remove('is-error');
  status.textContent = 'Checking changes…';
  state.codeTimer = window.setTimeout(applyCodeConfiguration, 450);
});
document.querySelector('#apply-code').addEventListener('click', () => {
  window.clearTimeout(state.codeTimer);
  applyCodeConfiguration();
});
document.querySelector('#copy-code').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(embedSnippet(state.lastConfig ?? currentConfig()));
    status.classList.remove('is-error');
    status.textContent = 'Copy-paste embed copied.';
  } catch {
    status.classList.add('is-error');
    status.textContent = 'Clipboard access failed. Copy the JSON manually.';
  }
});
document.querySelectorAll('[data-export]').forEach((button) =>
  button.addEventListener('click', () => {
    state.playground?.download(button.dataset.export, `chartix-${state.selected.id}`);
    document.querySelector('#copy-status').textContent = `${button.textContent} export created.`;
  }),
);
const dataDialog = document.querySelector('#data-import-dialog');
document.querySelector('#open-data-import').addEventListener('click', openDataImport);
document.querySelector('#close-data-import').addEventListener('click', closeDataImport);
document.querySelector('#cancel-data-import').addEventListener('click', closeDataImport);
dataDialog.addEventListener('click', (event) => {
  if (event.target === dataDialog) closeDataImport();
});
document.querySelectorAll('[data-data-source]').forEach((button) =>
  button.addEventListener('click', () => {
    document
      .querySelectorAll('[data-data-source]')
      .forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
    document.querySelectorAll('[data-data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.dataPanel !== button.dataset.dataSource;
    });
  }),
);
document
  .querySelector('#data-file-input')
  .addEventListener('change', (event) => readDataFile(event.target.files?.[0]));
document.querySelector('#parse-pasted-data').addEventListener('click', () => {
  const status = document.querySelector('#data-import-status');
  try {
    setImportedRows(parseImportedText(document.querySelector('#data-paste-input').value));
  } catch (error) {
    status.textContent =
      error instanceof Error ? error.message : 'The pasted data could not be read.';
  }
});
document.querySelector('#load-api-data').addEventListener('click', async () => {
  const status = document.querySelector('#data-import-status');
  const url = document.querySelector('#data-api-input').value.trim();
  if (!url) {
    status.textContent = 'Enter a public API URL first.';
    return;
  }
  status.textContent = 'Connecting to the API…';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API returned ${response.status}.`);
    setImportedRows(
      parseImportedText(await response.text(), response.headers.get('content-type') ?? ''),
    );
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? `${error.message} Check that the endpoint is public and allows browser access.`
        : 'The API could not be loaded.';
  }
});
document.querySelector('#category-field').addEventListener('change', (event) => {
  state.importMapping.category = event.target.value;
  state.importMapping.values = state.importMapping.values.filter(
    (field) => field !== state.importMapping.category,
  );
  renderFieldMapper();
});
document.querySelector('#value-fields').addEventListener('change', () => {
  state.importMapping.values = [...document.querySelectorAll('#value-fields input:checked')].map(
    (input) => input.value,
  );
  document.querySelector('#apply-data-import').disabled = !state.importMapping.values.length;
});
document.querySelector('#apply-data-import').addEventListener('click', applyImportedData);
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
