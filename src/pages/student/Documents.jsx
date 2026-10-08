import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate, getFileSizeString, searchFilter } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Filter, Eye, Download, FileText, Image, FileArchive, CheckCircle, Clock, XCircle } from 'lucide-react';

const Documents = () => {
  const { user } = useAuth();
  const { getDocumentsForStudent } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const documents = useMemo(() => getDocumentsForStudent(user?.id) || [], [getDocumentsForStudent, user?.id]);

  const filteredDocs = useMemo(() => {
    let result = documents;
    if (categoryFilter) {
      result = result.filter(d => d.category === categoryFilter);
    }
    if (searchTerm) {
      result = searchFilter(result, searchTerm, ['name', 'category', 'type']);
    }
    return result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }, [documents, searchTerm, categoryFilter]);

  const categories = [...new Set(documents.map(d => d.category))];

  const handleDownload = (docName) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleView = (docName) => {
    toast.success(`Opening ${docName} preview...`);
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (type.includes('image')) return <Image className="text-blue-500" size={20} />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="text-amber-500" size={20} />;
    return <FileText className="text-gray-500" size={20} />;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle size={12} /> Verified</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-600">View and download your uploaded documents.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-sm font-medium text-gray-600">
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.type)}
                        <span className="font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {getFileSizeString(doc.size)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(doc.name)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Download"
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
            <FileText className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
            <p className="text-gray-500">
              {searchTerm || categoryFilter ? 'Try adjusting your filters.' : 'You have not uploaded any documents yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
