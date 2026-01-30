
export type TransactionType = 'INCOME' | 'EXPENSE' | 'DUE';
export type UserRole = 'ADMIN' | 'MODERATOR';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Moderator {
  id: string;
  name: string;
  email: string;
  code: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  buyPrice: number;
  sellPrice: number;
  addedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  mobile: string;
  description: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  secretCode: string;
  currency: string;
  profilePic?: string;
  primaryColor?: string;
  accounts: string[];
  moderators: Moderator[];
  products: Product[];
  partners: Partner[];
}

export type Language = 'EN' | 'BN';
export type Theme = 'light' | 'dark';

export interface AppState {
  user: UserProfile | null;
  role: UserRole;
  moderatorName?: string;
  transactions: Transaction[];
  language: Language;
  theme: Theme;
}
