import { UserPlus, Search, FileCheck, CheckCircle2 } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const steps = [
  { icon: UserPlus, title: 'Заполни профиль', desc: 'Укажи сферу, город, охваты, что можешь предложить.' },
  { icon: Search, title: 'Найди партнёра', desc: 'Выбери из каталога или получи подборку.' },
  { icon: FileCheck, title: 'Зафиксируй сделку', desc: 'Опиши, кто что делает и к какому сроку.' },
  { icon: CheckCircle2, title: 'Подтверди выполнение', desc: 'Обе стороны ставят галочку, сделка закрыта.' },
];

export default function HowItWorksSection() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="how" className="py-20 sm:py-28 relative">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Как это работает</h2>
          <p className="text-neutral-400 text-lg">Четыре шага от регистрации до закрытой сделки</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`group relative bg-ink-850 border border-ink-700 rounded-2xl p-6 transition-all duration-500 hover:border-orange-500/40 hover:bg-ink-800 ${
                  visible ? 'animate-fade-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Step number */}
                <div className="absolute top-4 right-5 text-5xl font-bold text-ink-600 group-hover:text-orange-500/20 transition-colors">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Icon size={24} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-orange-500/40 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
