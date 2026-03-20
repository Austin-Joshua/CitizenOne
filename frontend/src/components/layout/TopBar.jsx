import React from 'react';
import { Search, Bell, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-[80px] px-8 flex items-center justify-between z-30 mb-8 border-b border-border-light bg-surface shadow-sm rounded-2xl mx-4 mt-4">
      
      {/* Search Bar - Global Centric */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-tertiary group-focus-within:text-accent-primary transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search citizens, benefits, routes..."
            className="w-full bg-base border border-border-light rounded-full pl-12 pr-6 py-2.5 text-sm text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <span className="text-[10px] font-black uppercase text-tertiary border border-border-light px-2 py-0.5 rounded-md bg-surface">CTRL+K</span>
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 ml-8">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-base transition-colors border border-transparent hover:border-border-light"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-base transition-colors border border-transparent hover:border-border-light relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accent-primary border-2 border-surface"></span>
        </button>

        <div className="h-6 w-px bg-border-light mx-2"></div>

        <button className="pl-2 pr-4 py-1.5 rounded-full border border-border-light hover:bg-base transition-colors flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:bg-accent-primary group-hover:text-white transition-colors">
            <User size={16} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold text-primary">{user?.name || "Admin"}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">{user?.role || "System"}</span>
          </div>
        </button>
      </div>

    </header>
  );
};

export default TopBar;
