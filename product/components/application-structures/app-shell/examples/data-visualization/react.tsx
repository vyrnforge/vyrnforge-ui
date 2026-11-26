import { Link } from '@vyrnforge/react/link';
import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell, AppShellBody, AppShellHeader, AppShellMain, AppShellNavigation } from '@vyrnforge/react/app-shell';
import '@vyrnforge/web/styles/app-shell.css';
import './example.css';

type TrendDatum = {
  date: string;
  value: number | null;
  status: 'observed' | 'missing' | 'estimated';
  low?: number;
  high?: number;
};

const trend: TrendDatum[] = [
  { date: '2026-07-06', value: 71, status: 'observed' },
  { date: '2026-07-13', value: 74, status: 'observed' },
  { date: '2026-07-20', value: null, status: 'missing' },
  { date: '2026-07-27', value: 78, status: 'observed' },
  { date: '2026-08-03', value: 81, status: 'observed' },
  { date: '2026-08-10', value: 79, status: 'observed' },
  { date: '2026-08-17', value: 83, status: 'observed' },
  { date: '2026-08-24', value: 85, status: 'estimated', low: 82, high: 88 },
];

const channels = [
  { label: 'Web', value: 1248 },
  { label: 'Partner', value: 936 },
  { label: 'Retail', value: 812 },
  { label: 'Phone', value: 504 },
] as const;

const chartWidth = 720;
const chartHeight = 280;
const plotLeft = 64;
const plotRight = 28;
const plotTop = 24;
const plotBottom = 46;
const minTrend = 68;
const maxTrend = 90;

function xFor(index: number) {
  return plotLeft + index * ((chartWidth - plotLeft - plotRight) / (trend.length - 1));
}

function yFor(value: number) {
  return plotTop + (maxTrend - value) * ((chartHeight - plotTop - plotBottom) / (maxTrend - minTrend));
}

function pointString(indices: number[]) {
  return indices.map((index) => `${xFor(index)},${yFor(trend[index].value as number)}`).join(' ');
}

