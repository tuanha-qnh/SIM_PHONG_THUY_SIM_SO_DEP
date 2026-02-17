import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { SimCard, Order } from '../types.ts';
import { MOCK_SIMS } from './mockData.ts';

// Placeholder config - User needs to replace this
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "vnpt-sim-phong-thuy.firebaseapp.com",
  projectId: "vnpt-sim-phong-thuy",
  storageBucket: "vnpt-sim-phong-thuy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase only if config is valid/present effectively
// For this demo code, we will toggle between MOCK and REAL based on a flag
const USE_MOCK = true; // Set to FALSE when you have real Firebase config

let db: any;
if (!USE_MOCK && firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export const getSims = async (): Promise<SimCard[]> => {
  if (USE_MOCK) return MOCK_SIMS;
  
  try {
    const q = query(collection(db, 'sims'), where('status', '==', 'available'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimCard));
  } catch (e) {
    console.error("Error fetching sims:", e);
    return [];
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const newOrder = {
    ...order,
    status: 'new',
    createdAt: Date.now()
  };

  if (USE_MOCK) {
    console.log("Mock Order Created:", newOrder);
    return "mock-order-id-" + Date.now();
  }

  try {
    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    return docRef.id;
  } catch (e) {
    console.error("Error creating order:", e);
    throw e;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  if (USE_MOCK) {
    // Return some mock orders for admin demo
    return [
      { id: '101', simId: '1', phoneNumber: '0912.345.678', price: 5000000, customerName: 'Nguyễn Văn A', customerPhone: '0909000000', address: 'Hà Nội', status: 'new', createdAt: Date.now() - 86400000 },
      { id: '102', simId: '3', phoneNumber: '0919.39.79.39', price: 2500000, customerName: 'Trần Thị B', customerPhone: '0909111222', address: 'TP.HCM', status: 'completed', createdAt: Date.now() - 172800000 },
    ] as Order[];
  }

  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (e) {
    console.error("Error fetching orders:", e);
    return [];
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  if (USE_MOCK) {
    console.log(`Mock Update Order ${orderId} to ${status}`);
    return;
  }
  
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (e) {
    console.error("Error updating order:", e);
    throw e;
  }
};