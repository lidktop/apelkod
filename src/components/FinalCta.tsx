import { ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

interface CTAProps {
  onRegister: () => void;
}

export default function FinalCta({ onRegister }: CTAProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="py-20 sm:py-28">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative bg-gradient-to-br from-ink-850 to-ink-900 border border-ink-700 rounded-3xl p-10 sm:p-14 text-center overflow-hidden transition-all ${
          visible ? 'animate-fade-up' : 'opacity-0'
        }`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

          <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">Готов найти партнёра?</h2>
          <p className="relative text-neutral-400 text-lg mb-8">Присоединяйся к АпельКод и начни обмениваться рекламой безопасно.</p>

          <button
            onClick={onRegister}
            className="relative inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all hover:scale-105 glow-orange text-lg"
          >
            Зарегистрироваться
            <ArrowRight size={20} />
          </button>

          <p className="relative text-sm text-neutral-500 mt-4">Бесплатно. Без комиссий.</p>
        </div>
      </div>
    </section>
  );
}
