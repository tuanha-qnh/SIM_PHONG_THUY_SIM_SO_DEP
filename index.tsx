import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Phone, Menu, ShieldCheck, ShoppingCart, Star, Search, Filter, Sparkles, X, Shield, Package, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';

// --- TYPES ---
enum NetworkProvider {
  VINAPHONE = 'Vinaphone',
  VIETTEL = 'Viettel',
  MOBIFONE = 'Mobifone',
  OTHER = 'Other'
}

interface SimCard {
  id: string;
  phoneNumber: string;
  price: number;
  provider: NetworkProvider;
  category: string[];
  description?: string;
  score?: number;
  status: 'available' | 'sold' | 'pending';
}

interface Order {
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

interface FengShuiAnalysis {
  score: number;
  element: string;
  interpretation: string;
  compatibility: string;
}

// --- MOCK DATA ---
const MOCK_SIMS: SimCard[] = [
  { id: '1', phoneNumber: '0912.345.678', price: 5000000, provider: NetworkProvider.VINAPHONE, category: ['Sảnh Tiến', 'Phong Thủy'], status: 'available', score: 9.5 },
  { id: '2', phoneNumber: '0918.888.999', price: 15000000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa', 'Lộc Phát'], status: 'available', score: 9.8 },
  { id: '3', phoneNumber: '0919.39.79.39', price: 2500000, provider: NetworkProvider.VINAPHONE, category: ['Thần Tài'], status: 'available', score: 8.5 },
  { id: '4', phoneNumber: '0888.666.888', price: 8000000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa', 'Kép'], status: 'available', score: 9.0 },
  { id: '5', phoneNumber: '0915.11.02.02', price: 1200000, provider: NetworkProvider.VINAPHONE, category: ['Năm Sinh', 'Dễ Nhớ'], status: 'available', score: 7.5 },
  { id: '6', phoneNumber: '0945.678.910', price: 9000000, provider: NetworkProvider.VINAPHONE, category: ['Sảnh Rồng'], status: 'sold', score: 9.9 },
  { id: '7', phoneNumber: '0911.22.33.44', price: 3000000, provider: NetworkProvider.VINAPHONE, category: ['Taxi', 'Lặp'], status: 'available', score: 8.0 },
  { id: '8', phoneNumber: '0833.555.777', price: 4500000, provider: NetworkProvider.VINAPHONE, category: ['Tam Hoa'], status: 'available', score: 8.2 },
];

// --- SERVICES ---

// Firebase Service
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "vnpt-sim-phong-thuy.firebaseapp.com",
  projectId: "vnpt-sim-phong-thuy",
  storageBucket: "vnpt-sim-phong-thuy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const USE_MOCK = true; 
let db: any;
if (!USE_MOCK && firebaseConfig.apiKey) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

const getSims = async (): Promise<SimCard[]> => {
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

const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const newOrder = { ...order, status: 'new', createdAt: Date.now() };
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

const getOrders = async (): Promise<Order[]> => {
  if (USE_MOCK) {
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

const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
  if (USE_MOCK) return;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (e) {
    console.error("Error updating order:", e);
    throw e;
  }
};

// Gemini Service
const apiKey = process.env.API_KEY || ''; 
const analyzeSimFengShui = async (phoneNumber: string, birthYear: string, gender: string): Promise<FengShuiAnalysis> => {
  if (!apiKey) {
    return new Promise(resolve => setTimeout(() => resolve({
      score: 8.5,
      element: "Kim",
      interpretation: "Sim này mang lại sự cân bằng, tài lộc ổn định. (Chế độ Demo - Hãy nhập API Key để có kết quả thực)",
      compatibility: "Hợp với người mệnh Thủy và Thổ."
    }), 1500));
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Đóng vai một chuyên gia phong thủy kinh dịch Việt Nam. Hãy phân tích số điện thoại ${phoneNumber} cho chủ nhân sinh năm ${birthYear}, giới tính ${gender}. Trả về JSON: { "score": number, "element": string, "interpretation": string, "compatibility": string }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            element: { type: Type.STRING },
            interpretation: { type: Type.STRING },
            compatibility: { type: Type.STRING },
          }
        }
      }
    });
    return JSON.parse(response.text) as FengShuiAnalysis;
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 5, element: "N/A", interpretation: "Lỗi kết nối AI.", compatibility: "N/A" };
  }
};

// --- COMPONENTS ---

