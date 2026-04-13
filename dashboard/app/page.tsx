"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, TrendingUp, CreditCard, Sparkles } from 'lucide-react';

type Order = {
  id: number;
  first_name: string;
  phone: string;
  total_sum: number;
  status: string;
  created_at: string;
};

// Маппер цветов для разных статусов
const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    'new': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'offer-analog': 'bg-purple-50 text-purple-700 border-purple-200',
    'canceled': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки данных:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="w-8 h-8 text-indigo-500 mb-4 animate-spin" />
          <p className="text-slate-500 font-medium">Загрузка магии Tomyris AI...</p>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_sum) || 0), 0);
  const averageCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Берем только 12 последних заказов для графика, чтобы он не слипался, и переворачиваем для хронологии
  const chartData = orders.slice(0, 12).reverse().map(order => ({
    name: order.first_name || `Заказ #${order.id}`,
    value: Number(order.total_sum) || 0
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Шапка */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                Tomyris AI
              </span>
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Аналитика продаж в реальном времени</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
              Live from Supabase
            </span>
          </div>
        </header>

        {/* Карточки со статистикой */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Карточка 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 rounded-xl">
                <Package size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Всего заказов</p>
                <p className="text-3xl font-bold text-slate-800">{totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Карточка 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-xl">
                <TrendingUp size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Общая выручка</p>
                <p className="text-3xl font-bold text-slate-800">{totalRevenue.toLocaleString('ru-RU')} ₸</p>
              </div>
            </div>
          </div>

          {/* Карточка 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 rounded-xl">
                <CreditCard size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Средний чек</p>
                <p className="text-3xl font-bold text-slate-800">{averageCheck.toLocaleString('ru-RU')} ₸</p>
              </div>
            </div>
          </div>
        </div>

        {/* График и Таблица */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Блок графика */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Выручка (последние 12 заказов)</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value.toLocaleString('ru-RU')}`}
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    width={60}
                  />
                  <Tooltip
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(value: any) => [`${Number(value).toLocaleString('ru-RU')} ₸`, 'Сумма']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#colorUv)" />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Таблица последних заказов */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[380px]">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Последние транзакции</h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Клиент</th>
                    <th className="py-3 px-4 text-right">Сумма</th>
                    <th className="py-3 px-4 text-center">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">#{order.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{order.first_name || 'Без имени'}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {Number(order.total_sum).toLocaleString('ru-RU')} ₸
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}