import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/firebaseService.ts';
import { Order } from '../types.ts';
import { Shield, Package, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert('Sai thông tin đăng nhập! (Gợi ý: admin/admin)');
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
    fetchOrders(); // Refresh
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-vnpt-primary">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-vnpt-primary mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">Quản Trị Viên</h2>
            <p className="text-gray-500 text-sm">Đăng nhập để quản lý đơn hàng</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tài khoản</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input 
                type="password" 
                className="w-full border p-2 rounded mt-1 outline-none focus:border-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-vnpt-primary text-white py-2 rounded hover:bg-blue-700 transition-colors font-bold">
              Đăng Nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> Mới</span>;
      case 'processing': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><Package className="w-3 h-3 mr-1"/> Đang xử lý</span>;
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Hoàn thành</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Đã hủy</span>;
      default: return status;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Package className="mr-2" /> Quản Lý Đơn Hàng
        </h1>
        <button 
          onClick={fetchOrders} 
          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-gray-700"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Mã ĐH</th>
                  <th className="px-6 py-3">Số Sim</th>
                  <th className="px-6 py-3">Khách hàng</th>
                  <th className="px-6 py-3">Giá</th>
                  <th className="px-6 py-3">Ngày đặt</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[100px]" title={order.id}>{order.id}</td>
                    <td className="px-6 py-4 font-bold text-vnpt-primary">{order.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.customerName}</div>
                      <div className="text-xs">{order.customerPhone}</div>
                      <div className="text-xs truncate max-w-[150px] text-gray-400">{order.address}</div>
                    </td>
                    <td className="px-6 py-4 text-red-600 font-bold">
                      {new Intl.NumberFormat('vi-VN').format(order.price)}đ
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'new' && (
                        <div className="flex justify-end space-x-2">
                           <button onClick={() => handleStatusUpdate(order.id, 'processing')} className="text-yellow-600 hover:underline">Xử lý</button>
                           <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="text-red-600 hover:underline">Hủy</button>
                        </div>
                      )}
                      {order.status === 'processing' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="text-green-600 hover:underline">Hoàn tất</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-400">Chưa có đơn hàng nào</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;