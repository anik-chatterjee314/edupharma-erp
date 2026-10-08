import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate, formatPercentage } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { Award, Printer, Download, TrendingUp, CheckCircle, XCircle, FileText } from 'lucide-react';

const TestsResults = () => {
  const { user } = useAuth();
  const { getStudentTestSummary, tests, marks } = useApp();
  const [showFullReport, setShowFullReport] = useState(false);

  const testSummary = useMemo(() => getStudentTestSummary(user?.id) || {}, [getStudentTestSummary, user?.id]);
  
  // Combine tests and marks for student
  const studentTests = useMemo(() => {
    if (!user) return [];
    
    const relevantTests = tests.filter(t => t.course === user.course && t.batch === user.batch && t.status === 'Published');
    
    return relevantTests.map(test => {
      const markEntry = marks.find(m => m.testId === test.id && m.studentId === user.id);
      
      let status = 'Absent';
      let obtained = 0;
      let percentage = 0;
      
      if (markEntry) {
        obtained = markEntry.marks;
        percentage = (obtained / test.maxMarks) * 100;
        status = percentage >= 40 ? 'Pass' : 'Fail';
      }
      
      return {
        ...test,
        obtained,
        percentage,
        status,
        date: test.date
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [tests, marks, user]);

  const chartData = useMemo(() => {
    return [...studentTests].reverse().map(t => ({
      name: t.title.substring(0, 10) + '...',
      percentage: t.percentage
    }));
  }, [studentTests]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Report card downloaded successfully');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pass':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle size={12} /> Pass</span>;
      case 'Fail':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Fail</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Absent</span>;
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests & Results</h1>
          <p className="text-gray-600">Track your academic performance and test scores.</p>
        </div>
        <button 
          onClick={() => setShowFullReport(!showFullReport)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FileText size={18} />
          <span>{showFullReport ? 'Hide Report Card' : 'View Report Card'}</span>
        </button>
      </div>

      {!showFullReport ? (
        <div className="space-y-6 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:col-span-2 flex items-center gap-4">
              <div className="p-3 bg-primary-100 text-primary-600 rounded-lg">
                <Award size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(testSummary.averageScore || 0)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Best Score</p>
              <p className="text-xl font-bold text-emerald-600">{formatPercentage(testSummary.bestScore || 0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Lowest Score</p>
              <p className="text-xl font-bold text-red-600">{formatPercentage(testSummary.lowestScore || 0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Tests Taken</p>
              <p className="text-xl font-bold text-gray-900">{testSummary.testsTaken || 0} / {studentTests.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Current Rank</p>
              <p className="text-xl font-bold text-primary-600">#{testSummary.rank || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
                </div>
                
                {studentTests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                          <th className="py-3 px-4">Test Name & Subject</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4 text-center">Marks</th>
                          <th className="py-3 px-4 text-center">Score %</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {studentTests.map((test) => (
                          <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{test.title}</p>
                              <p className="text-xs text-gray-500">{test.subject}</p>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{formatDate(test.date)}</td>
                            <td className="py-3 px-4 text-center">
                              {test.status === 'Absent' ? '-' : <span className="font-medium text-gray-900">{test.obtained} <span className="text-gray-400 font-normal">/ {test.maxMarks}</span></span>}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {test.status === 'Absent' ? '-' : <span className="font-bold text-gray-900">{formatPercentage(test.percentage)}</span>}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {getStatusBadge(test.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No test results available yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-600" />
                Performance Trend
              </h3>
              {chartData.length > 1 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Score']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#0891b2" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#fff', stroke: '#0891b2', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#0891b2', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-500 text-sm text-center">
                  <TrendingUp size={32} className="text-gray-300 mb-2" />
                  <p>Not enough data to show trend.</p>
                  <p>Take more tests to see your progress.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Report Card View (Printable) */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none p-8 print:p-0">
          <div className="flex justify-end gap-3 mb-6 print:hidden">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Printer size={18} />
              <span>Print Report</span>
            </button>
          </div>

          <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              EP
            </div>
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">EDUPHARMA GROUP PHARMACY ACADEMY</h1>
            <p className="text-gray-600 mt-1">123 Education Hub, Knowledge Park, Pharmacy Avenue</p>
            
            <div className="mt-6 inline-block bg-gray-100 px-6 py-2 rounded-full border border-gray-300">
              <h2 className="text-lg font-bold text-gray-900 uppercase">Academic Report Card</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 border border-gray-300 rounded-lg p-6">
            <div className="space-y-3 text-sm">
              <div className="flex"><span className="w-32 font-bold text-gray-700">Student Name:</span> <span className="font-medium text-gray-900">{user.name}</span></div>
              <div className="flex"><span className="w-32 font-bold text-gray-700">Enrollment No:</span> <span className="font-medium text-gray-900">{user.enrollmentNo}</span></div>
              <div className="flex"><span className="w-32 font-bold text-gray-700">Course:</span> <span className="font-medium text-gray-900">{user.course}</span></div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex"><span className="w-32 font-bold text-gray-700">Academic Year:</span> <span className="font-medium text-gray-900">{user.academicYear}</span></div>
              <div className="flex"><span className="w-32 font-bold text-gray-700">Batch:</span> <span className="font-medium text-gray-900">{user.batch}</span></div>
              <div className="flex"><span className="w-32 font-bold text-gray-700">Overall Rank:</span> <span className="font-bold text-primary-700">#{testSummary.rank || '-'}</span></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm">Test Performance Details</h3>
            <table className="w-full text-left border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 w-12 text-center">Sr.</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900">Subject</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900">Test Name</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-center">Date</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-center">Max Marks</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-center">Marks Obt.</th>
                  <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {studentTests.map((test, idx) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 py-2 px-4 text-center">{idx + 1}</td>
                    <td className="border border-gray-300 py-2 px-4 font-medium">{test.subject}</td>
                    <td className="border border-gray-300 py-2 px-4">{test.title}</td>
                    <td className="border border-gray-300 py-2 px-4 text-center">{formatDate(test.date)}</td>
                    <td className="border border-gray-300 py-2 px-4 text-center">{test.maxMarks}</td>
                    <td className="border border-gray-300 py-2 px-4 text-center font-bold">{test.status === 'Absent' ? 'AB' : test.obtained}</td>
                    <td className="border border-gray-300 py-2 px-4 text-center">
                      <span className={`font-bold ${test.status === 'Pass' ? 'text-emerald-600' : test.status === 'Fail' ? 'text-red-600' : 'text-gray-500'}`}>
                        {test.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-6 mb-12">
            <div className="flex-1 border border-gray-300 rounded-lg p-6 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm border-b border-gray-300 pb-2">Overall Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Overall Percentage</p>
                  <p className="text-3xl font-bold text-gray-900">{formatPercentage(testSummary.averageScore || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Final Result</p>
                  <p className={`text-3xl font-bold ${(testSummary.averageScore || 0) >= 40 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(testSummary.averageScore || 0) >= 40 ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-1/3 border border-gray-300 rounded-lg p-6">
               <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm border-b border-gray-300 pb-2">Grading Scale</h3>
               <ul className="text-xs space-y-1.5 text-gray-600">
                 <li className="flex justify-between"><span>75% and above</span> <span>Distinction</span></li>
                 <li className="flex justify-between"><span>60% - 74%</span> <span>First Class</span></li>
                 <li className="flex justify-between"><span>50% - 59%</span> <span>Second Class</span></li>
                 <li className="flex justify-between"><span>40% - 49%</span> <span>Pass Class</span></li>
                 <li className="flex justify-between text-red-600"><span>Below 40%</span> <span>Fail</span></li>
               </ul>
            </div>
          </div>

          <div className="flex justify-between items-end pt-16 border-t border-gray-200">
            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm font-bold text-gray-900">Class Teacher</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2"></div>
              <p className="text-sm font-bold text-gray-900">Principal</p>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          .bg-white.print\\:shadow-none { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          .bg-white.print\\:shadow-none * { visibility: visible; }
        }
      `}</style>
    </div>
  );
};

export default TestsResults;
