'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { usersApi, testsApi } from '@/lib/api-routes';
import { User, Question } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  easyQuestions: number;
  mediumQuestions: number;
  hardQuestions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQuestions: 0,
    easyQuestions: 0,
    mediumQuestions: 0,
    hardQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, questions] = await Promise.all([
          usersApi.getAll().catch(() => []),
          testsApi.getAll().catch(() => []),
        ]);

        setStats({
          totalUsers: users.length,
          totalQuestions: questions.length,
          easyQuestions: questions.filter((q: Question) => q.level === 'easy').length,
          mediumQuestions: questions.filter((q: Question) => q.level === 'medium').length,
          hardQuestions: questions.filter((q: Question) => q.level === 'hard').length,
        });
      } catch {
        console.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Tổng câu hỏi',
      value: stats.totalQuestions,
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    },
    {
      title: 'Câu hỏi dễ',
      value: stats.easyQuestions,
      icon: CheckCircle,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      title: 'Câu hỏi trung bình',
      value: stats.mediumQuestions,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    },
    {
      title: 'Câu hỏi khó',
      value: stats.hardQuestions,
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Tổng quan hệ thống English Quiz</p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {statCards.map((stat) => (
            <div
              key={stat.title}
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <stat.icon style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{stat.title}</p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Tính năng hệ thống</h2>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                borderLeft: '3px solid #22c55e',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>Xác thực và phân quyền người dùng</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                borderLeft: '3px solid #22c55e',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>Phân quyền theo vai trò (Admin/User)</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                borderLeft: '3px solid #22c55e',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>Quản lý câu hỏi thi tiếng Anh</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                borderLeft: '3px solid #22c55e',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>Hỗ trợ câu hỏi trắc nghiệm đa dạng</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                borderLeft: '3px solid #22c55e',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>Ba mức độ khó (Dễ/Trung bình/Khó)</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Thao tác nhanh</h2>
          </div>
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {user?.role === 'admin' && (
              <a
                href="/users"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '24px 16px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                  }}
                >
                  <Users style={{ width: '28px', height: '28px', color: '#6366f1' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#4338ca' }}>Quản lý User</span>
              </a>
            )}
            <a
              href="/tests"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 16px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                }}
              >
                <BookOpen style={{ width: '28px', height: '28px', color: '#22c55e' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>Thi tiếng Anh</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
