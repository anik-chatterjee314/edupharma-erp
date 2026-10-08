import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { 
  Users, UserCheck, IndianRupee, Clock, TrendingDown, 
  TrendingUp, CalendarCheck, FileText, ChevronDown 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function Dashboard() {
  const { students, payments, expenses, attendance, tests, income, reminders } = useApp();
  const [dateFilter, setDateFilter] = useState('This Month');

  // KPI Calculations (Mocked/Simplified for demo)
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const feesCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingFees = students.reduce((acc, s) => acc + Math.max((s.totalFees || 0) - payments.filter(p => p.studentId === s.id).reduce((sum, p) => sum + p.amount, 0), 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = income.reduce((acc, i) => acc + i.amount, 0) + feesCollected;
  const netBalance = totalIncome - totalExpenses;
  const testsConducted = tests.length;

  const barData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const lineData = [
    { name: 'Jan', percent: 85 },
    { name: 'Feb', percent: 88 },
    { name: 'Mar', percent: 92 },
    { name: 'Apr', percent: 90 },
  ];

  const pieData = [
    { name: 'Paid', value: 400, color: '#10b981' },
    { name: 'Pending', value: 300, color: '#f59e0b' },
    { name: 'Overdue', value: 300, color: '#ef4444' }
  ];

  const areaData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          {['This Month', 'Last Month', 'This Quarter', 'This Year'].map(f => (
            <button 
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1 text-sm rounded-md border ${dateFilter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} title="Total Students" value={totalStudents} />
        <StatCard icon={<UserCheck className="text-emerald-500" />} title="Active Students" value={activeStudents} />
        <StatCard icon={<IndianRupee className="text-emerald-600" />} title="Fees Collected" value={formatCurrency(feesCollected)} />
        <StatCard icon={<Clock className="text-amber-500" />} title="Pending Fees" value={formatCurrency(pendingFees)} />
        <StatCard icon={<TrendingDown className="text-red-500" />} title="Total Expenses" value={formatCurrency(totalExpenses)} />
        <StatCard icon={<TrendingUp className="text-emerald-500" />} title="Net Balance" value={formatCurrency(netBalance)} />
        <StatCard icon={<CalendarCheck className="text-purple-500" />} title="Avg Attendance" value="89%" />
        <StatCard icon={<FileText className="text-indigo-500" />} title="Tests Conducted" value={testsConducted} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Fee Collection</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#0891b2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fee Status Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
