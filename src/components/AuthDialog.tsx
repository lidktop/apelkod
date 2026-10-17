import { useState } from 'react';
import { X, Check, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '@/AppState';
import { AGREEMENT_TEXT } from '@/mockData';

interface AuthDialogProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
}

export default function AuthDialog({ mode, onClose, onSwitch }: AuthDialogProps) {
  const { register, login, authError } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [sphere, setSphere] = useState('');
  const [audience, setAudience] = useState('');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim() || !city.trim() || !sphere.trim()) {
        setError('Заполните все обязательные поля.');
        return;
      }
      if (password.trim().length < 6) {
        setError('Пароль должен быть не короче 6 символов.');
        return;
      }
      if (!agreed) {
        setError('Необходимо принять пользовательское соглашение.');
        return;
      }
      setSubmitting(true);
      try {
        await register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          city: city.trim(),
          sphere: sphere.trim(),
          audience: parseInt(audience) || 0,
          engagement: 0,
          description: description.trim(),
        });
      } catch {
        setSubmitting(false);
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setError('Введите email и пароль.');
        return;
      }
      setSubmitting(true);
      try {
        await login(email.trim(), password.trim());
      } catch {
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-ink-850 border border-ink-600 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">
          {isRegister ? 'Регистрация' : 'Вход'}
        </h2>
        <p className="text-sm text-neutral-400 mb-5">
          {isRegister ? 'Создайте профиль для безопасного бартера' : 'Войдите в личный кабинет'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <Input label="Название бизнеса *" value={name} onChange={setName} placeholder="Например: Кофейня «Зерно»" />
          )}
          <Input label="Email *" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Input label="Пароль *" type="password" value={password} onChange={setPassword} placeholder="Минимум 6 символов" />

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Город *" value={city} onChange={setCity} placeholder="Москва" />
                <Input label="Сфера *" value={sphere} onChange={setSphere} placeholder="Общепит" />
              </div>
              <Input label="Охват (подписчики)" value={audience} onChange={setAudience} placeholder="10000" type="number" />
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">О себе</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Что предлагаете для бартера?"
                  rows={2}
                  className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
              </div>

              {/* Agreement checkbox */}
              <div className="bg-ink-800 rounded-lg p-3 border border-ink-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      agreed ? 'bg-orange-500 border-orange-500' : 'border-ink-600 hover:border-orange-500/50'
                    }`}
                  >
                    {agreed && <Check size={14} className="text-white" />}
                  </button>
                  <span className="text-sm text-neutral-300 leading-snug">
                    Я принимаю{' '}
                    <button
                      type="button"
                      onClick={() => setShowAgreement(true)}
                      className="text-orange-500 hover:text-orange-400 underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      <FileText size={13} />
                      пользовательское соглашение
                    </button>
                  </span>
                </label>
              </div>
            </>
          )}

          {(error || authError) && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle size={16} />
              {error || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={(isRegister && !agreed) || submitting}
            className={`w-full py-3 font-semibold rounded-xl transition-all ${
              (isRegister && !agreed) || submitting
                ? 'bg-ink-700 text-neutral-600 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02] glow-orange'
            }`}
          >
            {submitting ? 'Подождите…' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-neutral-500">
          {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
          <button
            onClick={() => onSwitch(isRegister ? 'login' : 'register')}
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>

      {/* Agreement modal */}
      {showAgreement && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAgreement(false)}>
          <div className="absolute inset-0 bg-black/80 glass" />
          <div
            className="relative bg-ink-850 border border-ink-600 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-down"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-orange-500" />
                Пользовательское соглашение
              </h3>
              <button onClick={() => setShowAgreement(false)} className="text-neutral-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
              {AGREEMENT_TEXT.split('\n\n').map((para, i) => (
                <p key={i} className="bg-ink-800 rounded-lg p-3 border-l-2 border-orange-500/40">{para}</p>
              ))}
            </div>
            <button
              onClick={() => { setAgreed(true); setShowAgreement(false); }}
              className="w-full mt-5 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
            >
              Принимаю
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-lg text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/50 transition-colors"
      />
    </div>
  );
}
