"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const COLORS = ["#fbbf24", "#34d399", "#f87171", "#60a5fa"];

type MonthlyPoint = { month: string; count: number };
type ServicePoint = { name: string; count: number };
type StatusPoint = { name: string; value: number };
type RevenuePoint = { month: string; revenue: number };

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function AnalyticsCharts({
  monthlyAppointments,
  topServices,
  statusData,
  monthlyRevenue,
}: {
  monthlyAppointments: MonthlyPoint[];
  topServices: ServicePoint[];
  statusData: StatusPoint[];
  monthlyRevenue: RevenuePoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Citas por mes">
        <BarChart data={monthlyAppointments}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" name="Citas" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Servicios más populares">
        <BarChart data={topServices} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="count" name="Reservas" fill="#34d399" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Estado de citas">
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {statusData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ChartCard>

      <ChartCard title="Ingresos mensuales">
        <LineChart data={monthlyRevenue}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            width={80}
            tickFormatter={(value) => formatPrice(value)}
          />
          <Tooltip formatter={(value) => formatPrice(Number(value))} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Ingresos"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartCard>
    </div>
  );
}
