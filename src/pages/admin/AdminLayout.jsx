// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../styles/admin.css';

export default function AdminLayout() {
  return (
    <div className="admin-root">
      <header className="admin-topnav">
        <div className="admin-brand">Admin Panel</div>
        <nav className="admin-nav">
          <NavLink to="/admin/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Users</NavLink>
          <NavLink to="/admin/withdrawals" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Withdrawals</NavLink>
          <NavLink to="/admin/payments" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Payments</NavLink>
          <NavLink to="/admin/messages" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Messages</NavLink>
          <NavLink to="/admin/notifications" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Notifications</NavLink>
        </nav>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
