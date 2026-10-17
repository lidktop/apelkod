import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile, BusinessCard, Deal, ChatThread, AppData, DealType } from '@/models';
import { seedDealMap, botResponses } from '@/mockData';

const emptyData: AppData = {
  currentUser: null,
  offers: [],
  deals: [],
  chats: [],
  dealMapConnections: seedDealMap,
};

type ProfileRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  city: string;
  sphere: string;
  type: DealType;
  description: string;
  audience: number;
  engagement: number;
  rating: number;
  deals_completed: number;
  deals_total: number;
  owner: string;
  dolki: number;
  weekly_quota: number;
  weekly_used: number;
  is_published: boolean;
};

type DealRow = {
  id: string;
  business_a_id: string;
  business_b_id: string;
  business_a: { name: string } | null;
  business_b: { name: string } | null;
  type: string;
  description: string;
  deadline: string;
  status: Deal['status'];
  confirmed_a: boolean;
  confirmed_b: boolean;
  extended: boolean;
  template_name: string | null;
  created_at: string;
};

type ThreadRow = { id: string; deal_id: string };
type MessageRow = { id: string; thread_id: string; sender_id: string | null; body: string; created_at: string };

function profileToCard(p: ProfileRow): BusinessCard {
  return {
    id: p.id,
    name: p.name,
    city: p.city,
    sphere: p.sphere,
    type: p.type,
    description: p.description,
    audience: p.audience,
    engagement: p.engagement,
    rating: p.rating,
    dealsCompleted: p.deals_completed,
    dealsTotal: p.deals_total,
    owner: p.owner,
  };
}

function profileToUser(p: ProfileRow): UserProfile {
  return {
    id: p.id,
    name: p.name,
    email: p.email ?? '',
    city: p.city,
    sphere: p.sphere,
    audience: p.audience,
    engagement: p.engagement,
    description: p.description,
    dolki: p.dolki,
    dealsCompleted: p.deals_completed,
    dealsTotal: p.deals_total,
    weeklyQuota: p.weekly_quota,
    weeklyUsed: p.weekly_used,
  };
}

function dealRowToDeal(d: DealRow): Deal {
  return {
    id: d.id,
    businessAId: d.business_a_id,
    businessBId: d.business_b_id,
    businessAName: d.business_a?.name ?? '—',
    businessBName: d.business_b?.name ?? '—',
    type: d.type,
    description: d.description,
    deadline: d.deadline,
    status: d.status,
    confirmedA: d.confirmed_a,
    confirmedB: d.confirmed_b,
    dateCreated: d.created_at.split('T')[0],
    templateName: d.template_name ?? undefined,
    extended: d.extended,
  };
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  city: string;
  sphere: string;
  audience: number;
  engagement: number;
  description: string;
}

interface CreateOfferInput {
  name: string;
  city: string;
  sphere: string;
  type: DealType;
  description: string;
  audience: number;
  engagement: number;
}

