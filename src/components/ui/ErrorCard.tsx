import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  message?: string;
  onRetry?: () => void;
  theme: 'dark' | 'light';
}

export default function ErrorCard({ message = 'Failed to load weather data', onRetry, theme }: Props) {
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl p-8 text-center ${isDark ? 'glass' : 'glass-light'}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={24} className="text-rose-400" />
      </div>
      <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Something went wrong</p>
      <p className={`text-sm opacity-60 mb-5 ${isDark ? 'text-white' : 'text-black'}`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all mx-auto"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </motion.div>
  );
}
