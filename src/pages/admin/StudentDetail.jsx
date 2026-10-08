import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { User, Book, CreditCard, Calendar, FileText, ChevronLeft, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function StudentDetail() {
  const { studentId } = useParams();
  const { getStudentById, getPaymentsForStudent, getAttendanceForStudent } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const student = getStudentById(studentId) || { name: 'Unknown Student', enrollmentNo: 'N/A', course: 'N/A', batch: 'N/A', status: 'Inactive', email: '', phone: '' };
  const payments = getPaymentsForStudent(studentId) || [];
  const attendance = getAttendanceForStudent(studentId) || [];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'personal', label: 'Personal' },
    { id: 'academic', label: 'Academic' },
    { id: 'finance', label: 'Finance' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'tests', label: 'Tests' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/students" className="text-gray-500 hover:text-gray-900"><ChevronLeft size={24} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {student.name}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {student.status}
            </span>
          </h1>
          <p className="text-gray-500">{student.enrollmentNo} • {student.course} • {student.batch}</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
              <CreditCard className="text-emerald-500 mb-2" size={32} />
              <p className="text-sm text-gray-500">Fees Paid</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(payments.reduce((a,p)=>a+p.amount, 0))}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
              <Calendar className="text-blue-500 mb-2" size={32} />
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-xl font-bold text-gray-900">85%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
              <FileText className="text-purple-500 mb-2" size={32} />
              <p className="text-sm text-gray-500">Test Average</p>
              <p className="text-xl font-bold text-gray-900">78%</p>
            </div>
          </div>
        )}
        
        {activeTab === 'finance' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Receipt No</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Mode</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map((p, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2">{p.date}</td>
                    <td className="px-4 py-2">{p.receiptNo}</td>
                    <td className="px-4 py-2">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-2">{p.mode}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No payments found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Dummy content for other tabs for brevity */}
        {['personal', 'academic', 'attendance', 'tests', 'documents'].includes(activeTab) && (
          <div className="text-center py-10 text-gray-500">
            Content for {activeTab} tab goes here.
          </div>
        )}
      </div>
    </div>
  );
}
