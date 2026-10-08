interface FooterProps {
  onNavigate: (section: string) => void;
}

export default function SiteFooter({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-ink-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/apelkod-mark.svg" alt="АпельКод" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white">АпельКод</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button onClick={() => onNavigate('about')} className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">
              О проекте
            </button>
            <button onClick={() => onNavigate('terms')} className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">
              Пользовательское соглашение
            </button>
            <button onClick={() => onNavigate('contacts')} className="text-sm text-neutral-400 hover:text-orange-400 transition-colors">
              Контакты
            </button>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-neutral-500">© 2026 АпельКод</p>
        </div>
      </div>
    </footer>
  );
}
