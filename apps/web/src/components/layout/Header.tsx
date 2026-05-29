// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Bell, Menu, MessageSquare, HelpCircle } from 'lucide-react';

export default function Header() {
  const [greeting, setGreeting] = useState('');
  const { data: session } = useSession();

  const nombre = session?.user?.name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? '';
  const iniciales = session?.user?.name
    ? session.user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : nombre.slice(0, 2).toUpperCase();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('buenos días');
    else if (hour < 18) setGreeting('buenas tardes');
    else setGreeting('buenas noches');
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100">
      {/* Saludo y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:w-1/2">
        <div className="sm:hidden">
            <Menu className="w-6 h-6 text-stone-600 cursor-pointer hover:text-stone-800 transition" />
        </div>
        <h1 className="text-xl font-medium text-stone-700">
          {nombre ? <>Hola, {nombre} <span className="font-light">({greeting})</span> 👋</> : <>Hola <span className="font-light">({greeting})</span> 👋</>}
        </h1>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar recursos, ejercicios..."
            className="pl-9 pr-4 py-2 w-64 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Iconos de acción y Perfil */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-stone-500 hover:text-stone-700 transition">
            <MessageSquare className="w-5 h-5" />
        </button>
        <button className="p-2 text-stone-500 hover:text-stone-700 transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full border border-white"></span>
        </button>
        <button className="p-2 text-stone-500 hover:text-stone-700 transition">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div
          className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 cursor-pointer hover:border-teal-400 transition"
          aria-label={`Perfil de ${nombre || 'usuario'}`}
        >
          {session?.user?.image
            ? <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            : <span className="text-teal-700 font-medium text-sm">{iniciales || '?'}</span>
          }
        </div>
      </div>
    </header>
  );
}
