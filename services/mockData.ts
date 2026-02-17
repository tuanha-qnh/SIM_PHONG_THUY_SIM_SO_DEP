import { SimCard, NetworkProvider } from '../types';

export const MOCK_SIMS: SimCard[] = [
  { id: '1', phoneNumber: '0912.345.678', price: 5000000, provider: NetworkProvider.VINAPHONE, category: ['Sảnh Tiến', 'Phong Thủy'], status: 'available', score: 9.5 },
  { id: '2', phoneNumber: '0918.888.999', price: 15000000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa', 'Lộc Phát'], status: 'available', score: 9.8 },
  { id: '3', phoneNumber: '0919.39.79.39', price: 2500000, provider: NetworkProvider.VINAPHONE, category: ['Thần Tài'], status: 'available', score: 8.5 },
  { id: '4', phoneNumber: '0888.666.888', price: 8000000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa', 'Kép'], status: 'available', score: 9.0 },
  { id: '5', phoneNumber: '0915.11.02.02', price: 1200000, provider: NetworkProvider.VINAPHONE, category: ['Năm Sinh', 'Dễ Nhớ'], status: 'available', score: 7.5 },
  { id: '6', phoneNumber: '0945.678.910', price: 9000000, provider: NetworkProvider.VINAPHONE, category: ['Sảnh Rồng'], status: 'sold', score: 9.9 },
  { id: '7', phoneNumber: '0911.22.33.44', price: 3000000, provider: NetworkProvider.VINAPHONE, category: ['Taxi', 'Lặp'], status: 'available', score: 8.0 },
  { id: '8', phoneNumber: '0833.555.777', price: 4500000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa'], status: 'available', score: 8.2 },
];
