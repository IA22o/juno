# Reporte de Codebase — JUNO (Buscador Jurídico)

> Generado el 2026-04-01. Para uso interno al implementar nuevas funciones.

---

## 1. Visión general

**JUNO** es un portal de búsqueda jurídica para derecho español y europeo. Permite al usuario hacer consultas en lenguaje natural y obtiene respuestas estructuradas consultando LLMs externos (con citas a BOE, CENDOJ, DGT, EUR-Lex, etc.).

- **Stack**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 3
- **Deploy**: Vercel (`juno-lilac.vercel.app`)
- **Fonts**: Cormorant Garamond (`--font-display`), Source Serif 4 (`--font-body`), IBM Plex Mono (`--font-mono`)
- **Idioma**: Español (interfaz y sistema prompt)

---

## 2. Estructura de archivos

```
juno/
├── app/
│   ├── layout.tsx              # Root layout, fuentes, metadata SEO
│   ├── page.tsx                # Shell principal (toda la lógica de UI)
│   ├── globals.css             # Variables CSS custom (--navy, --gold, etc.)
│   └── api/
│       └── search/
│           └── route.ts        # POST /api/search — orquesta proveedores LLM
├── components/
│   ├── BetaBanner.tsx          # Banner de aviso beta (dismissable via localStorage)
│   ├── Footer.tsx              # Footer con disclaimer legal
│   ├── Hero.tsx                # Pantalla inicial con sugerencias de consulta
│   ├── LoadingSkeleton.tsx     # Skeleton animado mientras carga la respuesta
│   ├── MessageList.tsx         # Lista de mensajes user/assistant con Markdown
│   └── SearchInput.tsx         # Textarea de consulta con autoresize y contador
├── lib/
│   ├── perplexity.ts           # Cliente Perplexity API (modelo: sonar)
│   ├── nvidia.ts               # Cliente NVIDIA NIM (modelo: llama-3.1-70b-instruct)
│   ├── openrouter.ts           # Cliente OpenRouter (modelo: deepseek-r1:free)
│   └── prompts.ts              # System prompt jurídico compartido por todos los proveedores
└── types/
    └── index.ts                # Tipos globales TypeScript
```

---

## 3. Flujo de búsqueda (request lifecycle)

```
Usuario escribe consulta
        │
        ▼
SearchInput.tsx  ──onSubmit──▶  page.tsx (handleSubmit)
                                    │
                                    ├─ Añade mensaje user a estado `messages`
                                    ├─ Añade query a `queryHistory` (sidebar)
                                    ├─ POST /api/search  { query, history }
                                    │
                                    ▼
                             app/api/search/route.ts
                                    │
                                    ├─ Valida body (query requerida, max 2000 chars)
                                    ├─ Intenta proveedores en cascada:
                                    │     1. callPerplexity()  → sonar
                                    │     2. callNvidia()      → llama-3.1-70b
                                    │     3. callOpenRouter()  → deepseek-r1:free
                                    │
                                    └─ Devuelve: { answer, sources, provider,
                                                   updatedHistory, conversationId }
                                    │
                                    ▼
                             page.tsx recibe respuesta
                                    │
                                    ├─ Añade mensaje assistant a `messages`
                                    └─ Actualiza `apiHistory` (contexto conversacional)
```

---

## 4. Estado de `page.tsx`

| Estado | Tipo | Descripción |
|---|---|---|
| `messages` | `Message[]` | Todos los mensajes visibles en pantalla |
| `query` | `string` | Valor controlado del textarea |
| `isLoading` | `boolean` | Bloquea envíos mientras hay petición activa |
| `error` | `string \| null` | Mensaje de error mostrado en UI |
| `apiHistory` | `HistoryEntry[]` | Historial serializado que se envía al API en cada turno |
| `sidebarOpen` | `boolean` | Controla visibilidad del panel lateral |
| `queryHistory` | `string[]` | Lista de queries anteriores (solo texto, para el sidebar) |
| `abortControllerRef` | `ref` | Permite cancelar fetch en curso |

---

## 5. API Route — `POST /api/search`

**Archivo**: `app/api/search/route.ts`

**Request body**:
```ts
{ query: string; history?: Array<{ role: string; content: string }> }
```

**Response body** (200):
```ts
{
  answer: string;
  sources: string[];
  provider: 'perplexity' | 'nvidia' | 'openrouter';
  updatedHistory: Array<{ role: string; content: string }>;
  conversationId: string;   // formato: "conv_<timestamp>_<random>"
}
```

**Errores**:
- `400 INVALID_JSON` — body no es JSON válido
- `400 MISSING_QUERY` — falta el campo query
- `400 QUERY_TOO_LONG` — supera 2000 caracteres
- `503 ALL_PROVIDERS_FAILED` — los 3 proveedores fallaron

**CORS**: headers abiertos (`*`) en todos los métodos.

---

## 6. Proveedores LLM (`lib/`)

Todos los proveedores comparten:
- El mismo `LEGAL_SYSTEM_PROMPT` de `lib/prompts.ts`
- Patrón `AbortController` con timeout de **25 segundos**
- Firma: `(query: string, history: {role, content}[]) => Promise<{ answer: string; sources: string[] }>`

| Proveedor | Modelo | Sources | Env var |
|---|---|---|---|
| Perplexity | `sonar` | `data.citations[]` (real) | `PERPLEXITY_API_KEY` |
| NVIDIA NIM | `meta/llama-3.1-70b-instruct` | `[]` (vacío) | `NVIDIA_API_KEY` |
| OpenRouter | `deepseek/deepseek-r1:free` | `[]` (vacío) | `OPENROUTER_API_KEY` |

