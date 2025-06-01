import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageOpen, 
  CalendarClock, 
  Calendar, 
  Wrench, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import NotificationCenter from '../Notifications/NotificationCenter';
import { useNotification } from '../../contexts/NotificationContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { logout, currentUser } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isStaff = currentUser?.role === UserRole.STAFF;
  const isCustomer = currentUser?.role === UserRole.CUSTOMER;

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      allowedRoles: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER]
    },
    {
      name: 'Equipment',
      path: '/equipment',
      icon: <PackageOpen size={20} />,
      allowedRoles: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER]
    },
    {
      name: 'Rentals',
      path: '/rentals',
      icon: <CalendarClock size={20} />,
      allowedRoles: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER]
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <Calendar size={20} />,
      allowedRoles: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER]
    },
    {
      name: 'Maintenance',
      path: '/maintenance',
      icon: <Wrench size={20} />,
      allowedRoles: [UserRole.ADMIN, UserRole.STAFF]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(currentUser?.role as UserRole)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-2">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 p-2"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">ENTNT Rentals</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="p-2 text-gray-500 hover:text-gray-700 relative"
                onClick={toggleNotifications}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                  <NotificationCenter onClose={() => setNotificationsOpen(false)} />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-sm">
                <div className="font-medium text-gray-700">{currentUser?.email}</div>
                <div className="text-xs text-gray-500">{currentUser?.role}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeSidebar}
        ></div>
        
        <aside 
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-md z-30 md:static md:z-0 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center md:hidden">
            <h2 className="text-lg font-semibold text-blue-600">ENTNT Rentals</h2>
            <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <nav className="p-4 space-y-1">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeSidebar}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 md:hidden">
            <div className="flex items-center space-x-2">
              <div>
                <div className="font-medium text-gray-700">{currentUser?.email}</div>
                <div className="text-xs text-gray-500">{currentUser?.role}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;