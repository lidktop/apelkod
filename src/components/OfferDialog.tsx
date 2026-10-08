import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '@/AppState';

interface OfferDialogProps {
  onClose: () => void;
}

export default function OfferDialog({ onClose }: OfferDialogProps) {
  const { createOffer, data } = useApp();
  const [name, setName] = useState(data.currentUser?.name ?? '');
  const [city, setCity] = useState(data.currentUser?.city ?? '');
  const [sphere, setSphere] = useState(data.currentUser?.sphere ?? '');
  const [type, setType] = useState<'Бартер' | 'Коллаборация'>('Бартер');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState(data.currentUser?.audience.toString() ?? '');
  const [engagement, setEngagement] = useState('5');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !city.trim() || !sphere.trim() || !description.trim()) {
      setError('Заполните все поля.');
      return;
    }
    createOffer({
      name: name.trim(),
      city: city.trim(),
      sphere: sphere.trim(),
      type,
      description: description.trim(),
      audience: parseInt(audience) || 0,
      engagement: parseFloat(engagement) || 0,
    });
    onClose();
  };

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
          <Plus size={20} className="text-orange-500" />
          <h2 className="text-xl font-bold text-white">Создать предложение</h2>
        </div>
        <p className="text-sm text-neutral-400 mb-5">Опубликуйте своё предложение в каталоге</p>

        <div className="space-y-3">
          <FieldInput label="Название бизнеса" value={name} onChange={setName} placeholder="Кофейня «Зерно»" />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Город" value={city} onChange={setCity} placeholder="Москва" />
            <FieldInput label="Сфера" value={sphere} onChange={setSphere} placeholder="Общепит" />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Тип</label>
            <div className="flex gap-2">
              {(['Бартер', 'Коллаборация'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    type === t ? 'bg-orange-500 text-white' : 'bg-ink-800 text-neutral-300 border border-ink-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Что предлагаете для обмена?"
              className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldInput label="Охват" value={audience} onChange={setAudience} placeholder="10000" type="number" />
            <FieldInput label="Вовлечённость %" value={engagement} onChange={setEngagement} placeholder="5.0" type="number" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all hover:scale-[1.02] glow-orange"
          >
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors"
      />
    </div>
  );
}
