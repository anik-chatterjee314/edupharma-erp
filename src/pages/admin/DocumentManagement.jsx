import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Plus, Download, Trash2, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentManagement() {
  const { documents, addDocument, deleteDocument } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id) => {
    if (window.confirm('Delete this document?')) {
      deleteDocument(id);
      toast.success('Document deleted');
    }
  };

  const filteredDocs = documents.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 flex items-center gap-2">
          <Plus size={20} /> Upload Document
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Search documents..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3">Document Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Upload Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 flex items-center gap-2 font-medium"><FileText size={18} className="text-blue-500" /> {doc.name}</td>
                <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{doc.category}</span></td>
                <td className="px-6 py-4 text-gray-500">{doc.size}</td>
                <td className="px-6 py-4 text-gray-500">{doc.date}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="text-blue-500"><Download size={18} /></button>
                  <button onClick={() => handleDelete(doc.id)} className="text-red-500"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            <p className="text-gray-500 mb-4">Document upload form would go here.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
