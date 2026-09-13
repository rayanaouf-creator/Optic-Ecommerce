import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$12,426.00', icon: DollarSign, trend: '+14%' },
    { name: 'Active Orders', value: '42', icon: ShoppingCart, trend: '+5%' },
    { name: 'Total Products', value: '124', icon: Package, trend: '0%' },
    { name: 'New Customers', value: '18', icon: Users, trend: '+22%' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Orders</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-4 font-medium">Order ID</th>
                <th className="pb-4 font-medium">Customer</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { id: '#ORD-0921', name: 'Alex Johnson', date: 'Oct 24, 2026', amount: '$245.00', status: 'Processing' },
                { id: '#ORD-0920', name: 'Maria Garcia', date: 'Oct 23, 2026', amount: '$125.00', status: 'Shipped' },
                { id: '#ORD-0919', name: 'James Smith', date: 'Oct 23, 2026', amount: '$310.00', status: 'Delivered' },
                { id: '#ORD-0918', name: 'Emma Davis', date: 'Oct 22, 2026', amount: '$145.00', status: 'Delivered' },
              ].map((order) => (
                <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-4 font-medium text-slate-900">{order.id}</td>
                  <td className="py-4 text-slate-600">{order.name}</td>
                  <td className="py-4 text-slate-500">{order.date}</td>
                  <td className="py-4 text-slate-900 font-medium">{order.amount}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
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
  );
}
