import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav }: LayoutProps) {
  return (
    <div className="min-h-screen bg-sabai-dark text-sabai-text">
      <main className={hideNav ? '' : 'pb-20'}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
