'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, LogOut, LayoutDashboard, UserCog } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'English Tests', href: '/tests', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '256px',
        background: '#111827',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>English Quiz</h1>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                background: isActive ? '#2563eb' : 'transparent',
                color: isActive ? 'white' : '#9ca3af',
                textDecoration: 'none',
              }}
            >
              <item.icon style={{ width: '20px', height: '20px' }} />
              {item.name}
            </Link>
          );
        })}
        {user?.role === 'admin' && (
          <Link
            href="/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              background: pathname === '/users' ? '#2563eb' : 'transparent',
              color: pathname === '/users' ? 'white' : '#9ca3af',
              textDecoration: 'none',
            }}
          >
            <UserCog style={{ width: '20px', height: '20px' }} />
            Quản lý User
          </Link>
        )}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #1f2937' }}>
        {user && (
          <div style={{ marginBottom: '16px', padding: '0 12px' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Đã đăng nhập</p>
            <p style={{ color: 'white', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
              {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            color: '#9ca3af',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#1f2937';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          <LogOut style={{ width: '20px', height: '20px' }} />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
