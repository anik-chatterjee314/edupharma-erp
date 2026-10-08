import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';
import { Check, X, Calendar as CalendarIcon, Save } from 'lucide-react';

export default function AttendanceManagement() {
  const { students, BATCHES, markAttendance } = useApp();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  const filteredStudents = students.filter(s => s.batch === selectedBatch);

  const handleLoad = () => {
    if (!selectedBatch) {
      toast.error('Please select a batch');
      return;
    }
    const data = {};
    filteredStudents.forEach(s => {
      data[s.id] = 'Present'; // default
    });
    setAttendanceData(data);
    setIsLoaded(true);
  };

  const toggleStatus = (id, status) => {
    setAttendanceData(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const data = {};
    filteredStudents.forEach(s => data[s.id] = status);
    setAttendanceData(data);
  };

  const handleSave = () => {
    // mock save
    toast.success('Attendance saved successfully!');
    setIsLoaded(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" className="w-full border border-gray-300 rounded-md p-2" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select className="w-full border border-gray-300 rounded-md p-2" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
              <option value="">Select Batch</option>
              {BATCHES.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button onClick={handleLoad} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 w-full md:w-auto">
              Load Students
            </button>
          </div>
        </div>

        {isLoaded && filteredStudents.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Mark Attendance</h3>
              <div className="flex gap-2">
                <button onClick={() => markAll('Present')} className="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded">Mark All Present</button>
                <button onClick={() => markAll('Absent')} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded">Mark All Absent</button>
              </div>
            </div>
            
            <table className="w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Enrollment No</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-gray-500">{student.enrollmentNo}</td>
                    <td className="px-4 py-3 flex justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(student.id, 'Present')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md border ${attendanceData[student.id] === 'Present' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-300'}`}
                      >
                        <Check size={16} /> Present
                      </button>
                      <button 
                        onClick={() => toggleStatus(student.id, 'Absent')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md border ${attendanceData[student.id] === 'Absent' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300'}`}
                      >
                        <X size={16} /> Absent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2">
                <Save size={20} /> Save Attendance
              </button>
            </div>
          </div>
        )}
        
        {isLoaded && filteredStudents.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No students found for this batch.
          </div>
        )}
      </div>
    </div>
  );
}
