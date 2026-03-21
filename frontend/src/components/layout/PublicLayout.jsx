import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base text-primary">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...fade} className="min-h-screen">
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
