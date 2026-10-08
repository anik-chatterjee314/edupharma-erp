import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/helpers';
import { Bell, IndianRupee, BookOpen, ClipboardList, Calendar, FileText, CheckCircle, Trash2, Filter } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const { getNotificationsForStudent, markNotificationRead } = useApp();
  const [filter, setFilter] = useState('all'); // all, unread

  const notifications = useMemo(() => {
    let notifs = getNotificationsForStudent(user?.id) || [];
    if (filter === 'unread') {
      notifs = notifs.filter(n => !n.read);
    }
    return notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [getNotificationsForStudent, user?.id, filter]);

  const unreadCount = useMemo(() => {
    return (getNotificationsForStudent(user?.id) || []).filter(n => !n.read).length;
  }, [getNotificationsForStudent, user?.id]);

  const getIcon = (type) => {
    switch (type) {
      case 'fee': return <IndianRupee size={20} className="text-amber-500" />;
      case 'material': return <BookOpen size={20} className="text-blue-500" />;
      case 'test': return <ClipboardList size={20} className="text-purple-500" />;
      case 'attendance': return <Calendar size={20} className="text-red-500" />;
      case 'document': return <FileText size={20} className="text-emerald-500" />;
      case 'payment': return <CheckCircle size={20} className="text-emerald-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case 'fee': return 'bg-amber-100';
      case 'material': return 'bg-blue-100';
      case 'test': return 'bg-purple-100';
      case 'attendance': return 'bg-red-100';
      case 'document': return 'bg-emerald-100';
      case 'payment': return 'bg-emerald-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest alerts and announcements.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'unread' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 transition-colors cursor-pointer hover:bg-gray-50 flex gap-4 ${!notif.read ? 'bg-primary-50/30' : ''}`}
                onClick={() => {
                  if (!notif.read) {
                    markNotificationRead(notif.id);
                  }
                }}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBackground(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(notif.date)}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-gray-800' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-600" title="Unread"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="mx-auto text-gray-300 mb-4" size={56} />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? "You're all caught up! No unread notifications." : "You don't have any notifications yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
