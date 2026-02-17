import React, { useState } from 'react';
import { analyzeSimFengShui } from '../services/geminiService.ts';
import { FengShuiAnalysis } from '../types.ts';
import { Sparkles, ArrowRight } from 'lucide-react';

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
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Công Cụ Định Giá Sim Phong Thủy</h1>
        <p className="text-gray-600">Sử dụng trí tuệ nhân tạo (AI) kết hợp tinh hoa Kinh Dịch để chấm điểm số điện thoại.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-vnpt-primary">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Số điện thoại cần xem</label>
              <input 
                type="tel" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-lg focus:border-vnpt-primary outline-none"
                placeholder="VD: 0912345678"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Năm sinh</label>
                <input 
                  type="number" 
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-vnpt-primary outline-none"
                  placeholder="1990"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                <select 
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-vnpt-primary outline-none bg-white"
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-vnpt-primary text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-transform active:scale-95 disabled:bg-gray-400 flex items-center justify-center text-lg"
            >
              {loading ? 'Đang Luận Giải...' : 'XEM PHONG THỦY NGAY'}
              {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
          </form>
        </div>

        <div>
           {result ? (
             <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
               <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 text-white text-center">
                 <p className="text-sm opacity-90">Kết quả phân tích cho số</p>
                 <h2 className="text-3xl font-bold tracking-wider">{phone}</h2>
               </div>
               
               <div className="p-6 space-y-6">
                 <div className="text-center">
                   <div className="inline-block relative">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={result.score >= 8 ? "#22c55e" : result.score >= 5 ? "#eab308" : "#ef4444"} strokeWidth="8" strokeDasharray={`${result.score * 28.27} 283`} />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-800">{result.score}</span>
                        <span className="text-xs text-gray-500">trên 10</span>
                      </div>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <div className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 p-1 rounded mr-3 mt-1"><Sparkles className="w-4 h-4"/></span>
                      <div>
                        <h4 className="font-bold text-gray-800">Ngũ Hành</h4>
                        <p className="text-gray-600">{result.element}</p>
                      </div>
                   </div>
                   <div className="flex items-start">
                      <span className="bg-green-100 text-green-800 p-1 rounded mr-3 mt-1"><Sparkles className="w-4 h-4"/></span>
                      <div>
                        <h4 className="font-bold text-gray-800">Bình Giải</h4>
                        <p className="text-gray-600 text-justify">{result.interpretation}</p>
                      </div>
                   </div>
                   <div className="flex items-start">
                      <span className="bg-purple-100 text-purple-800 p-1 rounded mr-3 mt-1"><Sparkles className="w-4 h-4"/></span>
                      <div>
                        <h4 className="font-bold text-gray-800">Lời Khuyên</h4>
                        <p className="text-gray-600 text-justify">{result.compatibility}</p>
                      </div>
                   </div>
                 </div>
               </div>
             </div>
           ) : (
             <div className="h-full bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500">
               <Sparkles className="w-16 h-16 text-blue-200 mb-4" />
               <p className="text-lg">Nhập thông tin bên cạnh để xem luận giải chi tiết về số điện thoại của bạn.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default FengShuiPage;