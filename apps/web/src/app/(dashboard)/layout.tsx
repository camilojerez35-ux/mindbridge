import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import DashboardClient from './DashboardClient';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <DashboardClient
      userName={session.user.name ?? session.user.email}
      userPlan={session.user.plan}
      userInitial={(session.user.name ?? session.user.email ?? 'U')[0].toUpperCase()}
    >
      {children}
    </DashboardClient>
  );
}
