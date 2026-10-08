import { ArrowRight, Play, TrendingUp } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface HeroProps {
  onPrimary: () => void;
  onSecondary: () => void;
}

export default function HeroSection({ onPrimary, onSecondary }: HeroProps) {
  const { ref, value } = useCountUp(2340000);

  const formatNum = (n: number) => n.toLocaleString('ru-RU');

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-800 border border-ink-600 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-neutral-300">Бартер рекламой для бизнеса</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 animate-fade-up">
            Найди партнёра для бартера.
            <br />
            <span className="text-gradient">Не будь кинутым.</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Обменивайся рекламой с другими бизнесами. Фиксируй сделку. Подтверждай выполнение. Без денег, без риска.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={onPrimary}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all hover:scale-105 glow-orange"
            >
              Найти партнёра
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSecondary}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink-800 text-neutral-200 font-semibold rounded-xl border border-ink-600 hover:border-orange-500/50 hover:text-orange-400 transition-all"
            >
              <Play size={18} />
              Как это работает
            </button>
          </div>

          {/* Counter */}
          <div className="inline-flex flex-col items-center gap-1 animate-count-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
              <TrendingUp size={16} className="text-orange-500" />
              Уже сэкономлено на рекламе:
            </div>
            <span ref={ref} className="text-3xl sm:text-4xl font-bold text-orange-500 tabular-nums">
              {formatNum(value)} ₽
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
