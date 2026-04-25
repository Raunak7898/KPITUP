import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LogOut, Layout } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <Link to="/dashboard" className="flex items-center gap-2 text-[#16A34A] font-bold text-xl">
        <Layout size={24} />
        <span>AgilePM</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#166534] font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <span className="text-slate-700 font-medium">{currentUser.name}</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
};
