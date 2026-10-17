export type DealType = 'Бартер' | 'Коллаборация';

export type DealStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'overdue';

export interface BusinessCard {
  id: string;
  name: string;
  city: string;
  sphere: string;
  type: DealType;
  description: string;
  audience: number;
  engagement: number;
  rating: number;
  dealsCompleted: number;
  dealsTotal: number;
  owner: string;
}

export interface Deal {
  id: string;
  // связь по id (profiles.id), а не по имени бизнеса
  businessAId: string;
  businessBId: string;
  // имена подтягиваются join'ом из profiles — только для отображения
  businessAName: string;
  businessBName: string;
  type: string;
  description: string;
  deadline: string;
  status: DealStatus;
  confirmedA: boolean;
  confirmedB: boolean;
  dateCreated: string;
  templateName?: string;
  extended?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export interface ChatThread {
  id: string;
  dealId: string;
  businessName: string;
  messages: ChatMessage[];
  unread: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  sphere: string;
  audience: number;
  engagement: number;
  description: string;
  dolki: number;
  dealsCompleted: number;
  dealsTotal: number;
  weeklyQuota: number;
  weeklyUsed: number;
}

export interface AppData {
  currentUser: UserProfile | null;
  offers: BusinessCard[];
  deals: Deal[];
  chats: ChatThread[];
  dealMapConnections: { a: string; b: string; type: string; date: string }[];
}
