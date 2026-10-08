import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserProfile, BusinessCard, Deal, ChatThread, AppData, DealType, DealStatus } from '@/models';
import { seedOffers, seedDeals, seedDealMap, botResponses } from '@/mockData';

const STORAGE_KEY = 'apelkod_data_v1';

const emptyData: AppData = {
  currentUser: null,
  offers: seedOffers,
  deals: seedDeals,
  chats: [],
  dealMapConnections: seedDealMap,
};

interface AppStateValue {
  data: AppData;
  register: (profile: Omit<UserProfile, 'id' | 'dolki' | 'dealsCompleted' | 'dealsTotal' | 'weeklyQuota' | 'weeklyUsed' | 'offersCreated'>) => void;
  logout: () => void;
  createOffer: (offer: Omit<BusinessCard, 'id' | 'rating' | 'dealsCompleted' | 'dealsTotal' | 'owner'>) => void;
  createDeal: (offer: BusinessCard, templateName?: string, terms?: string) => void;
  confirmDeal: (dealId: string, side: 'A' | 'B') => void;
  completeDeal: (dealId: string, side: 'A' | 'B') => void;
  extendDeadline: (dealId: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  markChatRead: (chatId: string) => void;
  unreadChatsCount: number;
  urgentDealsCount: number;
  notifications: string[];
  dismissNotification: (index: number) => void;
  checkDeadlines: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...emptyData, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return emptyData;
  });
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const pushNotification = useCallback((msg: string) => {
    setNotifications(prev => [...prev, msg]);
  }, []);

  const register: AppStateValue['register'] = useCallback((profile) => {
    const user: UserProfile = {
      ...profile,
      id: 'u_' + Date.now(),
      dolki: 5,
      dealsCompleted: 0,
      dealsTotal: 0,
      weeklyQuota: 3,
      weeklyUsed: 0,
      offersCreated: [],
    };
    setData(prev => ({ ...prev, currentUser: user }));
  }, []);

  const logout = useCallback(() => {
    setData(prev => ({ ...prev, currentUser: null }));
  }, []);

  const createOffer: AppStateValue['createOffer'] = useCallback((offer) => {
    const newOffer: BusinessCard = {
      ...offer,
      id: 'o_' + Date.now(),
      rating: 100,
      dealsCompleted: 0,
      dealsTotal: 0,
      owner: data.currentUser?.name ?? 'Вы',
    };
    setData(prev => ({
      ...prev,
      offers: [newOffer, ...prev.offers],
      currentUser: prev.currentUser
        ? { ...prev.currentUser, offersCreated: [...prev.currentUser.offersCreated, newOffer.id] }
        : prev.currentUser,
    }));
    pushNotification('Предложение опубликовано в каталоге.');
  }, [data.currentUser, pushNotification]);

  const createDeal: AppStateValue['createDeal'] = useCallback((offer, templateName, terms) => {
    const userName = data.currentUser?.name ?? 'Вы';
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);
    const deal: Deal = {
      id: 'd_' + Date.now(),
      businessA: userName,
      businessB: offer.name,
      type: templateName ?? offer.type,
      description: terms ?? offer.description,
      deadline: deadline.toISOString().split('T')[0],
      status: 'confirmed',
      confirmedA: true,
      confirmedB: true,
      dateCreated: new Date().toISOString().split('T')[0],
      templateName,
    };
    const chat: ChatThread = {
      id: 'c_' + Date.now(),
      dealId: deal.id,
      businessName: offer.name,
      messages: [{
        id: 'm_' + Date.now(),
        sender: 'bot',
        text: botResponses[0],
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      }],
      unread: true,
    };
    setData(prev => ({
      ...prev,
      deals: [deal, ...prev.deals],
      chats: [chat, ...prev.chats],
      dealMapConnections: [{ a: userName, b: offer.name, type: deal.type, date: new Date().toLocaleDateString('ru-RU') }, ...prev.dealMapConnections],
      currentUser: prev.currentUser
        ? { ...prev.currentUser, weeklyUsed: prev.currentUser.weeklyUsed + 1 }
        : prev.currentUser,
    }));
    pushNotification(`Сделка с «${offer.name}» зафиксирована. Открылся чат — партнёр написал вам.`);
  }, [data.currentUser, pushNotification]);

  const confirmDeal: AppStateValue['confirmDeal'] = useCallback((dealId, side) => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id !== dealId) return d;
        const updated = { ...d };
        if (side === 'A') updated.confirmedA = true;
        if (side === 'B') updated.confirmedB = true;
        if (updated.confirmedA && updated.confirmedB) updated.status = 'active';
        return updated;
      }),
    }));
  }, []);

  const completeDeal: AppStateValue['completeDeal'] = useCallback((dealId, side) => {
    setData(prev => {
      let completed = false;
      let justMarked = false;
      const updatedDeals = prev.deals.map(d => {
        if (d.id !== dealId) return d;
        const updated = { ...d };
        if (side === 'A') {
          if (!updated.confirmedA) justMarked = true;
          updated.confirmedA = true;
          updated.userConfirmedCompletion = true;
        }
        if (side === 'B') updated.confirmedB = true;
        if (updated.confirmedA && updated.confirmedB && updated.status !== 'completed') {
          updated.status = 'completed';
          completed = true;
        }
        return updated;
      });
      const newDolki = completed ? 3 : 0;
      return {
        ...prev,
        deals: updatedDeals,
        currentUser: prev.currentUser && completed
          ? { ...prev.currentUser, dolki: prev.currentUser.dolki + newDolki, dealsCompleted: prev.currentUser.dealsCompleted + 1, dealsTotal: prev.currentUser.dealsTotal + 1 }
          : prev.currentUser,
      };
    });
  }, []);

  const extendDeadline: AppStateValue['extendDeadline'] = useCallback((dealId) => {
    setData(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id !== dealId || d.extended) return d;
        const dl = new Date(d.deadline);
        dl.setDate(dl.getDate() + 3);
        return { ...d, deadline: dl.toISOString().split('T')[0], extended: true };
      }),
    }));
  }, []);

  const checkDeadlines: AppStateValue['checkDeadlines'] = useCallback(() => {
    if (!data.currentUser) return;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const userName = data.currentUser.name;
    const msgs: string[] = [];

    setData(prev => {
      const updatedDeals = prev.deals.map(d => {
        if (d.businessA !== userName && d.businessB !== userName) return d;
        if (d.status === 'completed') return d;
        const dl = new Date(d.deadline);
        dl.setHours(0, 0, 0, 0);
        const diffDays = Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const partner = d.businessA === userName ? d.businessB : d.businessA;

        if (diffDays < 0 && d.status !== 'overdue') {
          msgs.push(`Срок по сделке с «${partner}» истёк. Статус изменён на «Просрочено».`);
          return { ...d, status: 'overdue' as DealStatus };
        }
        if (diffDays === 1) {
          msgs.push(`Завтра срок по сделке с «${partner}». Не забудьте подтвердить выполнение.`);
        }
        if (diffDays === 0) {
          msgs.push(`Сегодня дедлайн по сделке с «${partner}». Подтвердите выполнение!`);
        }
        return d;
      });
      return { ...prev, deals: updatedDeals };
    });

    msgs.forEach(m => pushNotification(m));
  }, [data.currentUser, pushNotification]);

  const sendMessage: AppStateValue['sendMessage'] = useCallback((chatId, text) => {
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setData(prev => ({
      ...prev,
      chats: prev.chats.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { id: 'm_' + Date.now(), sender: 'user', text, time: now }] }
          : c
      ),
    }));
    setTimeout(() => {
      const botText = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      setData(prev => ({
        ...prev,
        chats: prev.chats.map(c =>
          c.id === chatId
            ? { ...c, unread: false, messages: [...c.messages, { id: 'm_' + Date.now(), sender: 'bot', text: botText, time: botTime }] }
            : c
        ),
      }));
    }, 800 + Math.random() * 600);
  }, []);

  const markChatRead = useCallback((chatId: string) => {
    setData(prev => ({
      ...prev,
      chats: prev.chats.map(c => c.id === chatId ? { ...c, unread: false } : c),
    }));
  }, []);

  const dismissNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const unreadChatsCount = data.chats.filter(c => c.unread).length;

  const urgentDealsCount = (() => {
    if (!data.currentUser) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return data.deals.filter(d => {
      if (d.businessA !== data.currentUser!.name && d.businessB !== data.currentUser!.name) return false;
      if (d.status === 'completed') return false;
      const dl = new Date(d.deadline);
      dl.setHours(0, 0, 0, 0);
      const diff = Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 1;
    }).length;
  })();

  return (
    <AppStateContext.Provider value={{
      data, register, logout, createOffer, createDeal, confirmDeal, completeDeal,
      extendDeadline, sendMessage, markChatRead, unreadChatsCount, urgentDealsCount,
      notifications, dismissNotification, checkDeadlines,
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
