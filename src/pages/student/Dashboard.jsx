import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, formatPercentage, getAttendanceColor } from '../../utils/helpers';
import { 
  Calendar, CreditCard, Download, BookOpen, FileText, 
  Award, TrendingUp, Bell, CheckCircle, FileUp, AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    getStudentFeeSummary, 
    getStudentAttendanceSummary, 
    getStudentTestSummary,
    getNotificationsForStudent,
    payments,
    studyMaterials,
    documents
  } = useApp();

  const feeSummary = useMemo(() => getStudentFeeSummary(user?.id) || {}, [getStudentFeeSummary, user?.id]);
  const attendanceSummary = useMemo(() => getStudentAttendanceSummary(user?.id) || {}, [getStudentAttendanceSummary, user?.id]);
  const testSummary = useMemo(() => getStudentTestSummary(user?.id) || {}, [getStudentTestSummary, user?.id]);
  const notifications = useMemo(() => getNotificationsForStudent(user?.id)?.filter(n => !n.read) || [], [getNotificationsForStudent, user?.id]);

  const recentPayment = useMemo(() => {
    return payments.filter(p => p.studentId === user?.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [payments, user?.id]);

  const recentMaterial = useMemo(() => {
    return studyMaterials.filter(m => m.course === user?.course && m.batch === user?.batch).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
  }, [studyMaterials, user]);

  const recentDocument = useMemo(() => {
    return documents.filter(d => d.studentId === user?.id).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
  }, [documents, user?.id]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">
              Enrollment No: <span className="font-medium text-gray-900">{user.enrollmentNo}</span> | 
              Course: <span className="font-medium text-gray-900">{user.course}</span> | 
              Batch: <span className="font-medium text-gray-900">{user.batch}</span> | 
              Academic Year: <span className="font-medium text-gray-900">{user.academicYear}</span>
            </p>
          </div>
          {user.profilePhoto && (
            <img src={user.profilePhoto} alt={user.name} className="w-16 h-16 rounded-full border-2 border-primary-100 object-cover" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-gray-900">{formatPercentage(attendanceSummary.overallPercentage || 0)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getAttendanceColor(attendanceSummary.overallPercentage || 0)}`} 
                style={{ width: `${attendanceSummary.overallPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Fee Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Fees:</span>
              <span className="font-medium text-gray-900">{formatCurrency(feeSummary.totalFees || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid:</span>
              <span className="font-medium text-emerald-600">{formatCurrency(feeSummary.totalPaid || 0)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-600 font-medium">Remaining:</span>
              <span className="font-bold text-red-600">{formatCurrency(feeSummary.remainingBalance || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score:</span>
              <span className="font-bold text-gray-900">{formatPercentage(testSummary.averageScore || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tests Taken:</span>
              <span className="font-medium text-gray-900">{testSummary.testsTaken || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Rank:</span>
              <span className="font-medium text-primary-600">#{testSummary.rank || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link to="/student/attendance" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                <Calendar className="text-primary-600" size={24} />
                <span className="text-sm font-medium text-gray-700">View Attendance</span>
              </Link>
              <Link to="/student/finance" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                <CreditCard className="text-primary-600" size={24} />
                <span className="text-sm font-medium text-gray-700">View Fees</span>
              </Link>
              <Link to="/student/materials" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                <BookOpen className="text-primary-600" size={24} />
                <span className="text-sm font-medium text-gray-700">Study Material</span>
              </Link>
              <Link to="/student/tests" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                <Award className="text-primary-600" size={24} />
                <span className="text-sm font-medium text-gray-700">Report Card</span>
              </Link>
              <Link to="/student/documents" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                <FileText className="text-primary-600" size={24} />
                <span className="text-sm font-medium text-gray-700">Documents</span>
              </Link>
              {recentPayment && (
                <Link to={`/student/receipt/${recentPayment.id}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors gap-2 text-center">
                  <Download className="text-primary-600" size={24} />
                  <span className="text-sm font-medium text-gray-700">Latest Receipt</span>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentPayment && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={16} /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Successful</p>
                    <p className="text-xs text-gray-500">{formatCurrency(recentPayment.amount)} paid on {formatDate(recentPayment.date)}</p>
                  </div>
                </div>
              )}
              {recentMaterial && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-blue-100 text-blue-600 rounded-full"><BookOpen size={16} /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Study Material Added</p>
                    <p className="text-xs text-gray-500">{recentMaterial.title} - {formatDate(recentMaterial.uploadDate)}</p>
                  </div>
                </div>
              )}
              {recentDocument && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1.5 bg-purple-100 text-purple-600 rounded-full"><FileUp size={16} /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Document Uploaded</p>
                    <p className="text-xs text-gray-500">{recentDocument.name} - {recentDocument.status}</p>
                  </div>
                </div>
              )}
              {!recentPayment && !recentMaterial && !recentDocument && (
                <p className="text-sm text-gray-500 italic">No recent activity.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={20} className="text-primary-600" />
              Notifications
            </h3>
            {notifications.length > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                {notifications.length} New
              </span>
            )}
          </div>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(note => (
                <div key={note.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    {note.type === 'fee' && <CreditCard size={16} className="text-amber-500 mt-0.5" />}
                    {note.type === 'test' && <Award size={16} className="text-blue-500 mt-0.5" />}
                    {note.type === 'attendance' && <AlertTriangle size={16} className="text-red-500 mt-0.5" />}
                    {(!['fee', 'test', 'attendance'].includes(note.type)) && <Bell size={16} className="text-gray-400 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">{note.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(note.date)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No new notifications</p>
              </div>
            )}
            {notifications.length > 5 && (
              <Link to="/student/notifications" className="block text-center text-sm text-primary-600 font-medium hover:underline">
                View all notifications
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
