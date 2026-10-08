import { Instagram, Gift, Radio, Package, ArrowRight } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { dealTemplates } from '@/mockData';
import { useApp } from '@/AppState';

const iconMap: Record<string, typeof Instagram> = {
  instagram: Instagram,
  gift: Gift,
  stories: Radio,
  package: Package,
};

interface DealTemplatesProps {
  onUseTemplate: (templateName: string, terms: string) => void;
}

export default function DealTemplatesSection({ onUseTemplate }: DealTemplatesProps) {
  const { data } = useApp();
  const { ref, visible } = useReveal<HTMLDivElement>();

  const handleUse = (name: string, terms: string) => {
    if (!data.currentUser) {
      onUseTemplate(name, terms);
    } else {
      onUseTemplate(name, terms);
    }
  };

  return (
    <section id="templates" className="py-20 sm:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Шаблоны сделок</h2>
          <p className="text-neutral-400 text-lg">Готовые сценарии — выберите, и условия заполнятся сами</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {dealTemplates.map((tpl, i) => {
            const Icon = iconMap[tpl.icon] ?? Instagram;
            return (
              <div
                key={tpl.id}
                className={`group bg-ink-850 border border-ink-700 rounded-2xl p-5 transition-all hover:border-orange-500/40 hover:bg-ink-800 ${
                  visible ? 'animate-fade-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <Icon size={22} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{tpl.name}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-3 line-clamp-3">{tpl.terms}</p>
                    <button
                      onClick={() => handleUse(tpl.name, tpl.terms)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Использовать шаблон
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
