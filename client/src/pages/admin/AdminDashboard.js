import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/admin/stats').then((res) => setStats(res.data.stats)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-loader">Loading dashboard...</p>;

  const maxMonthly = Math.max(...(stats.monthlyRevenue.map((m) => m.total) || [1]), 1);

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Total Books</h4>
          <p>{stats.totalBooks}</p>
        </div>
        <div className="stat-card">
          <h4>Total Orders</h4>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h4>Revenue</h4>
          <p>₹{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="admin-nav-links">
        <Link to="/admin/books" className="btn-primary">Manage Books</Link>
        <Link to="/admin/orders" className="btn-primary">Manage Orders</Link>
        <Link to="/admin/users" className="btn-primary">Manage Users</Link>
      </div>

      <section className="chart-section">
        <h3>Orders by Status</h3>
        <div className="simple-bar-chart">
          {stats.ordersByStatus.map((s) => (
            <div key={s._id} className="bar-row">
              <span className="bar-label">{s._id}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(s.count / stats.totalOrders) * 100}%` }}
                />
              </div>
              <span className="bar-value">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="chart-section">
        <h3>Revenue (Last 6 Months)</h3>
        <div className="simple-bar-chart">
          {stats.monthlyRevenue.length === 0 && <p>No revenue data yet.</p>}
          {stats.monthlyRevenue.map((m) => (
            <div key={`${m._id.year}-${m._id.month}`} className="bar-row">
              <span className="bar-label">{m._id.month}/{m._id.year}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(m.total / maxMonthly) * 100}%` }} />
              </div>
              <span className="bar-value">₹{m.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
