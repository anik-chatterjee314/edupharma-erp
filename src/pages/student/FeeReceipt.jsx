import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Printer, Download, ArrowLeft } from 'lucide-react';

const FeeReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { payments, getStudentFeeSummary } = useApp();

  const payment = useMemo(() => payments.find(p => p.id === id && p.studentId === user?.id), [payments, id, user?.id]);
  const feeSummary = useMemo(() => getStudentFeeSummary(user?.id) || {}, [getStudentFeeSummary, user?.id]);

  if (!payment || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Receipt Not Found</h2>
        <button onClick={() => navigate('/student/finance')} className="mt-4 text-primary-600 hover:underline">
          Return to Finance
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Receipt downloaded successfully');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate('/student/finance')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Finance</span>
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none p-8 print:p-0">
        <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
          <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            EP
          </div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">EDUPHARMA GROUP PHARMACY ACADEMY</h1>
          <p className="text-gray-600 mt-1">123 Education Hub, Knowledge Park, Pharmacy Avenue, City - 123456</p>
          <p className="text-gray-600">Phone: +91 9876543210 | Email: info@edupharma.edu</p>
          
          <div className="mt-6 inline-block bg-gray-100 px-6 py-2 rounded-full border border-gray-300">
            <h2 className="text-lg font-bold text-gray-900 uppercase">Fee Receipt</h2>
          </div>
        </div>

        <div className="flex justify-between mb-8 text-sm">
          <div>
            <p className="text-gray-600">Receipt No: <span className="font-bold text-gray-900">{payment.receiptNo}</span></p>
            <p className="text-gray-600 mt-1">Date: <span className="font-bold text-gray-900">{formatDate(payment.date)}</span></p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Payment Mode: <span className="font-bold text-gray-900">{payment.mode}</span></p>
            <p className="text-gray-600 mt-1">Status: <span className="font-bold text-emerald-600">{payment.status.toUpperCase()}</span></p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Student Details</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-500">Student Name</p>
              <p className="font-bold text-gray-900">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Enrollment Number</p>
              <p className="font-bold text-gray-900">{user.enrollmentNo}</p>
            </div>
            <div>
              <p className="text-gray-500">Course / Batch</p>
              <p className="font-bold text-gray-900">{user.course} / {user.batch}</p>
            </div>
            <div>
              <p className="text-gray-500">Academic Year</p>
              <p className="font-bold text-gray-900">{user.academicYear}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900">Description</th>
                <th className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-right w-48">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 py-4 px-4 text-gray-800">
                  Course Fee Installment Payment
                  {payment.remarks && <p className="text-sm text-gray-500 mt-1">{payment.remarks}</p>}
                </td>
                <td className="border border-gray-300 py-4 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(payment.amount)}
                </td>
              </tr>
              {payment.penaltyPaid > 0 && (
                <tr>
                  <td className="border border-gray-300 py-3 px-4 text-gray-800">Late Payment Penalty</td>
                  <td className="border border-gray-300 py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(payment.penaltyPaid)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 py-3 px-4 font-bold text-gray-900 text-right">Total Paid Amount</td>
                <td className="border border-gray-300 py-3 px-4 text-right font-bold text-gray-900 text-lg">
                  {formatCurrency(payment.amount + (payment.penaltyPaid || 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-sm text-gray-600 mb-12">
          <p><span className="font-medium text-gray-900">Total Course Fee:</span> {formatCurrency(feeSummary.totalFees)}</p>
          <p className="mt-1"><span className="font-medium text-gray-900">Remaining Balance:</span> {formatCurrency(feeSummary.remainingBalance)}</p>
        </div>

        <div className="flex justify-between items-end pt-12 border-t border-gray-200">
          <div className="text-sm text-gray-500 italic">
            * This is a computer-generated receipt and does not require a physical signature.
          </div>
          <div className="text-center">
            <div className="border-b border-gray-400 w-48 mb-2"></div>
            <p className="text-sm font-bold text-gray-900">Authorized Signatory</p>
            <p className="text-xs text-gray-500">EduPharma Academy</p>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-white.print\\:shadow-none {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .bg-white.print\\:shadow-none * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default FeeReceipt;
