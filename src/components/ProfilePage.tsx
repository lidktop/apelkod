import { useState } from 'react';
import {
  ArrowLeft, Star, Coins, TrendingUp, Calendar, CheckCircle2, Clock,
  AlertTriangle, Download, Link as LinkIcon, Award, Target, FileText, Copy
} from 'lucide-react';
import { useApp } from '@/AppState';

interface ProfilePageProps {
  onBack: () => void;
  onOpenCalendar: () => void;
}

export default function ProfilePage({ onBack, onOpenCalendar }: ProfilePageProps) {
  const { data } = useApp();
  const user = data.currentUser;
  const [copied, setCopied] = useState(false);
  const [expandedQuota, setExpandedQuota] = useState(false);

  if (!user) return null;

  const myDeals = data.deals.filter(d => d.businessA === user.name || d.businessB === user.name);
  const rating = user.dealsTotal > 0 ? Math.round((user.dealsCompleted / user.dealsTotal) * 100) : 100;
  const quotaLeft = user.weeklyQuota - user.weeklyUsed;

  const today = new Date();
  const sortedDeals = [...myDeals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/#/profile/${user.id}`;
    navigator.clipboard?.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpandQuota = () => {
    if (user.dolki >= 10) {
      setExpandedQuota(true);
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button onClick={onBack} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} />
          На главную
        </button>

        {/* Profile header */}
        <div className="bg-ink-850 border border-ink-700 rounded-2xl p-6 mb-5">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center text-2xl font-bold text-orange-500 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-neutral-400 text-sm mt-1">{user.city} · {user.sphere}</p>
              {user.description && <p className="text-neutral-500 text-sm mt-2">{user.description}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatCard icon={<Star size={18} />} label="Рейтинг доверия" value={`${rating}%`} sub={`${user.dealsCompleted} из ${user.dealsTotal} сделок`} accent="orange" />
            <StatCard icon={<Coins size={18} />} label="Баланс долек" value={`${user.dolki}`} sub="дольки" accent="orange" />
            <StatCard icon={<Target size={18} />} label="Квота предложений" value={`${quotaLeft}/${user.weeklyQuota}`} sub="в неделю" />
            <StatCard icon={<TrendingUp size={18} />} label="Охват" value={user.audience >= 1000 ? `${(user.audience / 1000).toFixed(1)} тыс.` : `${user.audience}`} sub="подписчиков" />
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Calendar & Deals */}
          <div className="space-y-5">
            {/* Calendar summary → link to full calendar */}
            <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-orange-500" />
                <h2 className="font-bold text-white">Календарь дедлайнов</h2>
              </div>

              {myDeals.length === 0 ? (
                <p className="text-sm text-neutral-500 py-4 text-center">Нет активных сделок.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1 text-orange-400"><Clock size={12} /> Активные: {myDeals.filter(d => d.status !== 'completed' && d.status !== 'overdue').length}</span>
                    <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12} /> Завершены: {myDeals.filter(d => d.status === 'completed').length}</span>
                    <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={12} /> Просрочены: {myDeals.filter(d => d.status === 'overdue' || (d.status !== 'completed' && new Date(d.deadline) < today)).length}</span>
                  </div>
                  <div className="bg-ink-800 rounded-xl p-3">
                    <div className="text-xs text-neutral-400 mb-1">Ближайший дедлайн</div>
                    {(() => {
                      const upcoming = sortedDeals.find(d => d.status !== 'completed' && new Date(d.deadline) >= today);
                      if (!upcoming) return <span className="text-sm text-neutral-500">Нет активных дедлайнов</span>;
                      const partner = upcoming.businessA === user.name ? upcoming.businessB : upcoming.businessA;
                      const dl = new Date(upcoming.deadline);
                      const days = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div>
                          <div className="text-sm text-white font-medium">{partner}</div>
                          <div className="text-xs text-orange-400 mt-0.5">{dl.toLocaleDateString('ru-RU')} — {days === 0 ? 'сегодня' : days === 1 ? 'завтра' : `через ${days} ${days < 5 ? 'дня' : 'дней'}`}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <button
                onClick={onOpenCalendar}
                className="w-full py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all"
              >
                Открыть календарь сделок
              </button>
            </div>

            {/* Dольки & Quota */}
            <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} className="text-orange-500" />
                <h2 className="font-bold text-white">Дольки и квота</h2>
              </div>

              <div className="bg-ink-800 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins size={20} className="text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">{user.dolki}</span>
                    <span className="text-sm text-neutral-400">дольки</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Дольки начисляются за выполненные сделки. Можно обменять на бонусы.
                </p>
              </div>

              <div className="space-y-2">
                <BonusItem
                  icon={<Target size={16} />}
                  title="Расширение квоты: 3 → 5 предложений"
                  cost="10 долек"
                  available={user.dolki >= 10 && !expandedQuota}
                  actionLabel={expandedQuota ? 'Активировано' : 'Обменять'}
                  onAction={handleExpandQuota}
                  done={expandedQuota}
                />
                <BonusItem
                  icon={<TrendingUp size={16} />}
                  title="Поднятие профиля в каталоге"
                  cost="5 долек"
                  available={user.dolki >= 5}
                  actionLabel="Обменять"
                  onAction={() => {}}
                />
                <BonusItem
                  icon={<FileText size={16} />}
                  title="Дополнительные шаблоны сделок"
                  cost="3 дольки"
                  available={user.dolki >= 3}
                  actionLabel="Обменять"
                  onAction={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Right: Business card & passport */}
          <div className="space-y-5">
            {/* Business card */}
            <div className="bg-gradient-to-br from-ink-800 to-ink-850 border border-ink-700 rounded-2xl p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" />
                Визитка бизнеса
              </h2>

              <div className="bg-ink-900 rounded-xl p-4 border border-ink-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center text-lg font-bold text-orange-500">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-neutral-500">{user.sphere} · {user.city}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-ink-800 rounded-lg p-2">
                    <div className="text-neutral-500">Охват</div>
                    <div className="text-white font-medium">{user.audience >= 1000 ? `${(user.audience / 1000).toFixed(1)} тыс.` : user.audience}</div>
                  </div>
                  <div className="bg-ink-800 rounded-lg p-2">
                    <div className="text-neutral-500">Рейтинг</div>
                    <div className="text-orange-400 font-medium">{rating}%</div>
                  </div>
                </div>
                {user.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">{user.description}</p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-ink-800 text-neutral-200 rounded-lg hover:bg-ink-700 transition-colors"
                >
                  <Download size={15} />
                  Скачать
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium bg-ink-800 text-neutral-200 rounded-lg hover:bg-ink-700 transition-colors"
                >
                  {copied ? <CheckCircle2 size={15} className="text-green-400" /> : <LinkIcon size={15} />}
                  {copied ? 'Скопировано' : 'Ссылка'}
                </button>
              </div>
            </div>

            {/* Passport link */}
            <div className="bg-ink-850 border border-ink-700 rounded-2xl p-5">
              <h2 className="font-bold text-white mb-2 flex items-center gap-2">
                <LinkIcon size={18} className="text-orange-500" />
                Публичный паспорт партнёра
              </h2>
              <p className="text-sm text-neutral-400 mb-3">
                Ссылка на ваш профиль. Можно отправить в Telegram, VK, WhatsApp — откроется как карточка.
              </p>
              <div className="flex items-center gap-2 bg-ink-800 rounded-lg p-2.5 border border-ink-700">
                <input
                  readOnly
                  value={`${window.location.origin}/#/profile/${user.id}`}
                  className="flex-1 bg-transparent text-xs text-neutral-400 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? 'OK' : 'Копировать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-ink-800 rounded-xl p-3.5">
      <div className={`flex items-center gap-1.5 text-xs mb-1 ${accent === 'orange' ? 'text-orange-500' : 'text-neutral-500'}`}>
        {icon}
        {label}
      </div>
      <div className={`text-xl font-bold ${accent === 'orange' ? 'text-orange-500' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] text-neutral-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function BonusItem({ icon, title, cost, available, actionLabel, onAction, done }: {
  icon: React.ReactNode;
  title: string;
  cost: string;
  available: boolean;
  actionLabel: string;
  onAction: () => void;
  done?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-ink-800 rounded-lg p-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-orange-500 shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="text-sm text-neutral-200 truncate">{title}</div>
          <div className="text-xs text-neutral-500">{cost}</div>
        </div>
      </div>
      <button
        onClick={onAction}
        disabled={!available || done}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all shrink-0 ${
          done
            ? 'bg-green-500/15 text-green-400'
            : available
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-ink-700 text-neutral-600 cursor-not-allowed'
        }`}
      >
        {done ? 'Готово' : actionLabel}
      </button>
    </div>
  );
}
