import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Menu, ShieldCheck } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
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
              <a href="#" className="hover:text-yellow-300 transition-colors">Sim Năm Sinh</a>
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
            
            <button className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-white text-lg font-bold mb-4">VNPT VINAPHONE</h4>
            <p className="text-sm leading-relaxed">
              Tổng kho Sim số đẹp lớn nhất Việt Nam. Hỗ trợ đăng ký chính chủ, giao sim tận nơi miễn phí toàn quốc.
            </p>
          </div>
          <div>
            <h4 className="text-white text-lg font-bold mb-4">HỖ TRỢ KHÁCH HÀNG</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Hướng dẫn mua sim</a></li>
              <li><a href="#" className="hover:text-white">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-white">Kiểm tra đơn hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-lg font-bold mb-4">LIÊN HỆ</h4>
            <p className="text-sm mb-2">Hotline: 1800 1091</p>
            <p className="text-sm">Email: cskh@vnpt.vn</p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
          &copy; 2024 VNPT Sim Phong Thủy. All rights reserved. Designed by Gemini Engineer.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
