# CotizaNet

Cotizaciones, pedidos y cobranza para PyMEs mexicanas.

## 🚀 Características

- **Gestión de clientes**: Mantén un registro completo de tus clientes
- **Cotizaciones profesionales**: Crea y envía cotizaciones en minutos
- **Seguimiento de pedidos**: Visualiza el estado de cada pedido
- **Inventario básico**: Controla tu stock y recibe alertas
- **Cobranza simplificada**: Registra pagos y calcula saldos
- **Billing SaaS**: Sistema de suscripciones con Mercado Pago

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Base de datos**: Prisma ORM + Supabase Postgres
- **Despliegue**: Vercel
- **Pagos**: Mercado Pago Checkout Pro
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (o PostgreSQL)
- Cuenta de Mercado Pago (para pagos)

## 🚦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd cotizanet
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cotizanet"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"
MERCADOPAGO_ACCESS_TOKEN="tu-token-mercadopago"
MERCADOPAGO_WEBHOOK_SECRET="tu-webhook-secret"
MERCADOPAGO_PUBLIC_KEY="tu-public-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Inicializa la base de datos:
```bash
npm run db:push
npm run db:seed
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
cotizanet/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts               # Datos de prueba
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/              # API Routes
│   │   ├── dashboard/         # Panel del cliente
│   │   ├── admin/             # Panel de administración
│   │   └── (public)/         # Páginas públicas
│   ├── components/
│   │   └── ui/              # Componentes shadcn/ui
│   └── lib/
│       ├── auth.ts             # Funciones de autenticación
│       ├── prisma.ts           # Cliente de Prisma
│       ├── utils.ts            # Utilidades
│       └── design-tokens.ts    # Tokens de diseño
├── public/                   # Archivos estáticos
└── vercel.json              # Configuración de Vercel
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Construcción
npm run build            # Construye para producción
npm run start             # Inicia servidor de producción

# Base de datos
npm run db:generate      # Genera cliente de Prisma
npm run db:push         # Sincroniza esquema con DB
npm run db:migrate       # Crea y aplica migraciones
npm run db:seed         # Puebla DB con datos de prueba
npm run db:studio        # Abre Prisma Studio

# Linting
npm run lint             # Ejecuta ESLint
```

## 🎨 Design System

El proyecto utiliza un design system profesional y sobrio, diseñado para PyMEs mexicanas:

- **Colores**: Paleta azul profesional con semántica clara
- **Tipografía**: Inter con escala consistente
- **Espaciado**: Sistema de espaciado predefinido
- **Componentes**: shadcn/ui con personalizaciones
- **Accesibilidad**: WCAG AA, focus states visibles, contraste suficiente

Ver [`src/lib/design-tokens.ts`](src/lib/design-tokens.ts) para más detalles.

## 🔐 Seguridad

- Autenticación con cookies HTTP-only
- Contraseñas hasheadas con bcrypt
- Middleware para protección de rutas
- Aislamiento multi-tenant por companyId
- Validación de inputs con Zod

## 📊 Modelo de Datos

### Entidades Principales

- **Users**: Usuarios y roles (owner, admin)
- **Companies**: Empresas multi-tenant
- **Customers**: Clientes del negocio
- **Items**: Productos/inventario
- **Quotes**: Cotizaciones
- **Orders**: Pedidos
- **Subscriptions**: Suscripciones SaaS
- **Invoices**: Facturas de cobro
- **Leads**: Prospectos de venta

Ver [`prisma/schema.prisma`](prisma/schema.prisma) para el esquema completo.

## 🔄 Flujo de Billing

1. **Registro**: Usuario se registra con plan piloto (15 días gratis)
2. **Ciclo de facturación**: Cron job diario detecta vencimientos
3. **Gracia**: 5 días para pagar sin suspensión
4. **Suspensión**: Si no paga, se suspende el acceso
5. **Reactivación**: Pago automático reactiva la cuenta

## 🌐 Despliegue

### Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente en cada push

### Variables de Entorno Requeridas

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📝 Credenciales de Prueba

Después de ejecutar `npm run db:seed`:

**Admin:**
- Email: admin@cotizanet.com
- Password: admin123

**Usuario:**
- Email: test@empresa.com
- Password: test123

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de CotizaNet. Todos los derechos reservados.

## 📞 Soporte

- Email: quickbotstudios@gmail.com
- Saltillo Coahuila Mexico

---

Desarrollado con ❤️ para las PyMEs mexicanas
