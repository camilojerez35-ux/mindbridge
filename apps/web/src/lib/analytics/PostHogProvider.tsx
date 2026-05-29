'use client';

/**
 * Provider de PostHog para el cliente (browser).
 * Envuelve la app para capturar page views y eventos del lado del cliente.
 */
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, Suspense } from 'react';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    // Nunca trackear query params que puedan contener datos clínicos
    const url = window.origin + pathname;
    ph.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

function PostHogUserIdentify() {
  const { data: session } = useSession();
  const ph = usePostHog();

  useEffect(() => {
    // Solo identificar si el usuario aceptó el consentimiento de marketing/analytics
    if (!ph || !session?.user?.id || !session.user.consentimientoDatos) return;
    ph.identify(session.user.id, {
      plan: session.user.plan,
      rol: session.user.rol,
    });
  }, [session, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const { data: session } = useSession();

  // Esperar el consentimiento antes de inicializar PostHog (Ley 1581/2012)
  const consentimientoOtorgado = session?.user?.consentimientoDatos ?? false;

  useEffect(() => {
    if (!key || !consentimientoOtorgado) return;
    if (posthog.__loaded) return; // ya inicializado — no reinicializar
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      // Privacidad: no capturar valores de inputs (pueden contener datos clínicos)
      mask_all_text: false,
      mask_all_element_attributes: false,
      capture_pageview: false, // lo hacemos manualmente arriba
      capture_pageleave: true,
      persistence: 'localStorage',
      // No grabar sesiones por defecto — datos de salud
      disable_session_recording: true,
      loaded: () => {},
    });
  }, [key, consentimientoOtorgado]);

  if (!key || !consentimientoOtorgado) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
        <PostHogUserIdentify />
      </Suspense>
      {children}
    </PHProvider>
  );
}
