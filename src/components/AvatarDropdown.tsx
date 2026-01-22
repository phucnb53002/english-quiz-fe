'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserCog, User, LogOut, ChevronDown } from 'lucide-react';

export function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative', zIndex: 50 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px',
          borderRadius: '9999px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
        className="hover:bg-gray-100 transition-colors"
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <ChevronDown
          style={{
            width: '16px',
            height: '16px',
            color: '#6b7280',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            width: '224px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            padding: '8px 0',
          }}
          className="z-50"
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>

          {user.role === 'admin' ? (
            <button
              onClick={() => handleNavigate('/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-50 transition-colors"
            >
              <UserCog style={{ width: '16px', height: '16px' }} />
              Quản lý user
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
              }}
              className="hover:bg-gray-50 transition-colors"
            >
              <User style={{ width: '16px', height: '16px' }} />
              Thông tin cá nhân
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              fontSize: '14px',
              color: '#dc2626',
              cursor: 'pointer',
            }}
            className="hover:bg-red-50 transition-colors"
          >
            <LogOut style={{ width: '16px', height: '16px' }} />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
