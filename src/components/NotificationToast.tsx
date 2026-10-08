import { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationToastProps {
  notifications: string[];
  onDismiss: (index: number) => void;
}

export default function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((_, i) =>
      setTimeout(() => onDismiss(i), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map((msg, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-ink-800 border border-orange-500/30 rounded-xl px-4 py-3 shadow-lg glass animate-slide-down glow-orange"
        >
          <Bell size={18} className="text-orange-500 mt-0.5 shrink-0" />
          <span className="text-sm text-neutral-200 flex-1">{msg}</span>
          <button onClick={() => onDismiss(i)} className="text-neutral-500 hover:text-white shrink-0">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
