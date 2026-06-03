import { Suspense } from 'react';

// useSearchParams() en Client Components requiere Suspense en Next.js 14
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
