'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastProvider';
import { api } from '@/lib/api';
import { Lock, User, Mail } from 'lucide-react';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialPasswordForm: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>(initialPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      addToast('Đổi mật khẩu thành công', 'success');
      setIsPasswordModalOpen(false);
      setPasswordForm(initialPasswordForm);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Thông tin cá nhân</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 600,
              margin: '0 auto 20px',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            {user.name}
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              textTransform: 'capitalize',
              background: user.role === 'admin' ? '#f3e8ff' : '#dbeafe',
              padding: '6px 16px',
              borderRadius: '20px',
              display: 'inline-block',
              color: user.role === 'admin' ? '#7c3aed' : '#2563eb',
            }}
          >
            {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </p>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '32px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
            Thông tin tài khoản
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <User style={{ width: '24px', height: '24px', color: '#6b7280' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Họ và tên</p>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '15px' }}>{user.name}</p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <Mail style={{ width: '24px', height: '24px', color: '#6b7280' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Email</p>
                <p style={{ fontWeight: 500, color: '#111827', fontSize: '15px' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Lock style={{ width: '18px', height: '18px' }} />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 50,
          }}
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Đổi mật khẩu</h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: passwordErrors.currentPassword ? '#ef4444' : '#d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {passwordErrors.currentPassword && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label
                  style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: passwordErrors.newPassword ? '#ef4444' : '#d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {passwordErrors.newPassword && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label
                  style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: passwordErrors.confirmPassword ? '#ef4444' : '#d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {passwordErrors.confirmPassword && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: isSubmitting
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting && (
                    <svg className="animate-spin" style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
