import { useNotification } from '../../contexts/NotificationContext';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter = ({ onClose }: NotificationCenterProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rental':
        return <Bell className="text-blue-500\" size={16} />;
      case 'maintenance':
        return <Bell className="text-orange-500" size={16} />;
      case 'equipment':
        return <Bell className="text-green-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  return (
    <div ref={notificationRef} className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-medium text-gray-800">Notifications</h2>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center"
            >
              <CheckCheck size={12} className="mr-1" />
              Mark all as read
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <li 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div 
                  className="flex items-start cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;