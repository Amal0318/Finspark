import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';

const NotificationToast = ({ show, title, message, onClose, type = 'error' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getStyle = () => {
    return type === 'warning'
      ? {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
        }
      : {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: <ShieldAlert className="h-5 w-5 text-rose-500" />
        };
  };

  const style = getStyle();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-xl p-4 shadow-2xl backdrop-blur-md flex items-start space-x-3 select-none ${style.bg}`}
        >
          <div className="shrink-0 mt-0.5">{style.icon}</div>
          
          <div className="flex-1 min-w-0 text-xs">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider">{title}</h4>
            <p className="leading-relaxed text-gray-300">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
