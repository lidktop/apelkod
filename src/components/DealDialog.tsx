import { useState } from 'react';
import { X, FileCheck, Clock, CheckSquare } from 'lucide-react';
import { useApp } from '@/AppState';
import type { BusinessCard } from '@/models';

interface DealDialogProps {
  offer: BusinessCard;
  templateName?: string;
  templateTerms?: string;
  onClose: () => void;
}

export default function DealDialog({ offer, templateName, templateTerms, onClose }: DealDialogProps) {
  const { createDeal, data } = useApp();
  const [type, setType] = useState(templateName ?? offer.type);
  const [description, setDescription] = useState(templateTerms ?? `Обмен рекламой с «${offer.name}». Условия: взаимные посты с упоминанием.`);
  const [days, setDays] = useState('5');
  const [submitted, setSubmitted] = useState(false);

  const quotaLeft = data.currentUser ? data.currentUser.weeklyQuota - data.currentUser.weeklyUsed : 0;

  const handleSubmit = () => {
    if (quotaLeft <= 0) return;
    createDeal(offer, type, description + ` Срок: ${days} ${parseInt(days) === 1 ? 'день' : parseInt(days) < 5 ? 'дня' : 'дней'}.`);
    setSubmitted(true);
    setTimeout(() => onClose(), 1800);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="absolute inset-0 bg-black/70 glass" />
        <div className="relative bg-ink-850 border border-orange-500/40 rounded-2xl p-8 max-w-md w-full text-center animate-slide-down glow-orange">
          <div className="w-16 h-16 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto mb-4 animate-pulse-ring">
            <CheckSquare size={32} className="text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Сделка зафиксирована!</h3>
          <p className="text-neutral-400 text-sm">Обе стороны подтвердили. Открылся чат с партнёром.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-ink-850 border border-ink-600 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <FileCheck size={20} className="text-orange-500" />
          <h2 className="text-xl font-bold text-white">Предложить сделку</h2>
        </div>
        <p className="text-sm text-neutral-400 mb-5">
          Партнёр: <span className="text-orange-400 font-medium">{offer.name}</span> · {offer.city}
        </p>

        {quotaLeft <= 0 ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
            Вы использовали все предложения на этой неделе (квота: {data.currentUser?.weeklyQuota}).
            Расширьте квоту за дольки в личном кабинете.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-ink-800 rounded-lg p-3 text-xs text-neutral-400">
              Осталось предложений на этой неделе: <span className="text-orange-400 font-semibold">{quotaLeft}</span> из {data.currentUser?.weeklyQuota}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Тип сделки</label>
              <div className="flex gap-2">
                {['Бартер', 'Коллаборация'].map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      type === t ? 'bg-orange-500 text-white' : 'bg-ink-800 text-neutral-300 border border-ink-700 hover:border-orange-500/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Условия сделки</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Опишите, кто что делает и что считается выполнением..."
                className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Срок выполнения (дней)</label>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-neutral-500" />
                <input
                  type="number"
                  value={days}
                  onChange={e => setDays(e.target.value)}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="bg-ink-800 rounded-lg p-3 text-xs text-neutral-400 flex items-start gap-2">
              <CheckSquare size={15} className="text-orange-500 mt-0.5 shrink-0" />
              <span>Сделка не закроется, пока обе стороны не нажмут «Выполнено». Партнёр подтверждает автоматически.</span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all hover:scale-[1.02] glow-orange"
            >
              Зафиксировать сделку
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
