import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Edit, ListChecks, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestManagement() {
  const { tests, addTest, updateTest } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const handleSave = () => {
    addTest({ ...formData, id: 'TST' + Date.now(), status: 'Draft' });
    toast.success('Test created successfully');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
        <button onClick={() => { setFormData({}); setShowModal(true); }} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus size={20} /> Create Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3">Test Name</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Batch</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tests.map(test => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{test.name}</td>
                <td className="px-6 py-4">{test.subject}</td>
                <td className="px-6 py-4">{test.date}</td>
                <td className="px-6 py-4">{test.batch}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                    {test.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="text-blue-500" title="Enter Marks"><ListChecks size={18} /></button>
                  <button className="text-gray-500" title="Edit"><Edit size={18} /></button>
                  <button className="text-emerald-500" title="Publish"><CheckCircle size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Test Name</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input type="text" className="w-full border p-2 rounded" value={formData.subject || ''} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" className="w-full border p-2 rounded" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
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
