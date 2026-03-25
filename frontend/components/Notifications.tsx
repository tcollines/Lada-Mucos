
import React from 'react';
import { Bell, Check, Clock, Trash2, MailOpen } from 'lucide-react';

interface NotificationsProps {
  data: any;
  updateData: (updater: (prev: any) => any) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ data, updateData }) => {
  const user = data.currentUser;
  const notifications = data.notifications.filter((n: any) => n.userId === user.id);

  const markAllRead = () => {
    updateData(prev => ({
      ...prev,
      notifications: prev.notifications.map((n: any) => n.userId === user.id ? { ...n, read: true } : n)
    }));
  };

  const clearAll = () => {
    updateData(prev => ({
      ...prev,
      notifications: prev.notifications.filter((n: any) => n.userId !== user.id)
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-sac-green">Notifications</h2>
          <p className="text-gray-500">Stay updated with your account activity.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllRead}
            className="p-2 text-sac-green hover:bg-emerald-50 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
          >
            <MailOpen size={18} />
            <span className="hidden sm:inline">Mark all as read</span>
          </button>
          <button 
            onClick={clearAll}
            className="p-2 text-red-400 hover:bg-red-50 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Clear all</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-6 flex gap-4 transition-all hover:bg-sac-beige/20 ${notif.read ? 'opacity-60' : 'bg-emerald-50/10'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.read ? 'bg-gray-100 text-gray-400' : 'bg-sac-green text-white shadow-lg shadow-emerald-900/10'
                }`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-sm ${notif.read ? 'text-gray-500' : 'font-bold text-gray-900'}`}>{notif.message}</p>
                    <span className="text-[10px] text-gray-400 uppercase font-bold whitespace-nowrap ml-4 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <button 
                      onClick={() => updateData(prev => ({
                        ...prev,
                        notifications: prev.notifications.map((n: any) => n.id === notif.id ? { ...n, read: true } : n)
                      }))}
                      className="text-[10px] font-bold text-sac-green uppercase hover:underline mt-2 flex items-center gap-1"
                    >
                      <Check size={12} />
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray-400">
            <Bell size={64} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">New alerts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
