import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate, getFileSizeString, searchFilter } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Search, Filter, BookOpen, Download, FileText, FileVideo, FileArchive, Eye, X } from 'lucide-react';

const StudyMaterial = () => {
  const { user } = useAuth();
  const { studyMaterials, SUBJECTS } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // Filter materials for student's course and batch
  const myMaterials = useMemo(() => {
    if (!user) return [];
    return studyMaterials.filter(m => m.course === user.course && m.batch === user.batch);
  }, [studyMaterials, user]);

  const filteredMaterials = useMemo(() => {
    let result = myMaterials;
    if (subjectFilter) {
      result = result.filter(m => m.subject === subjectFilter);
    }
    if (categoryFilter) {
      result = result.filter(m => m.category === categoryFilter);
    }
    if (searchTerm) {
      result = searchFilter(result, searchTerm, ['title', 'subject', 'topic', 'category']);
    }
    return result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }, [myMaterials, searchTerm, subjectFilter, categoryFilter]);

  const categories = [...new Set(myMaterials.map(m => m.category))];

  const handleDownload = (material) => {
    toast.success(`Downloading ${material.title}...`);
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    if (type.includes('video')) return <FileVideo className="text-purple-500" size={24} />;
    if (type.includes('zip')) return <FileArchive className="text-amber-500" size={24} />;
    return <FileText className="text-blue-500" size={24} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-gray-600">Access notes, presentations, and resources for your course.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, subject, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 hidden sm:block" size={20} />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
              >
                <option value="">All Subjects</option>
                {SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
            >
              <option value="">All Types</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                      {material.subject}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                      {material.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-1">Topic: {material.topic}</p>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      {getFileIcon(material.fileType)}
                      <span>{getFileSizeString(material.size)}</span>
                    </div>
                    <span className="ml-auto">{formatDate(material.uploadDate)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => setPreviewMaterial(material)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(material)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={56} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study materials found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchTerm || subjectFilter || categoryFilter 
                ? 'Try adjusting your filters or search terms.' 
                : 'No study materials have been uploaded for your course yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{previewMaterial.title}</h3>
              <button 
                onClick={() => setPreviewMaterial(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 p-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
                <div className="mb-6 flex justify-center">
                  {getFileIcon(previewMaterial.fileType)}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{previewMaterial.title}</h4>
                <div className="space-y-2 text-sm text-gray-600 mb-8">
                  <p><span className="font-medium">Subject:</span> {previewMaterial.subject}</p>
                  <p><span className="font-medium">Topic:</span> {previewMaterial.topic}</p>
                  <p><span className="font-medium">Type:</span> {previewMaterial.category}</p>
                  <p><span className="font-medium">Size:</span> {getFileSizeString(previewMaterial.size)}</p>
                </div>
                
                <button
                  onClick={() => {
                    handleDownload(previewMaterial);
                    setPreviewMaterial(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Download size={18} /> Download to View
                </button>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Preview in browser is simulated for this demo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;
