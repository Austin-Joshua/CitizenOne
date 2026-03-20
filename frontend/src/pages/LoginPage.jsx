import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, Card, Badge } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Slight artificial delay for the sleek V2 animation
    setTimeout(async () => {
      try {
        await login(email || 'admin@citizenone.gov', password || 'adminpassword');
        navigate('/app/dashboard');
      } catch (error) {
        alert(error.message);
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-6 py-12 relative overflow-hidden">
      
      {/* V2 Enhanced Background Blur Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-primary/10 blur-[150px] rounded-full animate-pulse -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-secondary/15 blur-[120px] rounded-full animate-pulse -z-10 mix-blend-screen" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative"
      >
        {/* Theme Toggle Utility */}
        <div className="absolute -top-16 right-0">
          <button 
            onClick={toggleTheme}
            className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-secondary hover:text-primary transition-all shadow-md group"
          >
            {theme === 'dark' ? <Sun size={20} className="group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform" />}
          </button>
        </div>

        {/* Branding & Welcome */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 glass-elevated rounded-[2rem] flex items-center justify-center mb-6 relative group border border-accent-primary/20">
            <div className="absolute inset-0 bg-accent-primary/20 rounded-[2rem] blur-md group-hover:bg-accent-primary/40 transition-colors"></div>
            <span className="text-primary font-black text-4xl tracking-tighter relative z-10">C1</span>
          </div>
          <Badge variant="primary" className="mb-4">SYSTEM AUTH</Badge>
          <h1 className="text-4xl font-black text-primary tracking-tight mb-3">
            Citizen One
          </h1>
          <p className="text-secondary font-medium text-base">
            Intelligent Infrastructure & Governance Node
          </p>
        </div>

        {/* Main Glass Form Container */}
        <Card elevated className="p-10 md:p-14">
          <form className="space-y-8" onSubmit={handleLogin}>
            
            <Input 
              label="Citizen Email"
              type="email"
              icon={<Mail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@citizenone.gov"
              required
            />

            <Input 
              label="Secure Access Key"
              type="password"
              icon={<Lock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border border-border-light bg-surface/50 text-accent-primary focus:ring-accent-primary/40 focus:ring-2 appearance-none checked:bg-accent-primary checked:border-transparent transition-all" 
                />
                <span className="font-bold text-secondary group-hover:text-primary transition-colors">Remember device</span>
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-6 text-sm mt-4 overflow-hidden relative"
            >
              <div className="relative z-10 flex items-center">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Connection
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </form>
        </Card>

        {/* Security Indicator */}
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full glass-panel text-[11px] font-bold text-secondary uppercase tracking-widest border-emerald-500/20 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            End-to-End Encryption Active
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
