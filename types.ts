export enum NetworkProvider {
  VINAPHONE = 'Vinaphone',
  VIETTEL = 'Viettel',
  MOBIFONE = 'Mobifone',
  OTHER = 'Other'
}

export interface SimCard {
  id: string;
  phoneNumber: string;
  price: number;
  provider: NetworkProvider;
  category: string[]; // e.g., "Tam Hoa", "Thần Tài", "Phong Thủy"
  description?: string;
  score?: number; // 0-10 feng shui score
  status: 'available' | 'sold' | 'pending';
}

export interface Order {
  id: string;
  simId: string;
  phoneNumber: string;
  price: number;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface FengShuiAnalysis {
  score: number;
  element: string; // Mệnh (Kim, Mộc, etc.)
  interpretation: string;
  compatibility: string;
}
