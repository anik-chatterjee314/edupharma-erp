import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatPercentage, getAttendanceColor } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const { getStudentAttendanceSummary } = useApp();

  const summary = useMemo(() => getStudentAttendanceSummary(user?.id) || {}, [getStudentAttendanceSummary, user?.id]);
  
  const subjects = summary.subjects || [];
  const monthlyData = summary.monthlyData || [];
  const overallPercentage = summary.overallPercentage || 0;
  const isBelowMinimum = overallPercentage < 75;

  const lowAttendanceSubjects = subjects.filter(s => s.percentage < 75);

  // Generate a mock calendar view for the current month
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      // Mock data: weekends empty, mostly present, some absent
      const isWeekend = (i % 7 === 0) || (i % 7 === 6);
      if (isWeekend) return { day: dayNumber, status: 'none' };
      // Randomly assign present/absent for past days
      if (dayNumber <= currentDate.getDate()) {
        return { day: dayNumber, status: Math.random() > 0.2 ? 'present' : 'absent' };
      }
      return { day: dayNumber, status: 'future' };
    }
    return { day: null, status: 'none' };
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Track your class attendance and subject-wise performance.</p>
      </div>

      {(isBelowMinimum || lowAttendanceSubjects.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Low Attendance Warning</h3>
            <p className="text-red-700 text-sm mt-1">
              {isBelowMinimum 
                ? `Your overall attendance (${formatPercentage(overallPercentage)}) is below the required 75% minimum.` 
                : `You have ${lowAttendanceSubjects.length} subject(s) below the required 75% minimum attendance.`}
              Please ensure regular attendance to avoid academic penalties.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Attendance</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  fill="transparent" 
                  stroke={overallPercentage >= 75 ? '#10b981' : overallPercentage >= 60 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="12" 
                  strokeDasharray={2 * Math.PI * 56} 
                  strokeDashoffset={2 * Math.PI * 56 * (1 - overallPercentage / 100)} 
                  strokeLinecap="round" 
                />
              </svg>
              <span className="absolute text-2xl font-bold text-gray-900">{formatPercentage(overallPercentage)}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-gray-500 mb-1">Total Present</p>
                <p className="text-lg font-bold text-emerald-600">{summary.totalPresent || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-gray-500 mb-1">Total Absent</p>
                <p className="text-lg font-bold text-red-600">{summary.totalAbsent || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon size={20} className="text-primary-600" />
                Current Month
              </h3>
              <span className="text-sm font-medium text-gray-600">
                {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((date, idx) => (
                <div 
                  key={idx} 
                  className={`
                    h-8 flex items-center justify-center text-sm rounded-md
                    ${!date.day ? '' : 'border border-transparent'}
                    ${date.status === 'present' ? 'bg-emerald-100 text-emerald-700 font-medium' : ''}
                    ${date.status === 'absent' ? 'bg-red-100 text-red-700 font-medium' : ''}
                    ${date.status === 'none' && date.day ? 'text-gray-400' : ''}
                    ${date.status === 'future' ? 'text-gray-400 bg-gray-50' : ''}
                    ${date.day === currentDate.getDate() ? 'border-primary-500 ring-1 ring-primary-500' : ''}
                  `}
                >
                  {date.day || ''}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-200"></div> Present</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div> Absent</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                    formatter={(value) => [`${value}%`, 'Attendance']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#0891b2" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0891b2' }}
                    activeDot={{ r: 6, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subject-wise Attendance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                    <th className="py-3 px-6">Subject</th>
                    <th className="py-3 px-6 text-center">Total Classes</th>
                    <th className="py-3 px-6 text-center">Present</th>
                    <th className="py-3 px-6 text-center">Absent</th>
                    <th className="py-3 px-6 text-right">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {subjects.map((sub, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{sub.subject}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{sub.total}</td>
                      <td className="py-4 px-6 text-center text-emerald-600 font-medium">{sub.present}</td>
                      <td className="py-4 px-6 text-center text-red-600 font-medium">{sub.absent}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`font-bold ${sub.percentage >= 75 ? 'text-emerald-600' : sub.percentage >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatPercentage(sub.percentage)}
                          </span>
                          {sub.percentage < 75 && <AlertTriangle size={16} className="text-red-500" title="Below minimum requirement" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">No subject data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
