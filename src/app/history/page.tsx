'use client';

import { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { resultsApi } from '@/lib/api-routes';
import { Result } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastProvider';

export default function HistoryPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<{
    totalSubmissions: number;
    averageScore: number;
    bestScore: number;
    recentResults: Result[];
  }>({
    totalSubmissions: 0,
    averageScore: 0,
    bestScore: 0,
    recentResults: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, statsData] = await Promise.all([
          resultsApi.getMyHistory(),
          resultsApi.getMyStats(),
        ]);
        setResults(historyData);
        setStats(statsData);
      } catch {
        addToast('Không thể tải lịch sử thi', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return '#22c55e';
    if (percentage >= 40) return '#eab308';
    return '#ef4444';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Lịch sử thi</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
          Xem lại lịch sử làm bài thi của bạn
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Số lần thi</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{stats.totalSubmissions}</p>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Điểm trung bình</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{stats.averageScore}%</p>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Điểm cao nhất</p>
            <p style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{stats.bestScore}%</p>
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
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Lịch sử làm bài</h2>
        </div>

        {results.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            Bạn chưa làm bài thi nào
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Ngày thi</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Số câu đúng</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Điểm số</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Thời gian</th>
                  <th style={{ padding: '14px 24px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result._id} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '16px 24px', color: '#374151', fontSize: '14px' }}>
                      {new Date(result.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontWeight: 600, color: '#22c55e' }}>{result.score}</span>
                      <span style={{ color: '#9ca3af' }}>/{result.total}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          background: `${getScoreColor(result.percentage)}20`,
                          color: getScoreColor(result.percentage),
                        }}
                      >
                        {result.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '14px' }}>
                      <Clock style={{ width: '16px', height: '16px', display: 'inline', marginRight: '4px' }} />
                      {formatTime(result.timeSpent)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedResult(result)}
                        style={{
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Eye style={{ width: '16px', height: '16px' }} />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedResult && (
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
          onClick={() => setSelectedResult(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto',
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
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Chi tiết kết quả</h2>
              <button
                onClick={() => setSelectedResult(null)}
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

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: `${getScoreColor(selectedResult.percentage)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `4px solid ${getScoreColor(selectedResult.percentage)}`,
                  }}
                >
                  <span style={{ fontSize: '28px', fontWeight: 700, color: getScoreColor(selectedResult.percentage) }}>
                    {selectedResult.percentage}%
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', color: '#374151' }}>
                  Bạn trả lời đúng <strong style={{ color: '#22c55e' }}>{selectedResult.score}</strong> / {selectedResult.total} câu
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  Ngày thi: {new Date(selectedResult.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
