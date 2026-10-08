import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Download, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FinanceManagement() {
  const { payments, students, addPayment, deletePayment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', amount: '', mode: 'Cash', date: new Date().toISOString().split('T')[0] });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleSave = () => {
    addPayment({ ...formData, id: 'PAY' + Date.now(), receiptNo: 'REC-' + Date.now() });
    toast.success('Payment added');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this payment?')) {
      deletePayment(id);
      toast.success('Payment deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus size={20} /> Add Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Pending Fees</p>
          <p className="text-2xl font-bold text-amber-500">{formatCurrency(45000)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Today's Collection</p>
          <p className="text-2xl font-bold text-primary-600">{formatCurrency(5000)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Overdue Fees</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(12000)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3">Receipt No</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Mode</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map(payment => {
              const student = students.find(s => s.id === payment.studentId) || { name: 'Unknown' };
              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{payment.receiptNo}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">{payment.date}</td>
                  <td className="px-6 py-4">{payment.mode}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button className="text-blue-500"><Download size={18} /></button>
                    <button className="text-gray-500"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(payment.id)} className="text-red-500"><Trash2 size={18} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select className="w-full border p-2 rounded" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.enrollmentNo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" className="w-full border p-2 rounded" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select className="w-full border p-2 rounded" value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