// SimItem
const SimItem: React.FC<{ sim: SimCard; onBuy: (s: SimCard) => void; onAnalyze: (s: SimCard) => void }> = ({ sim, onBuy, onAnalyze }) => {
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 bg-vnpt-light border-b border-gray-200 text-center">
        <h3 className="text-2xl font-bold text-vnpt-primary tracking-wide">{sim.phoneNumber}</h3>
        <div className="mt-1 flex justify-center space-x-2">
           {sim.category.map((cat, idx) => (
             <span key={idx} className="text-xs bg-white text-vnpt-secondary px-2 py-0.5 rounded-full border border-blue-200">{cat}</span>
           ))}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="mb-4 text-center">
          <p className="text-xl font-bold text-red-600">{formatPrice(sim.price)}</p>
          {sim.score && (
            <div className="flex items-center justify-center mt-2 text-yellow-500 font-medium">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span>{sim.score}/10 Phong Thủy</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button onClick={() => onAnalyze(sim)} className="px-3 py-2 text-sm text-vnpt-secondary bg-white border border-vnpt-secondary rounded hover:bg-blue-50 transition-colors flex items-center justify-center">
            <Star className="w-4 h-4 mr-1" /> Xem P.Thủy
          </button>
          <button onClick={() => onBuy(sim)} className="px-3 py-2 text-sm text-white bg-vnpt-primary rounded hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-200">
            <ShoppingCart className="w-4 h-4 mr-1" /> Đặt Mua
          </button>
        </div>
      </div>
    </div>
  );
};

// Layout
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-vnpt-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-white p-1.5 rounded-full group-hover:rotate-12 transition-transform">
                <Phone className="w-6 h-6 text-vnpt-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tighter leading-none">VNPT SIM</span>
                <span className="text-xs text-blue-200 tracking-widest uppercase">Phong Thủy</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6 font-medium">
              <Link to="/" className="hover:text-yellow-300 transition-colors">Trang Chủ</Link>
              <Link to="/feng-shui" className="hover:text-yellow-300 transition-colors">Công Cụ Phong Thủy</Link>
              <a href="#" className="hover:text-yellow-300 transition-colors">Sim Số Đẹp</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="tel:18001091" className="hidden lg:flex items-center bg-white/10 px-3 py-1 rounded-full text-sm font-semibold hover:bg-white/20">
                <Phone className="w-4 h-4 mr-2" /> Hotline: 1800 1091
              </a>
              {!isAdmin && (
                <Link to="/admin" className="text-sm opacity-60 hover:opacity-100 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 VNPT Sim Phong Thủy</p>
        </div>
      </footer>
    </div>
  );
};

// --- PAGES ---

// Admin Page
const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert('Sai thông tin! (Gợi ý: admin/admin)');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> Mới</span>;
      case 'processing': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><Package className="w-3 h-3 mr-1"/> Đang xử lý</span>;
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Hoàn thành</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Đã hủy</span>;
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-vnpt-primary">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-vnpt-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">Quản Trị Viên</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-sm font-medium">Tài khoản</label><input type="text" className="w-full border p-2 rounded mt-1" value={username} onChange={e => setUsername(e.target.value)}/></div>
            <div><label className="block text-sm font-medium">Mật khẩu</label><input type="password" className="w-full border p-2 rounded mt-1" value={password} onChange={e => setPassword(e.target.value)}/></div>
            <button type="submit" className="w-full bg-vnpt-primary text-white py-2 rounded font-bold">Đăng Nhập</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center"><Package className="mr-2" /> Quản Lý Đơn Hàng</h1>
        <button onClick={fetchOrders} className="text-sm bg-gray-200 px-3 py-1 rounded">Làm mới</button>
      </div>
      {loading ? <div>Đang tải...</div> : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 uppercase text-xs"><tr><th className="px-6 py-3">Mã</th><th className="px-6 py-3">Sim</th><th className="px-6 py-3">Khách</th><th className="px-6 py-3">Giá</th><th className="px-6 py-3">Trạng thái</th><th className="px-6 py-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 truncate max-w-[80px]">{o.id}</td>
                  <td className="px-6 py-4 font-bold text-vnpt-primary">{o.phoneNumber}</td>
                  <td className="px-6 py-4"><div>{o.customerName}</div><div className="text-xs text-gray-500">{o.customerPhone}</div></td>
                  <td className="px-6 py-4 text-red-600 font-bold">{new Intl.NumberFormat('vi-VN').format(o.price)}</td>
                  <td className="px-6 py-4">{getStatusBadge(o.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {o.status === 'new' && <button onClick={() => handleStatusUpdate(o.id, 'processing')} className="text-yellow-600 mr-2">Xử lý</button>}
                    {o.status === 'processing' && <button onClick={() => handleStatusUpdate(o.id, 'completed')} className="text-green-600">Hoàn tất</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Feng Shui Page
const FengShuiPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('Nam');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FengShuiAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!phone || !year) return;
    setLoading(true);
    const data = await analyzeSimFengShui(phone, year, gender);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10"><h1 className="text-3xl font-bold">Công Cụ Phong Thủy AI</h1></div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-vnpt-primary">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div><label>Số điện thoại</label><input className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} required/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label>Năm sinh</label><input type="number" className="w-full border rounded p-2" value={year} onChange={e => setYear(e.target.value)} required/></div>
              <div><label>Giới tính</label><select className="w-full border rounded p-2" value={gender} onChange={e => setGender(e.target.value)}><option>Nam</option><option>Nữ</option></select></div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-vnpt-primary text-white font-bold py-3 rounded">{loading ? 'Đang Xử Lý...' : 'Xem Kết Quả'}</button>
          </form>
        </div>
        <div>
           {result ? (
             <div className="bg-white p-6 rounded-xl shadow">
               <div className="text-center mb-4"><span className="text-4xl font-bold text-red-600">{result.score}/10</span></div>
               <p><strong>Ngũ Hành:</strong> {result.element}</p>
               <p className="my-2"><strong>Bình Giải:</strong> {result.interpretation}</p>
               <p><strong>Lời Khuyên:</strong> {result.compatibility}</p>
             </div>
           ) : <div className="text-center text-gray-500 py-10">Nhập thông tin để xem kết quả</div>}
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomePage: React.FC = () => {
  const [sims, setSims] = useState<SimCard[]>([]);
  const [filteredSims, setFilteredSims] = useState<SimCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('Nam');
  const [analysisResult, setAnalysisResult] = useState<FengShuiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => { loadSims(); }, []);
  useEffect(() => {
    setFilteredSims(sims.filter(s => s.phoneNumber.replace(/\./g,'').includes(searchTerm.replace(/\./g,''))));
  }, [searchTerm, sims]);

  const loadSims = async () => { setSims(await getSims()); setFilteredSims(await getSims()); };
  const handleBuyClick = (sim: SimCard) => { setSelectedSim(sim); setShowOrderModal(true); setOrderStatus('idle'); };
  const handleAnalyzeClick = (sim: SimCard) => { setSelectedSim(sim); setAnalysisResult(null); setShowAnalysisModal(true); };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSim) return;
    setOrderStatus('submitting');
    await createOrder({ simId: selectedSim.id, phoneNumber: selectedSim.phoneNumber, price: selectedSim.price, customerName, customerPhone, address });
    setOrderStatus('success');
    setTimeout(() => { setShowOrderModal(false); setCustomerName(''); setAddress(''); }, 2000);
  };

  const runAnalysis = async () => {
    if (!selectedSim || !birthYear) return;
    setIsAnalyzing(true);
    setAnalysisResult(await analyzeSimFengShui(selectedSim.phoneNumber, birthYear, gender));
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-vnpt-primary to-vnpt-secondary rounded-2xl p-8 text-white shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Tìm Sim Số Đẹp</h1>
        <div className="bg-white p-2 rounded-lg flex items-center max-w-2xl mx-auto">
          <Search className="text-gray-400 ml-2" />
          <input className="flex-grow px-4 py-2 text-gray-800 outline-none" placeholder="Nhập số sim..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button className="bg-vnpt-accent text-blue-900 font-bold px-4 py-2 rounded">Tìm Kiếm</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSims.map(sim => <SimItem key={sim.id} sim={sim} onBuy={handleBuyClick} onAnalyze={handleAnalyzeClick} />)}
      </div>

      {showOrderModal && selectedSim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Đặt Mua {selectedSim.phoneNumber}</h3><button onClick={() => setShowOrderModal(false)}><X /></button></div>
            {orderStatus === 'success' ? <div className="text-green-600 text-center font-bold">Đặt hàng thành công!</div> : (
              <form onSubmit={submitOrder} className="space-y-3">
                <input required className="w-full border p-2 rounded" placeholder="Họ tên" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                <input required className="w-full border p-2 rounded" placeholder="Số điện thoại" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                <textarea className="w-full border p-2 rounded" placeholder="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} />
                <button type="submit" disabled={orderStatus === 'submitting'} className="w-full bg-vnpt-primary text-white font-bold py-2 rounded">Xác Nhận</button>
              </form>
            )}
          </div>
        </div>
      )}

      {showAnalysisModal && selectedSim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Phong Thủy {selectedSim.phoneNumber}</h3><button onClick={() => setShowAnalysisModal(false)}><X /></button></div>
             {!analysisResult ? (
               <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   <input className="border p-2 rounded" placeholder="Năm sinh (1990)" value={birthYear} onChange={e => setBirthYear(e.target.value)} />
                   <select className="border p-2 rounded" value={gender} onChange={e => setGender(e.target.value)}><option>Nam</option><option>Nữ</option></select>
                 </div>
                 <button onClick={runAnalysis} disabled={isAnalyzing} className="w-full bg-indigo-600 text-white font-bold py-2 rounded">{isAnalyzing ? '...' : 'Phân Tích'}</button>
               </div>
             ) : (
               <div className="space-y-2">
                 <div className="text-center text-3xl font-bold text-red-600">{analysisResult.score}/10</div>
                 <p><strong>Ngũ Hành:</strong> {analysisResult.element}</p>
                 <p><strong>Luận:</strong> {analysisResult.interpretation}</p>
                 <p><strong>Hợp:</strong> {analysisResult.compatibility}</p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP ENTRY ---
const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/feng-shui" element={<FengShuiPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
