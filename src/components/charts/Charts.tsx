import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AllocationItem } from '../../types';

const tooltipStyle = { background: 'var(--surface-elevated)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' };
const formatBRL = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

export function PortfolioAreaChart({ data, height = 250 }: { data: { month: string; value: number }[]; height?: number }) {
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
    <defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#19b887" stopOpacity={0.28} /><stop offset="95%" stopColor="#19b887" stopOpacity={0.01} /></linearGradient></defs>
    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 5" vertical={false} />
    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={8} />
    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} width={34} />
    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatBRL(Number(value)), 'Patrimônio']} />
    <Area type="monotone" dataKey="value" stroke="#19b887" strokeWidth={2.5} fill="url(#portfolioFill)" activeDot={{ r: 5, strokeWidth: 0 }} />
  </AreaChart></ResponsiveContainer>;
}

export function AllocationDonut({ data, height = 220 }: { data: AllocationItem[]; height?: number }) {
  return <div className="donut-wrap"><ResponsiveContainer width="100%" height={height}><PieChart>
    <Pie data={data} dataKey="percentage" nameKey="label" innerRadius="62%" outerRadius="86%" paddingAngle={3} stroke="none">
      {data.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
    </Pie>
    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Alocação']} />
  </PieChart></ResponsiveContainer><div className="donut-center"><strong>{data.reduce((sum, item) => sum + item.percentage, 0)}%</strong><span>alocado</span></div></div>;
}

export function DepositBarChart({ data }: { data: { month: string; deposits: number }[] }) {
  return <ResponsiveContainer width="100%" height={220}><BarChart data={data} margin={{ top: 10, right: 0, left: -18, bottom: 0 }}>
    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 5" vertical={false} />
    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} dy={8} />
    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} tickFormatter={(v) => `${v / 1000}k`} />
    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatBRL(Number(value)), 'Aportes']} />
    <Bar dataKey="deposits" fill="#35a7db" radius={[6, 6, 2, 2]} maxBarSize={34} />
  </BarChart></ResponsiveContainer>;
}

export function MiniLineChart({ data, color = '#19b887' }: { data: { label: string; value: number }[]; color?: string }) {
  return <ResponsiveContainer width="100%" height={62}><AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id={`mini-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#mini-${color.replace('#', '')})`} /></AreaChart></ResponsiveContainer>;
}
