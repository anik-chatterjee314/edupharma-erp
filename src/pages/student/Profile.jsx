import React, { useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Calendar, Book, Lock, Upload, Key } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  if (!user) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      if (updateProfile) {
        updateProfile({ profilePhoto: objectUrl });
        toast.success('Profile photo updated successfully');
      } else {
        toast.success('Profile photo selected (mock)');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 mb-6 gap-4">
            <div className="relative">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-primary-100 text-primary-700 flex items-center justify-center text-4xl font-bold">
                  {getInitials(user.name)}
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 text-gray-600 hover:text-primary-600 transition-colors"
                title="Upload Photo"
              >
                <Upload size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-primary-600 font-medium">Enrollment: {user.enrollmentNo}</p>
            </div>
            <div className="sm:ml-auto pb-2 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                {user.status || 'Active'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <User size={20} className="text-gray-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <Lock size={14} className="text-gray-300" title="Contact administration to update" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Parent's Name</label>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{user.parentName || '-'}</p>
                      <Lock size={14} className="text-gray-300" title="Contact administration to update" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-900">{user.dob || '-'}</p>
                      <Lock size={14} className="text-gray-300" title="Contact administration to update" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Mobile Number</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-900">{user.phone || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-900">{user.email || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Address</label>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-1" />
                      <p className="font-medium text-gray-900">{user.address || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Book size={20} className="text-gray-400" />
                  Academic Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Course</label>
                    <p className="font-medium text-gray-900">{user.course}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Batch</label>
                    <p className="font-medium text-gray-900">{user.batch}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Academic Year</label>
                    <p className="font-medium text-gray-900">{user.academicYear}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Key size={20} className="text-gray-400" />
                  Digital ID Card
                </h3>
                <div className="w-full max-w-sm border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className="bg-primary-600 text-white p-3 text-center">
                    <h4 className="font-bold text-sm tracking-wide">EDUPHARMA ACADEMY</h4>
                    <p className="text-xs opacity-80">STUDENT IDENTITY CARD</p>
                  </div>
                  <div className="p-4 flex gap-4">
                    <div className="shrink-0">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt={user.name} className="w-20 h-24 object-cover border border-gray-200 rounded" />
                      ) : (
                        <div className="w-20 h-24 bg-gray-100 flex items-center justify-center border border-gray-200 rounded">
                          <User size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm space-y-1.5 flex-1">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-bold text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ID / Enrollment</p>
                        <p className="font-medium text-gray-900">{user.enrollmentNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Course</p>
                        <p className="font-medium text-gray-900 truncate" title={user.course}>{user.course}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">Valid for Academic Year {user.academicYear}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
