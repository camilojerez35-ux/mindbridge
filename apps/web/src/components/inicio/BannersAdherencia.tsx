'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, BookOpen, Wind, BarChart2, Calendar } from 'lucide-react';

type Stats = {
  diasSinDiario:    number | null;
  diasSinAnimo:     number | null;
  diasSinEjercicio: number | null;
  proximaCita:      { fechaHora: string; horasRestantes: number } | null;
};

type Banner = {
  id: string;
  icon: React.ReactNode;
  mensaje: string;
  href: string;
  cta: string;
  color: string;
};

export default function BannersAdherencia() {
  const [stats, setStats]         = useState<Stats | null>(null);
  const [descartados, setDescartados] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const banners: Banner[] = [];

  if (stats.proximaCita && stats.proximaCita.horasRestantes <= 24 && stats.proximaCita.horasRestantes > 0) {
    const hrs = stats.proximaCita.horasRestantes;
    banners.push({
      id: 'cita',
      icon: <Calendar className="w-4 h-4 text-teal-400" />,
      mensaje: `Tienes una cita en ${hrs < 2 ? 'menos de 2 horas' : `${hrs} horas`}. Prepárate con anticipación.`,
      href: '/dashboard/citas',
      cta: 'Ver cita',
      color: 'border-teal-500/25 bg-teal-500/5',
    });
  }

  if (stats.diasSinDiario !== null && stats.diasSinDiario >= 3) {
    banners.push({
      id: 'diario',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      mensaje: `Llevas ${stats.diasSinDiario} días sin escribir en tu diario. ¿Cómo has estado?`,
      href: '/dashboard/diario',
      cta: 'Escribir hoy',
      color: 'border-indigo-500/25 bg-indigo-500/5',
    });
  }

  if (stats.diasSinAnimo !== null && stats.diasSinAnimo >= 2) {
    banners.push({
      id: 'animo',
      icon: <BarChart2 className="w-4 h-4 text-amber-400" />,
      mensaje: `No has registrado tu ánimo en ${stats.diasSinAnimo} días. Solo toma 30 segundos.`,
      href: '/dashboard/progreso',
      cta: 'Registrar ánimo',
      color: 'border-amber-500/25 bg-amber-500/5',
    });
  }

  if (stats.diasSinEjercicio !== null && stats.diasSinEjercicio >= 5) {
    banners.push({
      id: 'ejercicio',
      icon: <Wind className="w-4 h-4 text-emerald-400" />,
      mensaje: `Han pasado ${stats.diasSinEjercicio} días desde tu último ejercicio. ¿Hacemos uno?`,
      href: '/dashboard/ejercicios',
      cta: 'Hacer ejercicio',
      color: 'border-emerald-500/25 bg-emerald-500/5',
    });
  }

  const visibles = banners.filter(b => !descartados.has(b.id));
  if (visibles.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibles.slice(0, 2).map(banner => (
        <div
          key={banner.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${banner.color} transition-all`}
        >
          <div className="flex-shrink-0">{banner.icon}</div>
          <p className="flex-1 text-sm text-gray-400 leading-snug">{banner.mensaje}</p>
          <Link
            href={banner.href}
            className="flex-shrink-0 text-xs font-bold text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors"
          >
            {banner.cta}
          </Link>
          <button
            onClick={() => setDescartados(s => new Set([...s, banner.id]))}
            className="flex-shrink-0 p-1 text-gray-700 hover:text-gray-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
