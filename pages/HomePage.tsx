import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, X } from 'lucide-react';
import SimItem from '../components/SimItem';
import { getSims, createOrder } from '../services/firebaseService';
import { analyzeSimFengShui } from '../services/geminiService';
import { SimCard, FengShuiAnalysis } from '../types';

const HomePage: React.FC = () => {
  const [sims, setSims] = useState<SimCard[]>([]);
  const [filteredSims, setFilteredSims] = useState<SimCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSim, setSelectedSim] = useState<SimCard | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Analysis State
  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('Nam');
  const [analysisResult, setAnalysisResult] = useState<FengShuiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadSims();
  }, []);

  useEffect(() => {
    const results = sims.filter(sim => 
      sim.phoneNumber.replace(/\./g, '').includes(searchTerm.replace(/\./g, ''))
    );
    setFilteredSims(results);
  }, [searchTerm, sims]);

  const loadSims = async () => {
    const data = await getSims();
    setSims(data);
    setFilteredSims(data);
  };

  const handleBuyClick = (sim: SimCard) => {
    setSelectedSim(sim);
    setShowOrderModal(true);
    setOrderStatus('idle');
  };

  const handleAnalyzeClick = (sim: SimCard) => {
    setSelectedSim(sim);
    setAnalysisResult(null);
    setShowAnalysisModal(true);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSim) return;
    setOrderStatus('submitting');
    
    try {
      await createOrder({
        simId: selectedSim.id,
        phoneNumber: selectedSim.phoneNumber,
        price: selectedSim.price,
        customerName,
        customerPhone,
        address
      });
      setOrderStatus('success');
      setTimeout(() => {
        setShowOrderModal(false);
        setCustomerName('');
        setAddress('');
      }, 2000);
    } catch (error) {
      alert("Lỗi đặt hàng. Vui lòng thử lại.");
      setOrderStatus('idle');
    }
  };

  const runAnalysis = async () => {
    if (!selectedSim || !birthYear) return;
    setIsAnalyzing(true);
    const result = await analyzeSimFengShui(selectedSim.phoneNumber, birthYear, gender);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <div className="bg-gradient-to-r from-vnpt-primary to-vnpt-secondary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tìm Sim Số Đẹp - Hợp Phong Thủy</h1>
          <p className="text-blue-100 mb-8">Kho sim Vinaphone lớn nhất, hỗ trợ đăng ký chính chủ. Tra cứu phong thủy Kinh Dịch miễn phí.</p>
          
          <div className="bg-white p-2 rounded-lg shadow-lg flex items-center">
            <Search className="text-gray-400 w-6 h-6 ml-2" />
            <input 
              type="text"
              placeholder="Nhập số sim bạn muốn tìm (VD: 091*888, *6789)..."
              className="flex-grow px-4 py-3 text-gray-800 outline-none placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-vnpt-accent text-blue-900 font-bold px-6 py-3 rounded hover:bg-yellow-400 transition-colors">
              TÌM KIẾM
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-blue-200">Gợi ý:</span>
            <button onClick={() => setSearchTerm('091')} className="underline hover:text-white">Đầu 091</button>
            <button onClick={() => setSearchTerm('888')} className="underline hover:text-white">Tam hoa 888</button>
            <button onClick={() => setSearchTerm('6789')} className="underline hover:text-white">Sảnh tiến</button>
          </div>
        </div>
      </div>

      {/* Filter Bar (Mock UI) */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Bộ lọc:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <select className="border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
            <option>Mức giá: Tất cả</option>
            <option>Dưới 500K</option>
            <option>500K - 1 Triệu</option>
            <option>1 - 5 Triệu</option>
            <option>Trên 10 Triệu</option>
          </select>
          <select className="border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
            <option>Loại Sim: Tất cả</option>
            <option>Tam Hoa</option>
            <option>Tứ Quý</option>
            <option>Lộc Phát</option>
          </select>
          <select className="border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white">
            <option>Mạng: Vinaphone</option>
          </select>
        </div>
      </div>

      {/* Sim Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-vnpt-primary pl-3">Sim Số Đẹp Mới Về</h2>
        {filteredSims.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredSims.map(sim => (
              <SimItem 
                key={sim.id} 
                sim={sim} 
                onBuy={handleBuyClick} 
                onAnalyze={handleAnalyzeClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            Không tìm thấy sim nào phù hợp với từ khóa "{searchTerm}"
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedSim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="bg-vnpt-primary p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Đặt Mua Sim</h3>
              <button onClick={() => setShowOrderModal(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6">
              {orderStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-green-700 mb-2">Đặt hàng thành công!</h4>
                  <p className="text-gray-600">Chúng tôi sẽ liên hệ lại với bạn sớm nhất để xác nhận.</p>
                </div>
              ) : (
                <form onSubmit={submitOrder} className="space-y-4">
                  <div className="text-center mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-500">Số Sim</p>
                    <p className="text-2xl font-bold text-vnpt-primary">{selectedSim.phoneNumber}</p>
                    <p className="text-red-600 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedSim.price)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input required type="text" className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại liên hệ *</label>
                    <input required type="tel" className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="09xxxxxxxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận sim</label>
                    <textarea className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã..." />
                  </div>

                  <button 
                    disabled={orderStatus === 'submitting'}
                    type="submit" 
                    className="w-full bg-vnpt-primary text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {orderStatus === 'submitting' ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && selectedSim && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center"><Sparkles className="w-5 h-5 mr-2" /> Luận Phong Thủy AI</h3>
              <button onClick={() => setShowAnalysisModal(false)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-gray-800">{selectedSim.phoneNumber}</span>
              </div>

              {!analysisResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Năm sinh gia chủ</label>
                      <input type="number" className="w-full border rounded px-3 py-2" value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="VD: 1990" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                      <select className="w-full border rounded px-3 py-2" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={runAnalysis}
                    disabled={isAnalyzing || !birthYear}
                    className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-300 flex justify-center items-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang phân tích...
                      </>
                    ) : 'Xem Kết Quả'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="text-gray-600">Điểm phong thủy:</span>
                    <span className="text-2xl font-bold text-red-600">{analysisResult.score}/10</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800">Ngũ hành: <span className="text-blue-600">{analysisResult.element}</span></h4>
                    
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700 border border-blue-100">
                      <p className="font-bold mb-1">Lời bình:</p>
                      <p>{analysisResult.interpretation}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-sm text-gray-700 border border-green-100">
                      <p className="font-bold mb-1">Hợp tuổi:</p>
                      <p>{analysisResult.compatibility}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAnalysisResult(null)}
                    className="w-full text-indigo-600 text-sm hover:underline mt-4"
                  >
                    Phân tích lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
