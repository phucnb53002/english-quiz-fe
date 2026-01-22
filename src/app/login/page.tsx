'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen } from 'lucide-react';
import { authApi } from '@/lib/api-routes';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastProvider';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      const token = response.access_token;
      
      const userResponse = await fetch('http://localhost:3001/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        login(token, userData);
        addToast('Đăng nhập thành công!', 'success');
        router.push('/tests');
      } else {
        addToast('Lấy thông tin người dùng thất bại', 'error');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast(err.response?.data?.message || 'Đăng nhập thất bại', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <BookOpen style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '8px',
            }}
          >
            English Quiz
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            Đăng nhập để tiếp tục
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                {...register('email')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.email ? '#ef4444' : '#d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.password ? '#ef4444' : '#d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.password && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '14px',
                background: isLoading
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '8px',
              }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin"
                    style={{ width: '20px', height: '20px' }}
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              Tài khoản demo:
            </p>
            <p style={{ fontSize: '13px', color: '#334155', textAlign: 'center' }}>
              Email: <strong>admin@gmail.com</strong>
            </p>
            <p style={{ fontSize: '13px', color: '#334155', textAlign: 'center' }}>
              Mật khẩu: <strong>Admin@123</strong>
            </p>
          </div>

          <p
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748b',
            }}
          >
            Chưa có tài khoản?{' '}
            <a
              href="/register"
              style={{
                color: '#667eea',
                fontWeight: 500,
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
