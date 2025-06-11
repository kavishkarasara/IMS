import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  User, 
  LogOut,
  BarChart2
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'DASHBOARD', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'TRANSACTIONS', path: '/transactions', icon: <BarChart2 size={20} /> },
    { name: 'CATEGORY', path: '/categories', icon: <Tags size={20} /> },
    { name: 'PRODUCT', path: '/products', icon: <Package size={20} /> },
    { name: 'SUPPLIER', path: '/suppliers', icon: <Users size={20} /> },
    { name: 'PURCHASE', path: '/purchase', icon: <ShoppingCart size={20} /> },
    { name: 'SELL', path: '/sell', icon: <DollarSign size={20} /> },
    { name: 'PROFILE', path: '/profile', icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-cyan-900 to-teal-900 text-white">
        {/* Logo */}
        <div className="p-4 text-center border-b border-cyan-800">
          <h1 className="text-3xl font-bold text-cyan-400">IMS</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-1">
                <a
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                  className={`flex items-center px-6 py-3 hover:bg-cyan-800 transition-colors ${
                    location.pathname === item.path ? 'bg-cyan-700' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
            <li className="mb-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-6 py-3 text-red-300 hover:bg-cyan-800 transition-colors"
              >
                <span className="mr-3"><LogOut size={20} /></span>
                LOGOUT
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;