import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYSTEM_LOG_MESSAGES } from '../config/gameConfig';

interface SystemLogProps {
  combo: number;
  level: number;
}

export function SystemLog({ combo }: SystemLogProps) {
  const [logs, setLogs] = useState<{ id: number; text: string }[]>([]);
  const nextId    = useRef(0);
  const lastCombo = useRef(combo);

  useEffect(() => {
    if (combo > lastCombo.current && Math.random() > 0.7) {
      const text = SYSTEM_LOG_MESSAGES[Math.floor(Math.random() * SYSTEM_LOG_MESSAGES.length)];
      const id   = nextId.current++;
      setLogs(prev => [...prev.slice(-4), { id, text }]);
    }
    lastCombo.current = combo;
  }, [combo]);

  return (
    <div className="fixed bottom-4 right-4 w-64 font-tech text-[10px] text-cyan-500/70 pointer-events-none flex flex-col items-end space-y-1">
      <AnimatePresence>
        {logs.map(log => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="bg-black/50 px-2 py-1 border-r-2 border-cyan-500"
          >
            {`>> ${log.text}`}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
