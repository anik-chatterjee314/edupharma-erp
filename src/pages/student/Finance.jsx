import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate, getFeeStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { CreditCard, Download, Eye, AlertCircle, Clock, Calendar, ShieldAlert } from 'lucide-react';

const Finance = () => {
  const { user } = useAuth();
  const { getStudentFeeSummary, getPaymentsForStudent, penaltyConfig } = useApp();

  const feeSummary = useMemo(() => getStudentFeeSummary(user?.id) || {}, [getStudentFeeSummary, user?.id]);
  const payments = useMemo(() => getPaymentsForStudent(user?.id) || [], [getPaymentsForStudent, user?.id]);

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  const isOverdue = feeSummary.nextDueDate && new Date(feeSummary.nextDueDate) < new Date() && feeSummary.remainingBalance > 0;
  
  // Calculate days late
  let daysLate = 0;
  if (isOverdue) {
    const diffTime = Math.abs(new Date() - new Date(feeSummary.nextDueDate));
    daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const handleDownloadReceipt = (receiptNo) => {
    toast.success(`Downloading receipt ${receiptNo}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fee & Finance</h1>
        <p className="text-gray-600">Manage your course fees and view payment history.</p>
      </div>

      {isOverdue && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-medium">Payment Overdue</h3>
            <p className="text-red-700 text-sm mt-1">
              Your fee payment of {formatCurrency(feeSummary.remainingBalance)} was due on {formatDate(feeSummary.nextDueDate)}. 
              You are currently {daysLate} days late. Please clear your dues immediately.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Course Fees</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(feeSummary.totalFees || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(feeSummary.totalPaid || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(feeSummary.remainingBalance || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Next Due Date</p>
          <div className="flex items-center gap-2">
            <Calendar size={18} className={isOverdue ? 'text-red-500' : 'text-primary-600'} />
            <p className={`text-xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {feeSummary.nextDueDate ? formatDate(feeSummary.nextDueDate) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            </div>
            
            {sortedPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {sortedPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{payment.receiptNo}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(payment.date)}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 px-4 text-gray-600">{payment.mode}</td>
                        <td className="py-3 px-4">
                          <span dangerouslySetInnerHTML={{ __html: getFeeStatusBadge(payment.status) }} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/student/receipt/${payment.id}`}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="View Receipt"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              onClick={() => handleDownloadReceipt(payment.receiptNo)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Download Receipt"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No payments yet</h3>
                <p className="text-gray-500">Your payment history will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {isOverdue && feeSummary.penalty > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
                <ShieldAlert className="text-red-600" size={20} />
                <h3 className="font-semibold text-red-800">Penalty Details</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days Late:</span>
                  <span className="font-medium text-gray-900">{daysLate} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Penalty Rule:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(penaltyConfig.amount)} / {penaltyConfig.type}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between">
                  <span className="font-medium text-gray-900">Calculated Penalty:</span>
                  <span className="font-bold text-red-600">{formatCurrency(feeSummary.penalty)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between bg-gray-50 -mx-4 -mb-4 p-4 mt-2">
                  <span className="font-bold text-gray-900">Total Payable:</span>
                  <span className="font-bold text-gray-900 text-lg">{formatCurrency(feeSummary.remainingBalance + feeSummary.penalty)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              Late Payment Policy
            </h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                Fees must be paid on or before the due date to avoid late payment penalties.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900 mb-1">Current Penalty Rule:</p>
                <p>{formatCurrency(penaltyConfig?.amount || 0)} per {penaltyConfig?.type === 'day' ? 'day' : 'week'} after grace period.</p>
                {penaltyConfig?.gracePeriodDays > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Grace period: {penaltyConfig.gracePeriodDays} days</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Please contact the administration office if you face any issues with fee payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