**Nota importante**: Solo Perplexity devuelve `sources` reales. NVIDIA y OpenRouter devuelven array vacío.

---

## 7. Sistema Prompt (`lib/prompts.ts`)

Prompt extenso (~60 líneas) que instruye al modelo a:
- Actuar como jurista senior ("GENERA Legal Intelligence")
- Consultar y citar siempre: BOE, CENDOJ, DGT/TEAC, EUR-Lex, boletines autonómicos, TC, Congreso
- Seguir estructura obligatoria: **Resumen ejecutivo** → **Fundamento normativo** → **Jurisprudencia relevante** → **Criterio práctico** → **Fuentes consultadas**
- Usar español jurídico formal, citar URLs verificables, distinguir normativa vigente/derogada
- Incluir aviso legal al final

---

## 8. Componentes UI

### `SearchInput.tsx`
- Textarea con **autoresize** (1–5 líneas)
- Modo controlado (`value` + `onChange`) y no-controlado
- Límite: 2000 chars, aviso en 1800 (`--gold`), error en >2000 (rojo)
- `Enter` envía · `Shift+Enter` nueva línea
- Botón submit con estado loading (spinner `Loader2`)

### `MessageList.tsx`
- Renderiza mensajes `user` (burbuja derecha) y `assistant` (card completa izquierda)
- Usa `ReactMarkdown` para el contenido del asistente
- Detecta fuentes mencionadas en el texto con regex → muestra **pills de fuente** (BOE, CENDOJ, DGT/TEAC, EUR-Lex, CC.AA., Tribunal Supremo)
- Badge "Prototipo Beta" + disclaimer en cada respuesta
- Auto-scroll al último mensaje

### `Hero.tsx`
- Pantalla inicial (cuando no hay mensajes)
- 6 sugerencias hardcoded como botones que llaman `onSelectSuggestion`
- Pills decorativas de fuentes jurídicas

### `LoadingSkeleton.tsx`
- 4 shimmer lines + punto pulsante + texto animado con puntos suspensivos

### `BetaBanner.tsx`
- Banner dismissable que persiste en `localStorage` con key `juno-beta-banner-dismissed`

### `Sidebar` (inline en `page.tsx`)
- Panel lateral con historial de queries (`queryHistory`)
- Al hacer clic en una query, la pone en el input (no la re-envía)
- Solo visible cuando `hasMessages === true`

---

## 9. Tipos globales (`types/index.ts`)

```ts
Message          // { id, role, content, createdAt }
ConversationTurn // { id, query, answer, sources, model, createdAt, durationMs? }
Source           // { title, url, snippet?, publishedDate?, type? }
SearchResponse   // { answer, sources, model, durationMs, conversationId }
ApiError         // { error, code?, status }
ModelProvider    // 'perplexity' | 'nvidia-nim' | 'openrouter'
LegalSourceType  // 'legislation' | 'jurisprudencia' | 'doctrina' | 'boe' | 'doue' | 'other'
SearchRequestBody// { query, conversationId?, history? }
```

> **Nota**: Hay divergencia entre `types/index.ts` (tipos "ideales") y los tipos inline usados en `page.tsx` y `route.ts`. Los tipos de `types/index.ts` no están siendo importados actualmente en ningún archivo.

---

## 10. Variables de entorno necesarias

```env
PERPLEXITY_API_KEY=...
NVIDIA_API_KEY=...
OPENROUTER_API_KEY=...
NEXT_PUBLIC_APP_URL=https://juno-lilac.vercel.app   # opcional, tiene fallback
```

---

## 11. Diseño visual (tokens CSS)

Definidos en `globals.css` como variables CSS:

| Variable | Uso |
|---|---|
| `--navy` | Fondo principal (azul oscuro) |
| `--navy-light` | Fondo de cards y sidebar |
| `--gold` | Color de acento principal |
| `--gold-light` | Hover de acento |
| `--border` | Bordes sutiles |
| `--text-primary` | Texto principal |
| `--text-secondary` | Texto secundario/hints |
| `--font-display` | Cormorant Garamond |
| `--font-body` | Source Serif 4 |
| `--font-mono` | IBM Plex Mono |

Animaciones CSS definidas en globals: `fade-in`, `slide-up`, `shimmer-base`, `pulse-ring`.

---

## 12. Puntos de extensión relevantes para nuevas funciones

- **Añadir un nuevo proveedor LLM**: crear `lib/nuevo.ts` con la misma firma, añadirlo al array `providers` en `route.ts`.
- **Cambiar el sistema prompt**: editar `lib/prompts.ts` — afecta a todos los proveedores simultáneamente.
- **Añadir fuentes detectadas en pills**: añadir entrada al array `SOURCE_PATTERNS` en `MessageList.tsx`.
- **Añadir sugerencias en el Hero**: modificar el array `SUGGESTIONS` en `Hero.tsx`.
- **Modificar la estructura de la respuesta API**: cambiar `SearchResponseBody` en `route.ts` y `ApiResponse` en `page.tsx` (están desincronizados de `types/index.ts`).
- **Conversación multi-turno**: ya implementada vía `apiHistory` / `updatedHistory`. El contexto completo se envía en cada request.
- **Streaming**: `eventsource-parser` está en las dependencias pero **no está implementado**. La llamada actual es blocking (`await response.json()`).
