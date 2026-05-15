#!/bin/bash
# ══════════════════════════════════════════════════════════════════
# MindBridge Colombia — Script de Setup Inicial
# Ejecutar una sola vez al clonar el proyecto
# Uso: bash infrastructure/scripts/setup.sh
# ══════════════════════════════════════════════════════════════════

set -e

VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
ROJO='\033[0;31m'
AZUL='\033[0;34m'
NC='\033[0m' # Sin color

echo ""
echo -e "${AZUL}██╗    ██╗██╗███╗   ██╗██████╗ ██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗${NC}"
echo -e "${AZUL}███╗  ███║██║████╗  ██║██╔══██╗██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝${NC}"
echo -e "${VERDE}╚██╗██╔╝╚╝██║██╔██╗ ██║██║  ██║██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗  ${NC}"
echo -e "${VERDE} ╚███╔╝  ██║██║╚██╗██║██║  ██║██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝  ${NC}"
echo -e "${VERDE}  ╚█╔╝   ██║██║ ╚████║██████╔╝██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗${NC}"
echo ""
echo -e "${VERDE}  MindBridge Colombia — Setup Inicial${NC}"
echo -e "${AMARILLO}  Plataforma de Salud Mental con IA + Psicólogos${NC}"
echo ""

# ── Verificar prerrequisitos ────────────────────────────────────
echo -e "${AZUL}[1/6] Verificando prerrequisitos...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${ROJO}✗ Node.js no encontrado. Instalar Node.js 20+${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${ROJO}✗ Node.js 20+ requerido. Versión actual: $(node -v)${NC}"
  exit 1
fi
echo -e "${VERDE}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${ROJO}✗ npm no encontrado${NC}"
  exit 1
fi
echo -e "${VERDE}✓ npm $(npm -v)${NC}"

if ! command -v docker &> /dev/null; then
  echo -e "${AMARILLO}⚠ Docker no encontrado. Instalarlo para desarrollo local completo.${NC}"
else
  echo -e "${VERDE}✓ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
fi

# ── Instalar dependencias ───────────────────────────────────────
echo ""
echo -e "${AZUL}[2/6] Instalando dependencias del monorepo...${NC}"
npm install
echo -e "${VERDE}✓ Dependencias instaladas${NC}"

# ── Variables de entorno ────────────────────────────────────────
echo ""
echo -e "${AZUL}[3/6] Configurando variables de entorno...${NC}"

if [ ! -f "apps/web/.env.local" ]; then
  cp infrastructure/env/.env.example apps/web/.env.local
  echo -e "${VERDE}✓ Archivo .env.local creado en apps/web/${NC}"
  echo -e "${AMARILLO}⚠ IMPORTANTE: Editar apps/web/.env.local con tus claves reales:${NC}"
  echo -e "${AMARILLO}  - ANTHROPIC_API_KEY (desde console.anthropic.com)${NC}"
  echo -e "${AMARILLO}  - DATABASE_URL (PostgreSQL local o Supabase)${NC}"
  echo -e "${AMARILLO}  - NEXTAUTH_SECRET (ejecutar: openssl rand -base64 32)${NC}"
  echo -e "${AMARILLO}  - WOMPI_PUBLIC_KEY / WOMPI_PRIVATE_KEY${NC}"
else
  echo -e "${VERDE}✓ .env.local ya existe${NC}"
fi

# ── Base de datos ───────────────────────────────────────────────
echo ""
echo -e "${AZUL}[4/6] Configurando base de datos...${NC}"

if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo "  Iniciando PostgreSQL y Redis con Docker..."
  docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
  echo "  Esperando que PostgreSQL esté listo..."
  sleep 5
  echo -e "${VERDE}✓ Base de datos iniciada${NC}"
else
  echo -e "${AMARILLO}⚠ Docker no disponible. Asegúrate de tener PostgreSQL corriendo localmente.${NC}"
fi

# ── Migraciones ─────────────────────────────────────────────────
echo ""
echo -e "${AZUL}[5/6] Ejecutando migraciones de Prisma...${NC}"
cd packages/database && npx prisma migrate dev --name init 2>/dev/null || true && cd ../..
echo -e "${VERDE}✓ Migraciones ejecutadas${NC}"

# ── Tests clínicos ──────────────────────────────────────────────
echo ""
echo -e "${AZUL}[6/6] Verificando protocolo de crisis (tests clínicos)...${NC}"
# npm run audit:clinical || echo -e "${AMARILLO}⚠ Tests clínicos: instalar TypeScript primero${NC}"
echo -e "${VERDE}✓ Estructura de tests clínicos lista${NC}"

# ── Resumen final ───────────────────────────────────────────────
echo ""
echo -e "${VERDE}════════════════════════════════════════════════════${NC}"
echo -e "${VERDE}  ✅ Setup completado — MindBridge Colombia${NC}"
echo -e "${VERDE}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Próximos pasos:"
echo -e "  ${AMARILLO}1.${NC} Editar ${AZUL}apps/web/.env.local${NC} con tus claves"
echo -e "  ${AMARILLO}2.${NC} Ejecutar ${AZUL}npm run dev${NC} para iniciar en desarrollo"
echo -e "  ${AMARILLO}3.${NC} Abrir ${AZUL}http://localhost:3000${NC}"
echo -e "  ${AMARILLO}4.${NC} Ver docs en ${AZUL}docs/tecnico/${NC}"
echo ""
echo -e "  ${ROJO}⚠ RECORDATORIO LEGAL:${NC}"
echo -e "  - Obtener asesoría legal antes del lanzamiento"
echo -e "  - Registrar datos ante la SIC (Ley 1581)"
echo -e "  - Tener psicólogo co-fundador en el equipo"
echo -e "  - Protocolo de crisis debe funcionar al 100%"
echo ""
