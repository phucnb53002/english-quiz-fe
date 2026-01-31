import { ReactNode } from 'react';
import { Providers } from '../providers';
import { UserRoute } from '@/components/UserRoute';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function HistoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Providers>
      <UserRoute>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
          <Sidebar />
          <div style={{ flex: 1, marginLeft: '256px' }}>
            <Header />
            <main style={{ paddingTop: '64px', minHeight: 'calc(100vh - 64px)', background: '#f9fafb' }}>
              {children}
            </main>
          </div>
        </div>
      </UserRoute>
    </Providers>
  );
}
