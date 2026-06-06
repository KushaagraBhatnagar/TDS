import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, UserCheck, Heart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-tdc-green text-white shadow-md border-b-2 border-tdc-gold sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <Heart className="h-5 w-5 sm:h-6 w-6 text-tdc-gold fill-tdc-gold group-hover:scale-110 transition-transform duration-300" />
            <span className="font-serif text-lg sm:text-2xl font-semibold tracking-wide text-tdc-beige">
              THE DATE CREW
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-widest text-tdc-gold font-sans font-medium uppercase border border-tdc-gold/40 px-2 py-0.5 rounded">
              CO-PILOT MVP
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-tdc-cream/80 hover:text-tdc-gold smooth-transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            {/* Matchmaker info */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3 border-l border-tdc-cream/20 pl-3 sm:pl-6">
                <div className="text-right hidden md:block">
                  <p className="text-xs text-tdc-cream/60 font-sans">Active Matchmaker</p>
                  <p className="text-sm text-tdc-gold font-serif italic font-semibold">{user.username}</p>
                </div>
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-tdc-gold/20 border border-tdc-gold flex items-center justify-center font-serif font-bold text-tdc-gold text-xs sm:text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-tdc-green-dark hover:bg-tdc-gold text-white hover:text-tdc-green-dark text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-tdc-gold/30 hover:border-tdc-gold smooth-transition"
                  title="Logout Session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