interface AppStateValue {
  data: AppData;
  loading: boolean;
  authError: string;
  register: (profile: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createOffer: (offer: CreateOfferInput) => Promise<void>;
  createDeal: (offer: BusinessCard, templateName?: string, terms?: string) => Promise<void>;
  confirmDeal: (dealId: string) => Promise<void>;
  completeDeal: (dealId: string) => Promise<void>;
  extendDeadline: (dealId: string) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
  markChatRead: (threadId: string) => void;
  myConfirmedSide: (deal: Deal) => boolean;
  unreadChatsCount: number;
  urgentDealsCount: number;
  notifications: string[];
  dismissNotification: (index: number) => void;
  checkDeadlines: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const myProfileId = useRef<string | null>(null);
  const seenThreads = useRef<Set<string>>(new Set());

  const pushNotification = useCallback((msg: string) => {
    setNotifications(prev => [...prev, msg]);
  }, []);

  const loadCatalog = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setData(prev => ({ ...prev, offers: (rows as ProfileRow[]).map(profileToCard) }));
  }, []);

  const loadDeals = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('deals')
      .select('*, business_a:profiles!business_a_id(name), business_b:profiles!business_b_id(name)')
      .order('deadline', { ascending: true });
    if (error) { console.error(error); return; }
    setData(prev => ({ ...prev, deals: (rows as unknown as DealRow[]).map(dealRowToDeal) }));
  }, []);

  const loadChats = useCallback(async () => {
    const [{ data: threads, error: tErr }, { data: messages, error: mErr }] = await Promise.all([
      supabase.from('chat_threads').select('*'),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
    ]);
    if (tErr || mErr) { console.error(tErr ?? mErr); return; }

    setData(prev => {
      const chats: ChatThread[] = (threads as ThreadRow[]).map(t => {
        const deal = prev.deals.find(d => d.id === t.deal_id);
        const partnerName = deal
          ? (deal.businessAId === myProfileId.current ? deal.businessBName : deal.businessAName)
          : '—';
        const msgs = (messages as MessageRow[])
          .filter(m => m.thread_id === t.id)
          .map(m => ({
            id: m.id,
            sender: (m.sender_id === myProfileId.current ? 'user' : 'bot') as 'user' | 'bot',
            text: m.body,
            time: new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          }));
        const lastMsg = msgs[msgs.length - 1];
        const unread = !!lastMsg && lastMsg.sender === 'bot' && !seenThreads.current.has(t.id);
        return { id: t.id, dealId: t.deal_id, businessName: partnerName, messages: msgs, unread };
      });
      return { ...prev, chats };
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    setNotifications((rows as { text: string }[]).map(r => r.text));
  }, []);

  const loadOwnProfile = useCallback(async (userId: string) => {
    const { data: row, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !row) { console.error(error); return; }
    const profile = row as ProfileRow;
    myProfileId.current = profile.id;
    setData(prev => ({ ...prev, currentUser: profileToUser(profile) }));
    await Promise.all([loadDeals(), loadNotifications()]);
    await loadChats();
  }, [loadDeals, loadChats, loadNotifications]);

  // сессия + realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    loadCatalog().finally(() => setLoading(false));

    return () => {
      sub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadCatalog]);

  useEffect(() => {
    if (session?.user) {
      loadOwnProfile(session.user.id);
    } else {
      myProfileId.current = null;
      setData(prev => ({ ...prev, currentUser: null, deals: [], chats: [] }));
    }
  }, [session, loadOwnProfile]);

  // реалтайм: новые уведомления и сообщения в чатах
  useEffect(() => {
    if (!session?.user) return;
    const channel = supabase
      .channel('apelkod-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const row = payload.new as { text: string };
        pushNotification(row.text);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => {
        loadChats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, pushNotification, loadChats]);

  const register = useCallback(async (profile: RegisterInput) => {
    setAuthError('');
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: profile.email,
      password: profile.password,
      options: { data: { name: profile.name, city: profile.city, sphere: profile.sphere, description: profile.description } },
    });
    if (error) { setAuthError(error.message); throw error; }
    if (signUpData.user) {
      await supabase.from('profiles').update({ audience: profile.audience, engagement: profile.engagement }).eq('user_id', signUpData.user.id);
    }
    if (!signUpData.session) {
      setAuthError('Проверьте почту и подтвердите email, затем войдите.');
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); throw error; }
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const createOffer = useCallback(async (offer: CreateOfferInput) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        name: offer.name, city: offer.city, sphere: offer.sphere,
        type: offer.type, description: offer.description,
        audience: offer.audience, engagement: offer.engagement,
        is_published: true,
      })
      .eq('user_id', session.user.id);
    if (error) { console.error(error); return; }
    await Promise.all([loadCatalog(), loadOwnProfile(session.user.id)]);
    pushNotification('Предложение опубликовано в каталоге.');
  }, [session, loadCatalog, loadOwnProfile, pushNotification]);

  const createDeal = useCallback(async (offer: BusinessCard, templateName?: string, terms?: string) => {
    if (!myProfileId.current) return;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const { data: inserted, error } = await supabase
      .from('deals')
      .insert({
        business_a_id: myProfileId.current,
        business_b_id: offer.id,
        type: templateName ?? offer.type,
        description: terms ?? offer.description,
        deadline: deadline.toISOString().split('T')[0],
        template_name: templateName ?? null,
      })
      .select('id')
      .single();
    if (error || !inserted) { console.error(error); return; }
    const dealId = (inserted as { id: string }).id;

    // я сразу подтверждаю условия своей стороной
    await supabase.rpc('confirm_deal', { p_deal: dealId });
    // если партнёр — демо-бизнес без аккаунта, он подтверждает автоматически
    await supabase.rpc('auto_confirm_demo_partner', { p_deal: dealId });

    const { data: thread } = await supabase.from('chat_threads').insert({ deal_id: dealId }).select('id').single();
    if (thread) {
      const threadId = (thread as { id: string }).id;
      // если партнёр демо — он сразу пишет первое сообщение
      await supabase.rpc('send_bot_reply', { p_thread: threadId, p_text: botResponses[0] }).then(
        () => {},
        () => {} // у партнёра настоящий аккаунт — функция откажет, это ожидаемо
      );
    }

    await Promise.all([loadDeals(), loadChats()]);
    pushNotification(`Сделка с «${offer.name}» зафиксирована. Открылся чат — партнёр написал вам.`);
  }, [loadDeals, loadChats, pushNotification]);

  const confirmDeal = useCallback(async (dealId: string) => {
    const { error } = await supabase.rpc('confirm_deal', { p_deal: dealId });
    if (error) { console.error(error); return; }
    await loadDeals();
    if (session?.user) await loadOwnProfile(session.user.id);
    await loadCatalog();
  }, [loadDeals, loadOwnProfile, loadCatalog, session]);

  // «Подтвердить выполнение» и «подтвердить условия» — одна и та же серверная функция:
  // confirm_deal сама решает, что менять, в зависимости от текущего статуса сделки.
  const completeDeal = confirmDeal;

  const extendDeadline = useCallback(async (dealId: string) => {
    const { error } = await supabase.rpc('extend_deadline', { p_deal: dealId });
    if (error) { console.error(error); return; }
    await loadDeals();
  }, [loadDeals]);

  const sendMessage = useCallback(async (threadId: string, text: string) => {
    if (!myProfileId.current) return;
    seenThreads.current.add(threadId);
    const { error } = await supabase.from('chat_messages').insert({ thread_id: threadId, sender_id: myProfileId.current, body: text });
    if (error) { console.error(error); return; }
    await loadChats();

    // демо-партнёр отвечает с небольшой задержкой (если у него нет настоящего аккаунта)
    setTimeout(async () => {
      const reply = botResponses[Math.floor(Math.random() * botResponses.length)];
      const { error: botErr } = await supabase.rpc('send_bot_reply', { p_thread: threadId, p_text: reply });
      if (!botErr) await loadChats();
    }, 800 + Math.random() * 600);
  }, [loadChats]);

  const markChatRead = useCallback((threadId: string) => {
    seenThreads.current.add(threadId);
    setData(prev => ({ ...prev, chats: prev.chats.map(c => c.id === threadId ? { ...c, unread: false } : c) }));
  }, []);

  const myConfirmedSide = useCallback((deal: Deal) => {
    if (!myProfileId.current) return false;
    return deal.businessAId === myProfileId.current ? deal.confirmedA : deal.confirmedB;
  }, []);

  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // напоминания и просрочки считает сервер (pg_cron, run_deal_reminders) —
  // клиенту ничего пересчитывать не нужно, оставлено для совместимости вызовов.
  const checkDeadlines = useCallback(() => {}, []);

  const unreadChatsCount = data.chats.filter(c => c.unread).length;

  const urgentDealsCount = (() => {
    if (!data.currentUser) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return data.deals.filter(d => {
      if (d.status === 'completed') return false;
      const dl = new Date(d.deadline);
      dl.setHours(0, 0, 0, 0);
      const diff = Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 1;
    }).length;
  })();

  return (
    <AppStateContext.Provider value={{
      data, loading, authError, register, login, logout, createOffer, createDeal,
      confirmDeal, completeDeal, extendDeadline, sendMessage, markChatRead, myConfirmedSide,
      unreadChatsCount, urgentDealsCount, notifications, dismissNotification, checkDeadlines,
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}

export type { DealType };
