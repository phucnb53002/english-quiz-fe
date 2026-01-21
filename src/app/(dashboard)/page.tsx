'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { usersApi, testsApi } from '@/lib/api-routes';
import { User, Question } from '@/types';

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
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Easy Questions',
      value: stats.easyQuestions,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
    {
      title: 'Medium Questions',
      value: stats.mediumQuestions,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Hard Questions',
      value: stats.hardQuestions,
      icon: BookOpen,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your English Exam system</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="System Features">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>User Authentication & Authorization</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Role-based Access Control (Admin/User)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>English Test Question Management</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multiple Choice Questions Support</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Three Difficulty Levels (Easy/Medium/Hard)</span>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/users"
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Users className="w-8 h-8 text-blue-600" />
              <span className="font-medium text-blue-900">Manage Users</span>
            </a>
            <a
              href="/tests"
              className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-green-600" />
              <span className="font-medium text-green-900">Manage Tests</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
