import { Star, Quote } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';
import { reviews } from '@/mockData';

export default function ReviewsSection() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Отзывы</h2>
          <p className="text-neutral-400 text-lg">Бизнесы, которые уже попробовали АпельКод</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className={`bg-ink-850 border border-ink-700 rounded-2xl p-6 transition-all hover:border-orange-500/30 hover:bg-ink-800 ${
                visible ? 'animate-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <Quote size={28} className="text-orange-500/30 mb-3" />
              <p className="text-neutral-300 leading-relaxed mb-5 text-sm">«{review.text}»</p>
              <div className="flex items-center gap-3 pt-4 border-t border-ink-700">
                <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-500 font-semibold">
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{review.name}</div>
                  <div className="text-xs text-neutral-500">{review.business}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-orange-500 fill-orange-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