function App() {
  const requestedLocale = new URL(window.location.href).searchParams.get('locale');
  const locale = requestedLocale === 'de-DE' ? 'de-DE' : 'en-US';
  const number = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const percent = React.useMemo(() => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }), [locale]);
  const date = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }), [locale]);
  const maxChannel = channels[0].value;

  return (
    <AppShell data-example-locale={locale}>
      <AppShellHeader><Text as="strong" variant="label-md">Operations overview</Text></AppShellHeader>
      <AppShellBody>
        <AppShellNavigation className="viz-navigation">
          <nav aria-label="Operations overview sections">
            <Text as="strong" variant="label-md">Overview</Text>
            <ul>
              <li><Link href="#completion-trend">Completion trend</Link></li>
              <li><Link href="#channel-comparison">Channel comparison</Link></li>
            </ul>
          </nav>
        </AppShellNavigation>
        <AppShellMain>
          <div className="viz-dashboard">
            <header className="viz-dashboard-heading">
              <div>
                <Text as="h1" variant="heading-lg">Order completion overview</Text>
                <Text as="p">Decision view for completed orders and weekly completion rate.</Text>
              </div>
              <Text as="p" className="viz-freshness"><Text as="strong" variant="label-md">As of:</Text> 24 Aug 2026 · Source: example operations dataset</Text>
            </header>

            <section id="completion-trend" className="viz-panel" aria-labelledby="trend-title">
              <div className="viz-panel-heading">
                <div>
                  <Text as="h2" variant="heading-md" id="trend-title">Weekly completion rate, 6 Jul–24 Aug 2026</Text>
                  <Text as="p" id="trend-summary">Completion increased from 71% to an estimated 85%; the 20 Jul observation is missing, and the 24 Aug estimate ranges from 82% to 88%.</Text>
                </div>
                <span className="viz-unit">Percent of orders</span>
              </div>

              <svg className="viz-chart viz-trend" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-labelledby="trend-svg-title trend-svg-desc">
                <title id="trend-svg-title">Weekly completion rate trend</title>
                <desc id="trend-svg-desc">Observed completion rates rise overall. The week of 20 July is missing. The 24 August value is estimated at 85 percent with an 82 to 88 percent range. Exact values follow in the table.</desc>
                {[70, 75, 80, 85, 90].map((tick) => (
                  <g key={tick}>
                    <line className="viz-grid-line" x1={plotLeft} x2={chartWidth - plotRight} y1={yFor(tick)} y2={yFor(tick)} />
                    <text className="viz-axis-label" x={plotLeft - 12} y={yFor(tick) + 4} textAnchor="end">{tick}%</text>
                  </g>
                ))}
                <line className="viz-axis" x1={plotLeft} x2={chartWidth - plotRight} y1={chartHeight - plotBottom} y2={chartHeight - plotBottom} />
                <polyline className="viz-observed-line" data-segment="before-gap" points={pointString([0, 1])} />
                <polyline className="viz-observed-line" data-segment="after-gap" points={pointString([3, 4, 5, 6])} />
                <line className="viz-estimated-line" x1={xFor(6)} y1={yFor(83)} x2={xFor(7)} y2={yFor(85)} />
                <line className="viz-uncertainty" x1={xFor(7)} x2={xFor(7)} y1={yFor(88)} y2={yFor(82)} />
                <line className="viz-uncertainty-cap" x1={xFor(7) - 8} x2={xFor(7) + 8} y1={yFor(88)} y2={yFor(88)} />
                <line className="viz-uncertainty-cap" x1={xFor(7) - 8} x2={xFor(7) + 8} y1={yFor(82)} y2={yFor(82)} />
                {trend.map((item, index) => item.value === null ? (
                  <g key={item.date} className="viz-missing-marker" data-status="missing">
                    <line x1={xFor(index) - 7} x2={xFor(index) + 7} y1={yFor(72) - 7} y2={yFor(72) + 7} />
                    <line x1={xFor(index) - 7} x2={xFor(index) + 7} y1={yFor(72) + 7} y2={yFor(72) - 7} />
                    <text className="viz-point-label" x={xFor(index)} y={yFor(72) - 13} textAnchor="middle">Missing</text>
                  </g>
                ) : (
                  <g key={item.date} data-status={item.status}>
                    <circle className={item.status === 'estimated' ? 'viz-estimated-point' : 'viz-observed-point'} cx={xFor(index)} cy={yFor(item.value)} r="5" />
                    {item.status === 'estimated' && <text className="viz-point-label" x={xFor(index) - 8} y={yFor(item.value) - 14} textAnchor="end">Estimate 85%</text>}
                  </g>
                ))}
                {trend.map((item, index) => (
                  <text key={`${item.date}-label`} className="viz-axis-label" x={xFor(index)} y={chartHeight - 18} textAnchor="middle">{date.format(new Date(`${item.date}T00:00:00Z`))}</text>
                ))}
              </svg>

              <div className="viz-key" aria-label="Trend key">
                <span><span className="viz-key-sample viz-key-observed" aria-hidden="true" />Observed</span>
                <span><span className="viz-key-sample viz-key-estimated" aria-hidden="true" />Estimated</span>
                <span><span className="viz-key-sample viz-key-missing" aria-hidden="true">×</span>Missing observation</span>
              </div>

              <div className="viz-table-wrap" tabIndex={0} aria-label="Scrollable weekly completion rate data">
                <table>
                  <caption>Weekly completion rate data</caption>
                  <thead><tr><th scope="col">Week</th><th scope="col">Rate</th><th scope="col">Status</th><th scope="col">Range</th></tr></thead>
                  <tbody>
                    {trend.map((item) => (
                      <tr key={item.date}>
                        <th scope="row">{date.format(new Date(`${item.date}T00:00:00Z`))}</th>
                        <td>{item.value === null ? '—' : percent.format(item.value / 100)}</td>
                        <td>{item.status === 'observed' ? 'Observed' : item.status === 'missing' ? 'Missing observation' : 'Estimated'}</td>
                        <td>{item.low === undefined ? '—' : `${percent.format(item.low / 100)}–${percent.format((item.high as number) / 100)}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="channel-comparison" className="viz-panel" aria-labelledby="channel-title">
              <div className="viz-panel-heading">
                <div>
                  <Text as="h2" variant="heading-md" id="channel-title">Completed orders by channel</Text>
                  <Text as="p" id="channel-summary">Web leads with {number.format(channels[0].value)} completed orders, followed by Partner at {number.format(channels[1].value)}.</Text>
                </div>
                <span className="viz-unit">Orders</span>
              </div>

              <div className="viz-bars" role="img" aria-labelledby="channel-title channel-summary" data-scale-min="0">
                {channels.map((channel) => (
                  <div className="viz-bar-row" key={channel.label}>
                    <span className="viz-bar-label">{channel.label}</span>
                    <div className="viz-bar-track" aria-hidden="true"><span className="viz-bar" style={{ inlineSize: `${(channel.value / maxChannel) * 100}%` }} /></div>
                    <Text as="strong" variant="label-md" className="viz-bar-value">{number.format(channel.value)}</Text>
                  </div>
                ))}
                <div className="viz-zero-label" aria-hidden="true">0</div>
              </div>

              <div className="viz-table-wrap" tabIndex={0} aria-label="Scrollable completed order counts by channel">
                <table>
                  <caption>Completed order counts by channel</caption>
                  <thead><tr><th scope="col">Channel</th><th scope="col">Completed orders</th></tr></thead>
                  <tbody>{channels.map((channel) => <tr key={channel.label}><th scope="row">{channel.label}</th><td>{number.format(channel.value)}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          </div>
        </AppShellMain>
      </AppShellBody>
    </AppShell>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
