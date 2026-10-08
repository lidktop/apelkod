import { useEffect, useState } from 'react';
import { Menu, X, MessageCircle, LogOut, User, Calendar } from 'lucide-react';
import { useApp } from '@/AppState';

interface HeaderProps {
  onNavigate: (section: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onOpenCalendar: () => void;
  activeView: 'landing' | 'chat' | 'profile' | 'calendar';
}

export default function SiteHeader({ onNavigate, onOpenAuth, onOpenProfile, onOpenChat, onOpenCalendar, activeView }: HeaderProps) {
  const { data, logout, unreadChatsCount, urgentDealsCount } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Каталог', section: 'catalog' },
    { label: 'Как это работает', section: 'how' },
    { label: 'Карта сделок', section: 'map' },
    { label: 'Отзывы', section: 'reviews' },
  ];

  const handleNav = (section: string) => {
    onNavigate(section);
    setMobileOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-ink-950/90 glass border-b border-ink-700' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate('hero')} className="flex items-center gap-2 shrink-0">
            <img src="/apelkod-mark.svg" alt="АпельКод" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-bold text-lg text-white hidden sm:block">АпельКод</span>
          </button>

          {/* Nav links - center */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className="px-3 py-2 text-sm font-medium text-neutral-300 hover:text-orange-400 transition-colors rounded-lg hover:bg-ink-800"
              >
                {item.label}
              </button>
            ))}
            {data.currentUser && (<>
              <button
                onClick={onOpenCalendar}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5 ${
                  activeView === 'calendar' ? 'text-orange-400 bg-ink-800' : 'text-neutral-300 hover:text-orange-400 hover:bg-ink-800'
                }`}
              >
                <Calendar size={16} />
                Календарь
                {urgentDealsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse-ring">
                    {urgentDealsCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenChat}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5 ${
                  activeView === 'chat' ? 'text-orange-400 bg-ink-800' : 'text-neutral-300 hover:text-orange-400 hover:bg-ink-800'
                }`}
              >
                <MessageCircle size={16} />
                Чаты
                {unreadChatsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse-ring">
                    {unreadChatsCount}
                  </span>
                )}
              </button>
            </>)}
          </nav>

          {/* Auth buttons - right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {data.currentUser ? (
              <>
                <button
                  onClick={onOpenProfile}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5 ${
                    activeView === 'profile' ? 'text-orange-400 bg-ink-800' : 'text-neutral-300 hover:text-orange-400 hover:bg-ink-800'
                  }`}
                >
                  <User size={16} />
                  Профиль
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-neutral-300 hover:text-red-400 transition-colors rounded-lg flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-neutral-200 hover:text-white transition-colors"
                >
                  Войти
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all hover:scale-105 glow-orange"
                >
                  Регистрация
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-200"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 space-y-1 animate-slide-down bg-ink-900/95 glass rounded-xl mb-3 border border-ink-700">
            {navItems.map(item => (
              <button
                key={item.section}
                onClick={() => handleNav(item.section)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-orange-400 hover:bg-ink-800 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
            {data.currentUser && (<>
              <button
                onClick={() => { onOpenCalendar(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-orange-400 hover:bg-ink-800 rounded-lg transition-colors"
              >
                <Calendar size={16} />
                Календарь
                {urgentDealsCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {urgentDealsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { onOpenChat(); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-orange-400 hover:bg-ink-800 rounded-lg transition-colors"
              >
                <MessageCircle size={16} />
                Чаты
                {unreadChatsCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadChatsCount}
                  </span>
                )}
              </button>
            </>)}
            <div className="border-t border-ink-700 pt-2 mt-2">
              {data.currentUser ? (
                <>
                  <button
                    onClick={() => { onOpenProfile(); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-orange-400 hover:bg-ink-800 rounded-lg"
                  >
                    <User size={16} /> Профиль
                  </button>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-red-400 hover:bg-ink-800 rounded-lg"
                  >
                    <LogOut size={16} /> Выйти
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuth('login'); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-200 hover:text-orange-400 hover:bg-ink-800 rounded-lg"
                  >
                    Войти
                  </button>
                  <button
                    onClick={() => { onOpenAuth('register'); setMobileOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-lg mx-4 my-1"
                    style={{ width: 'calc(100% - 2rem)' }}
                  >
                    Регистрация
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
