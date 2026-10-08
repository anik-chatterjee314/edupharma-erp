import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Search, Plus, Filter, MoreVertical, Edit, Eye, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function StudentManagement() {
  const { students, COURSES, BATCHES, ACADEMIC_YEARS, addStudent, updateStudent, deactivateStudent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenModal = (student = null) => {
    if (student) {
      setFormData(student);
      setIsEditing(true);
    } else {
      setFormData({ name: '', email: '', phone: '', course: '', batch: '', status: 'Active' });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (isEditing) {
      updateStudent(formData.id, formData);
      toast.success('Student updated');
    } else {
      addStudent({ ...formData, id: 'STU' + Date.now() });
      toast.success('Student added');
    }
    setShowModal(false);
  };

  const handleDeactivate = (id) => {
    if (window.confirm('Are you sure you want to deactivate this student?')) {
      deactivateStudent(id);
      toast.success('Student deactivated');
    }
  };

  const filteredStudents = students.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus size={20} /> Add Student
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search students..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white">
          <Filter size={20} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Course / Batch</th>
              <th className="px-6 py-3">Attendance</th>
              <th className="px-6 py-3">Fee Status</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                      {student.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-gray-500 text-xs">{student.enrollmentNo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{student.course}</p>
                  <p className="text-gray-500 text-xs">{student.batch}</p>
                </td>
                <td className="px-6 py-4">85%</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Paid</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/admin/students/${student.id}`} className="text-gray-500 hover:text-primary-600"><Eye size={18} /></Link>
                    <button onClick={() => handleOpenModal(student)} className="text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                    <button onClick={() => handleDeactivate(student.id)} className="text-gray-500 hover:text-red-600"><ShieldOff size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Student' : 'Add Student'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select className="w-full border border-gray-300 rounded-md p-2" value={formData.course || ''} onChange={e => setFormData({...formData, course: e.target.value})}>
                    <option value="">Select Course</option>
                    {COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select className="w-full border border-gray-300 rounded-md p-2" value={formData.batch || ''} onChange={e => setFormData({...formData, batch: e.target.value})}>
                    <option value="">Select Batch</option>
                    {BATCHES.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
