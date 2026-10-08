import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Printer, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Student');
  
  const tabs = ['Student', 'Attendance', 'Fee', 'Test', 'Finance'];

  const handlePrint = () => window.print();
  const handleExport = () => toast.success('Report exported to Excel');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50">
            <Download size={18} /> Export
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2 hover:bg-primary-700">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab} Report
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
        <div className="flex gap-4 mb-6 items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <Filter size={20} className="text-gray-400" />
          <select className="border border-gray-300 rounded p-2 text-sm bg-white">
            <option>All Batches</option>
          </select>
          <select className="border border-gray-300 rounded p-2 text-sm bg-white">
            <option>All Courses</option>
          </select>
          <input type="date" className="border border-gray-300 rounded p-2 text-sm bg-white" />
        </div>
        
        <div className="text-center text-gray-500 py-20">
          <p>Displaying {activeTab} Report Data</p>
          <p className="text-sm mt-2">Data table would render here based on selected filters.</p>
        </div>
      </div>
    </div>
  );
}
