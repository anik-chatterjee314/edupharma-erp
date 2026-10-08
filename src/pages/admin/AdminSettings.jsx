import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save, Plus, Trash2, BookOpen, Users, GraduationCap, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';

const PasswordTab = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Change Admin Password</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

const CoursesTab = () => {
  const { courses, loadAllData } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', fullName: '', duration: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/settings/courses', formData);
      toast.success('Course added successfully');
      setFormData({ name: '', fullName: '', duration: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/settings/courses/${id}`);
      toast.success('Course deleted');
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage Courses</h2>
      
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <input type="text" placeholder="Short Name (e.g. B.Pharm)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <input type="text" placeholder="Duration (e.g. 4 Years)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map(course => (
              <tr key={course.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No courses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BatchesTab = () => {
  const { batches, loadAllData } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', year: '', section: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/settings/batches', formData);
      toast.success('Batch added successfully');
      setFormData({ name: '', year: '', section: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add batch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await api.delete(`/settings/batches/${id}`);
      toast.success('Batch deleted');
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage Batches</h2>
      
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <input type="text" placeholder="Name (e.g. BATCH 2024)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <input type="text" placeholder="Year (e.g. 2024)" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <input type="text" placeholder="Section (e.g. A)" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map(batch => (
              <tr key={batch.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{batch.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{batch.section}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(batch.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No batches found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubjectsTab = () => {
  const { subjects, loadAllData } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/settings/subjects', formData);
      toast.success('Subject added successfully');
      setFormData({ name: '', code: '' });
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/settings/subjects/${id}`);
      toast.success('Subject deleted');
      loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Manage Subjects</h2>
      
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <input type="text" placeholder="Subject Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <input type="text" placeholder="Subject Code (e.g. BP101T)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Code</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No subjects found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('password');
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configurations and your account.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <nav className="flex flex-col">
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'password' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <Lock className="h-5 w-5" />
                <span className="font-medium">Password</span>
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'courses' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <GraduationCap className="h-5 w-5" />
                <span className="font-medium">Courses</span>
              </button>
              <button
                onClick={() => setActiveTab('batches')}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'batches' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Batches</span>
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === 'subjects' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Subjects</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'password' && <PasswordTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'batches' && <BatchesTab />}
          {activeTab === 'subjects' && <SubjectsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
