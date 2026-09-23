import { EVENTS, type WeeklyMetrics } from '@/functions/src/model';

export const labels = ['App first opens', 'Registrations', 'Clarity starts', 'Clarity completions', 'Nurture enrollments'];
const colors = ['#4B4E6D', '#7755C9', '#426D30', '#9E7013', '#A04755'];

export function LaunchMetricsChart({ rows }: { rows: WeeklyMetrics[] }) {
  const data = [...rows].sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
  if (!data.length) return <p>No weekly snapshots yet.</p>;
  const maximum = Math.max(1, ...data.flatMap(row => EVENTS.map(event => row.counts[event])));
  const x = (index: number) => data.length === 1 ? 390 : 55 + index * 670 / (data.length - 1);
  const y = (value: number) => 245 - value / maximum * 215;
  return <div>
    <svg viewBox="0 0 780 290" role="img" aria-labelledby="metrics-chart-title metrics-chart-description" className="w-full">
      <title id="metrics-chart-title">Weekly launch event counts</title>
      <desc id="metrics-chart-description">Five event series by completed week. Exact counts are in the weekly records table below.</desc>
      {[0, 0.5, 1].map(fraction => <g key={fraction}>
        <line x1="55" x2="735" y1={y(maximum * fraction)} y2={y(maximum * fraction)} stroke="#e3e2e9" />
        <text x="45" y={y(maximum * fraction) + 4} textAnchor="end" fontSize="12" fill="#555">{Math.round(maximum * fraction)}</text>
      </g>)}
      {EVENTS.map((event, index) => <g key={event}>
        <polyline points={data.map((row, i) => `${x(i)},${y(row.counts[event])}`).join(' ')} fill="none" stroke={colors[index]} strokeWidth="2" />
        {data.map((row, i) => <circle key={row.weekEnding} cx={x(i)} cy={y(row.counts[event])} r="3" fill={colors[index]}><title>{row.weekEnding}: {labels[index]} {row.counts[event]}</title></circle>)}
      </g>)}
      <text x="55" y="275" fontSize="12" fill="#555">{data[0].weekEnding}</text>
      {data.length > 1 && <text x="735" y="275" textAnchor="end" fontSize="12" fill="#555">{data[data.length - 1].weekEnding}</text>}
    </svg>
    <ul className="flex flex-wrap gap-4 text-sm" aria-label="Chart legend">{labels.map((label, i) => <li key={label}><span aria-hidden="true" style={{ color: colors[i] }}>● </span>{label}</li>)}</ul>
  </div>;
}
