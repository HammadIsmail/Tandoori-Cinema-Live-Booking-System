"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsProps {
  stats: {
    totalRevenue: number;
    totalTickets: number;
    todayRevenue: number;
    todayTickets: number;
    weekRevenue: number;
    weekTickets: number;
    monthRevenue: number;
    monthTickets: number;
  };
  revenueByMovie: { title: string; revenue: number; tickets: number }[];
  revenueByFormat: { format: string; revenue: number }[];
  revenueByHall: { hall: string; revenue: number }[];
  dailyRevenue: { date: string; revenue: number; tickets: number }[];
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminAnalyticsContent({
  stats,
  revenueByMovie,
  revenueByFormat,
  revenueByHall,
  dailyRevenue,
}: AnalyticsProps) {
  return (
    <>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        Analytics Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's Revenue"
          value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
          sub={`${stats.todayTickets} tickets`}
        />
        <StatCard
          label="This Week"
          value={`Rs. ${stats.weekRevenue.toLocaleString()}`}
          sub={`${stats.weekTickets} tickets`}
        />
        <StatCard
          label="This Month"
          value={`Rs. ${stats.monthRevenue.toLocaleString()}`}
          sub={`${stats.monthTickets} tickets`}
        />
        <StatCard
          label="All Time"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          sub={`${stats.totalTickets} tickets`}
        />
      </div>

      {/* Revenue Over Time */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="font-bold text-[#1A1A1A] mb-4">Revenue (Last 30 Days)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF6A00"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue by Movie */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Revenue by Movie</h2>
          {revenueByMovie.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMovie.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#FF6A00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Revenue by Format */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-[#1A1A1A] mb-4">Revenue by Format</h2>
          {revenueByFormat.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByFormat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="format" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#FF8A3D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Hall */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="font-bold text-[#1A1A1A] mb-4">Revenue by Hall</h2>
        {revenueByHall.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByHall}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hall" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#E63946" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Best Selling Movies */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="font-bold text-[#1A1A1A] mb-4">Best-Selling Movies</h2>
        {revenueByMovie.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
        ) : (
          <div className="space-y-3">
            {revenueByMovie.map((movie, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-[#FF6A00] text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-[#1A1A1A]">
                    {movie.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {movie.tickets} tickets sold
                  </p>
                </div>
                <span className="font-bold text-sm text-[#E63946]">
                  Rs. {movie.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
