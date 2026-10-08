import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Bell, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reminders() {
  const { reminders, addReminder, updateReminder, deleteReminder } = useApp();
  const [showModal, setShowModal] = useState(false);

  const handleComplete = (id) => {
    updateReminder(id, { status: 'completed' });
    toast.success('Marked as completed');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete reminder?')) {
      deleteReminder(id);
      toast.success('Reminder deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus size={20} /> Create Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Reminders</h2>
          {(reminders || []).filter(r => r.status !== 'completed').map(rem => (
            <div key={rem.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-amber-500 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{rem.title}</h3>
                <p className="text-sm text-gray-600">Due: {rem.dueDate}</p>
                {rem.notes && <p className="text-sm text-gray-500 mt-2">{rem.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleComplete(rem.id)} className="text-emerald-600 p-1 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                <button onClick={() => handleDelete(rem.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Reminder</h2>
            <p className="text-gray-500 mb-4">Form goes here.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
