# JUNO — Asistente de Inteligencia Legal

> Plataforma de búsqueda y análisis legal basada en IA, construida con Next.js 16 y la API de Perplexity.

**Demo en producción:** [juno-lilac.vercel.app](https://juno-lilac.vercel.app)

---

## Stack tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS + shadcn/ui
- **IA / Búsqueda:** Perplexity API (principal) · NVIDIA NIM · OpenRouter (fallback)
- **Lenguaje:** TypeScript
- **Despliegue:** Vercel

---

## Estructura del proyecto

```
juno/
├── app/              # Rutas y layouts (Next.js App Router)
├── components/       # Componentes React reutilizables
├── lib/              # Utilidades, clientes API, helpers
├── marketing/        # Páginas y assets de landing/marketing
├── types/            # Tipos TypeScript globales
├── AGENT.md          # Reglas de comportamiento del agente IA
├── SOUL.md           # Personalidad y tono de JUNO
└── REPORTE_CODEBASE.md  # Documentación técnica del codebase
```

---

## Primeros pasos (setup local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/IA22o/juno.git
cd juno
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus claves:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

| Variable | Descripción | Obligatoria |
|---|---|---|
| `PERPLEXITY_API_KEY` | Clave de la API de Perplexity (motor principal) | Sí |
| `NVIDIA_API_KEY` | Clave NVIDIA NIM (fallback) | No |
| `OPENROUTER_API_KEY` | Clave OpenRouter (fallback) | No |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app | No |

> **Cómo obtener la clave de Perplexity:** Ve a [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) y genera una API key.

### 4. Arrancar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Linting con ESLint |
| `npm run type-check` | Verificación de tipos TypeScript |

---

## Documentación adicional

- [`AGENT.md`](./AGENT.md) — Comportamiento operativo del agente: capacidades, limitaciones y reglas no negociables.
- [`SOUL.md`](./SOUL.md) — Personalidad, tono y voz de JUNO.
- [`REPORTE_CODEBASE.md`](./REPORTE_CODEBASE.md) — Informe técnico detallado del codebase.

---

## Flujo de trabajo para colaboradores

1. Crea una rama desde `main` con el formato `feature/nombre-feature` o `fix/descripcion`.
2. Haz tus cambios y asegúrate de que `npm run lint` y `npm run type-check` pasan sin errores.
3. Abre un Pull Request hacia `main` con una descripción clara de los cambios.
4. Espera revisión antes de hacer merge.

---

## Requisitos

- Node.js >= 18
- npm >= 9
- Cuenta en [Perplexity AI](https://www.perplexity.ai/) con acceso a la API
