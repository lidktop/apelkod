import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, AlertTriangle, MessageCircle, Plus,
  TrendingUp, Coins, CalendarX2,
} from 'lucide-react';
import { useApp } from '@/AppState';
import type { Deal } from '@/models';

interface CalendarPageProps {
  onBack: () => void;
  onOpenChat: () => void;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

export default function CalendarPage({ onBack, onOpenChat }: CalendarPageProps) {
  const { data, completeDeal, extendDeadline, checkDeadlines, myConfirmedSide } = useApp();
  const user = data.currentUser;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  useEffect(() => {
    if (user) checkDeadlines();
  }, [user, checkDeadlines]);

  const myDeals = useMemo(() => {
    if (!user) return [];
    return data.deals
      .filter(d => d.businessAId === user.id || d.businessBId === user.id)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [data.deals, user]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dealsByDate = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    myDeals.forEach(d => {
      const key = d.deadline;
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [myDeals]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(currentYear, currentMonth, d));
    return days;
  }, [currentMonth, currentYear]);

  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const filteredDeals = useMemo(() => {
    if (!selectedDate) return myDeals;
    return myDeals.filter(d => d.deadline === selectedDate);
  }, [myDeals, selectedDate]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  if (!user) return null;

  const stats = {
    active: myDeals.filter(d => d.status !== 'completed' && d.status !== 'overdue' && new Date(d.deadline) >= today).length,
    overdue: myDeals.filter(d => d.status === 'overdue' || (d.status !== 'completed' && new Date(d.deadline) < today)).length,
    completed: myDeals.filter(d => d.status === 'completed').length,
    pendingConfirm: myDeals.filter(d => d.status !== 'completed' && d.status !== 'overdue' && myConfirmedSide(d) && !(d.confirmedA && d.confirmedB)).length,
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} />
          На главную
        </button>

        <div className="flex items-center gap-3 mb-6">
          <CalendarIcon size={28} className="text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Календарь сделок</h1>
            <p className="text-sm text-neutral-400">Все ваши сделки с дедлайнами и статусами</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBadge icon={<Clock size={16} />} label="Активные" value={stats.active} color="orange" />
          <StatBadge icon={<CheckCircle2 size={16} />} label="Завершены" value={stats.completed} color="green" />
          <StatBadge icon={<AlertTriangle size={16} />} label="Просрочены" value={stats.overdue} color="red" />
          <StatBadge icon={<MessageCircle size={16} />} label="Ожидают подтверждения" value={stats.pendingConfirm} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* Mini calendar */}
          <div className={`bg-ink-850 border border-ink-700 rounded-2xl p-4 ${mobileCalendarOpen ? '' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-sm">{MONTHS[currentMonth]} {currentYear}</h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-ink-800 hover:bg-ink-700 flex items-center justify-center text-neutral-400 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-ink-800 hover:bg-ink-700 flex items-center justify-center text-neutral-400 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map(wd => (
                <div key={wd} className="text-center text-[10px] font-medium text-neutral-600 py-1">{wd}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} />;
                const key = dateKey(day);
                const hasDeals = !!dealsByDate[key];
                const hasOverdue = dealsByDate[key]?.some(d => d.status === 'overdue' || (d.status !== 'completed' && new Date(d.deadline) < today));
                const hasActive = dealsByDate[key]?.some(d => d.status !== 'completed' && d.status !== 'overdue' && new Date(d.deadline) >= today);
                const hasCompleted = dealsByDate[key]?.some(d => d.status === 'completed');
                const isToday = dateKey(day) === dateKey(today);
                const isSelected = selectedDate === key;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(isSelected ? null : key)}
                    className={`relative aspect-square rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : isToday
                          ? 'bg-ink-700 text-white ring-1 ring-orange-500/50'
                          : hasDeals
                            ? 'bg-ink-800 text-neutral-200 hover:bg-ink-700'
                            : 'text-neutral-500 hover:bg-ink-800'
                    }`}
                  >
                    {day.getDate()}
                    {hasDeals && !isSelected && (
                      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5`}>
                        {hasOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                        {hasCompleted && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-ink-700 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Активная сделка
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Завершённая
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Просроченная
              </div>
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-3 w-full py-2 text-xs font-medium text-neutral-400 hover:text-orange-400 transition-colors"
              >
                Показать все сделки
              </button>
            )}
          </div>

          {/* Deal list */}
          <div className="space-y-3">
            {/* Mobile calendar toggle */}
            <button
              onClick={() => setMobileCalendarOpen(!mobileCalendarOpen)}
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-ink-850 border border-ink-700 rounded-xl text-sm text-neutral-300"
            >
              <span className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-orange-500" />
                {mobileCalendarOpen ? 'Скрыть календарь' : 'Показать календарь'}
              </span>
              {urgentDealsBadge()}
            </button>

            {selectedDate && (
              <div className="text-sm text-neutral-400 px-1">
                Сделки на: <span className="text-white font-medium">{new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}

            {filteredDeals.length === 0 ? (
              <div className="bg-ink-850 border border-ink-700 rounded-2xl p-10 text-center">
                <CalendarX2 size={36} className="text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">
                  {selectedDate ? 'На эту дату нет сделок.' : 'У вас пока нет сделок. Найдите партнёра в каталоге.'}
                </p>
              </div>
            ) : (
              filteredDeals.map(deal => {
                const partner = deal.businessAId === user.id ? deal.businessBName : deal.businessAName;
                const dlDate = new Date(deal.deadline);
                dlDate.setHours(0, 0, 0, 0);
                const diffDays = Math.round((dlDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = deal.status === 'overdue' || (deal.status !== 'completed' && diffDays < 0);
                const myConfirmed = myConfirmedSide(deal);
                const bothConfirmed = deal.confirmedA && deal.confirmedB;
                const hasChat = data.chats.some(c => c.dealId === deal.id);
                const effectiveStatus = isOverdue ? 'overdue' : deal.status;

                return (
                  <div
                    key={deal.id}
                    className={`bg-ink-850 border rounded-2xl p-4 sm:p-5 transition-all hover:border-ink-600 ${
                      effectiveStatus === 'overdue'
                        ? 'border-red-500/30'
                        : effectiveStatus === 'completed'
                          ? 'border-ink-700 opacity-75'
                          : diffDays <= 1
                            ? 'border-orange-500/30'
                            : 'border-ink-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Date block */}
                      <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                        effectiveStatus === 'overdue'
                          ? 'bg-red-500/10 text-red-400'
                          : effectiveStatus === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        <span className="text-lg font-bold leading-none">{dlDate.getDate()}</span>
                        <span className="text-[10px] uppercase mt-0.5">{MONTHS[dlDate.getMonth()].slice(0, 3)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-sm truncate">
                              {partner}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5">{deal.type}</p>
                          </div>
                          <StatusBadge status={effectiveStatus} />
                        </div>

                        <p className="text-sm text-neutral-400 leading-relaxed mb-3 line-clamp-2">{deal.description}</p>

                        {/* Deadline info */}
                        {effectiveStatus !== 'completed' && (
                          <div className="flex items-center gap-2 text-xs mb-3">
                            {effectiveStatus === 'overdue' ? (
                              <span className="text-red-400 font-medium flex items-center gap-1">
                                <AlertTriangle size={13} />
                                Дедлайн просрочен ({dlDate.toLocaleDateString('ru-RU')})
                              </span>
                            ) : diffDays === 0 ? (
                              <span className="text-orange-400 font-medium flex items-center gap-1">
                                <Clock size={13} />
                                Дедлайн сегодня!
                              </span>
                            ) : diffDays === 1 ? (
                              <span className="text-orange-400 font-medium flex items-center gap-1">
                                <Clock size={13} />
                                Дедлайн завтра
                              </span>
                            ) : diffDays > 0 ? (
                              <span className="text-neutral-400 flex items-center gap-1">
                                <Clock size={13} />
                                Осталось {diffDays} {pluralDays(diffDays)} ({dlDate.toLocaleDateString('ru-RU')})
                              </span>
                            ) : null}
                            {deal.extended && (
                              <span className="text-neutral-600 text-[10px] ml-1">· продлён</span>
                            )}
                          </div>
                        )}

                        {effectiveStatus === 'completed' && (
                          <div className="flex items-center gap-2 text-xs text-green-400 font-medium mb-3">
                            <Coins size={14} />
                            Сделка завершена · +3 дольки начислено
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {effectiveStatus !== 'completed' && effectiveStatus !== 'overdue' && (
                            <button
                              onClick={() => completeDeal(deal.id)}
                              disabled={myConfirmed}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                                myConfirmed
                                  ? 'bg-ink-700 text-neutral-600 cursor-default'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              <CheckCircle2 size={14} />
                              {myConfirmed ? 'Вы подтвердили' : 'Подтвердить выполнение'}
                            </button>
                          )}

                          {effectiveStatus === 'overdue' && !myConfirmed && (
                            <button
                              onClick={() => completeDeal(deal.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                            >
                              <CheckCircle2 size={14} />
                              Подтвердить выполнение
                            </button>
                          )}

                          {effectiveStatus !== 'completed' && !deal.extended && !isOverdue && (
                            <button
                              onClick={() => extendDeadline(deal.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-ink-800 text-neutral-300 rounded-lg hover:bg-ink-700 hover:text-orange-400 transition-colors"
                            >
                              <Plus size={14} />
                              Продлить на 3 дня
                            </button>
                          )}

                          {hasChat && bothConfirmed && (
                            <button
                              onClick={onOpenChat}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-ink-800 text-neutral-300 rounded-lg hover:bg-ink-700 hover:text-orange-400 transition-colors"
                            >
                              <MessageCircle size={14} />
                              Открыть чат
                            </button>
                          )}
                        </div>

                        {/* Pending confirmation note */}
                        {myConfirmed && !bothConfirmed && effectiveStatus !== 'completed' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-yellow-400">
                            <Clock size={12} />
                            Ожидаем подтверждения от партнёра
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function urgentDealsBadge() {
    const count = myDeals.filter(d => {
      if (d.status === 'completed') return false;
      const dl = new Date(d.deadline);
      dl.setHours(0, 0, 0, 0);
      return Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 1;
    }).length;
    if (count === 0) return null;
    return <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{count}</span>;
  }
}

function pluralDays(n: number): string {
  if (n === 1) return 'день';
  if (n >= 2 && n <= 4) return 'дня';
  return 'дней';
}

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[color]}`}>
      <div className="flex items-center gap-1.5 text-xs mb-1 opacity-80">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active: { label: 'Активна', cls: 'text-orange-400 bg-orange-500/10', icon: <Clock size={12} /> },
    confirmed: { label: 'Подтверждена', cls: 'text-green-400 bg-green-500/10', icon: <CheckCircle2 size={12} /> },
    completed: { label: 'Выполнена', cls: 'text-green-400 bg-green-500/10', icon: <CheckCircle2 size={12} /> },
    overdue: { label: 'Просрочено', cls: 'text-red-400 bg-red-500/10', icon: <AlertTriangle size={12} /> },
    pending: { label: 'Ожидает подтверждения', cls: 'text-yellow-400 bg-yellow-500/10', icon: <Clock size={12} /> },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium shrink-0 ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
