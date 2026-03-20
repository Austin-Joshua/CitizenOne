import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';

const PlaceholderPage = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full"
      >
        <Card elevated className="flex flex-col items-center py-16 px-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[60px] rounded-full group-hover:bg-accent-primary/10 transition-colors pointer-events-none"></div>

          <div className="w-20 h-20 rounded-[2rem] bg-surface border border-border-light flex items-center justify-center text-accent-primary mb-8 relative shadow-sm">
            <Settings2 size={32} className="animate-pulse" />
            <div className="absolute inset-0 border-2 border-accent-primary/20 border-t-accent-primary rounded-[2rem] animate-spin"></div>
          </div>
          
          <Badge variant="warning" className="mb-4">SYSTEM MODULE OFFLINE</Badge>
          
          <h1 className="text-3xl font-black text-primary mb-4 tracking-tight">
            {title}
          </h1>
          
          <p className="text-secondary font-medium leading-relaxed max-w-sm mx-auto mb-10 text-sm">
            This module is currently undergoing recalibration for the V2 Liquid Glass deployment. Secure access will be restored shortly.
          </p>

          <Button onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft size={16} className="mr-2" /> Return to Command Center
          </Button>

        </Card>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
