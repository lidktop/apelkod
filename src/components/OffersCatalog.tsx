import { useState, useMemo } from 'react';
import { MapPin, Users, Heart, ArrowRight, Search, TrendingUp } from 'lucide-react';
import { useApp } from '@/AppState';
import { useReveal } from '@/hooks/useReveal';
import { cities, spheres, dealTypes } from '@/mockData';
import type { BusinessCard } from '@/models';

interface CatalogProps {
  onRequireAuth: () => void;
  onOfferDeal: (offer: BusinessCard) => void;
  onCreateOffer: () => void;
}

export default function OffersCatalog({ onRequireAuth, onOfferDeal, onCreateOffer }: CatalogProps) {
  const { data } = useApp();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const [city, setCity] = useState('Все города');
  const [sphere, setSphere] = useState('Все сферы');
  const [type, setType] = useState('Все типы');
  const [selected, setSelected] = useState<BusinessCard | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    return data.offers.filter(o =>
      (city === 'Все города' || o.city === city) &&
      (sphere === 'Все сферы' || o.sphere === sphere) &&
      (type === 'Все типы' || o.type === type)
    );
  }, [data.offers, city, sphere, type]);

  const display = showAll ? filtered : filtered.slice(0, 9);

  const handleDetail = (offer: BusinessCard) => {
    if (!data.currentUser) {
      onRequireAuth();
    } else {
      setSelected(offer);
    }
  };

  const handleDeal = (offer: BusinessCard) => {
    if (!data.currentUser) {
      onRequireAuth();
    } else {
      onOfferDeal(offer);
    }
  };

  const formatAudience = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)} тыс.` : `${n}`;

  return (
    <section id="catalog" className="py-20 sm:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Каталог предложений</h2>
          <p className="text-neutral-400 text-lg">Найдите партнёра для бартера или коллаборации</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <FilterSelect icon={<MapPin size={15} />} value={city} options={cities} onChange={setCity} />
          <FilterSelect icon={<Search size={15} />} value={sphere} options={spheres} onChange={setSphere} />
          <FilterSelect icon={<TrendingUp size={15} />} value={type} options={dealTypes} onChange={setType} />
          {data.currentUser && (
            <button
              onClick={onCreateOffer}
              className="px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-all hover:scale-105 flex items-center gap-2"
            >
              Создать предложение
            </button>
          )}
        </div>

        {/* Cards grid */}
        {display.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">Ничего не найдено по выбранным фильтрам.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {display.map((offer, i) => (
              <div
                key={offer.id}
                className={`group bg-ink-850 border border-ink-700 rounded-2xl p-5 transition-all duration-500 hover:border-orange-500/40 hover:bg-ink-800 hover:shadow-xl ${
                  visible ? 'animate-fade-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${Math.min(i * 0.08, 0.5)}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg group-hover:text-orange-400 transition-colors">{offer.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
                      <MapPin size={13} />
                      {offer.city}
                      <span className="mx-1">·</span>
                      {offer.sphere}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                    offer.type === 'Бартер' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {offer.type}
                  </span>
                </div>

                <p className="text-sm text-neutral-400 leading-relaxed mb-4 line-clamp-2">{offer.description}</p>

                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4 pb-4 border-b border-ink-700">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-orange-500" />
                    Охват: {formatAudience(offer.audience)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart size={14} className="text-orange-500" />
                    Вовл.: {offer.engagement}%
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                    ★ {offer.rating}%
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDetail(offer)}
                    className="flex-1 py-2.5 text-sm font-medium text-neutral-200 bg-ink-700 rounded-lg hover:bg-ink-600 transition-colors"
                  >
                    Подробнее
                  </button>
                  <button
                    onClick={() => handleDeal(offer)}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all hover:scale-[1.02]"
                  >
                    Предложить сделку
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAll && filtered.length > 9 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink-800 text-neutral-200 font-semibold rounded-xl border border-ink-600 hover:border-orange-500/50 hover:text-orange-400 transition-all"
            >
              Смотреть все
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 glass" />
          <div
            className="relative bg-ink-850 border border-ink-600 rounded-2xl p-6 max-w-lg w-full animate-slide-down"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
                  <MapPin size={14} />
                  {selected.city} · {selected.sphere}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                selected.type === 'Бартер' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {selected.type}
              </span>
            </div>

            <p className="text-neutral-300 leading-relaxed mb-5">{selected.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <Stat label="Охват" value={formatAudience(selected.audience)} />
              <Stat label="Вовлечённость" value={`${selected.engagement}%`} />
              <Stat label="Рейтинг" value={`${selected.rating}%`} />
            </div>

            <div className="bg-ink-800 rounded-xl p-4 mb-5">
              <div className="text-sm text-neutral-400 mb-1">Сделок выполнено</div>
              <div className="text-lg font-semibold text-white">
                {selected.dealsCompleted} из {selected.dealsTotal} — {selected.rating}%
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-3 text-sm font-medium text-neutral-200 bg-ink-700 rounded-xl hover:bg-ink-600 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={() => { onOfferDeal(selected); setSelected(null); }}
                className="flex-1 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all"
              >
                Предложить сделку
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FilterSelect({ icon, value, options, onChange }: { icon: React.ReactNode; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-ink-850 border border-ink-700 rounded-lg text-sm text-neutral-200 hover:border-orange-500/40 transition-colors">
        <span className="text-neutral-500">{icon}</span>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-transparent outline-none cursor-pointer appearance-none pr-6"
        >
          {options.map(o => <option key={o} value={o} className="bg-ink-850 text-white">{o}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">▾</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-800 rounded-xl p-3 text-center">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="font-semibold text-white text-sm">{value}</div>
    </div>
  );
}
