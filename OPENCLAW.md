# JUNO para OpenClaw

> Este documento es una introducción privada al proyecto. Está pensado para que el equipo de OpenClaw entienda qué hemos construido, cómo funciona y por qué creemos que hay algo valioso aquí para explorar juntos.

---

## El problema que resuelve JUNO

Cualquier profesional jurídico en España sabe lo que cuesta responder una pregunta aparentemente simple: *¿Está vigente este artículo? ¿Qué dice el Tribunal Supremo sobre esto? ¿Cómo aplica esta directiva europea en Cataluña?*

Las herramientas existentes — Westlaw, Aranzadi, CENDOJ, el propio BOE — están fragmentadas. Cada una guarda una pieza del puzzle. El jurista tiene que ir de una a otra, contrastar manualmente y redactar la respuesta desde cero.

**JUNO hace todo eso en una sola consulta, en lenguaje natural, en segundos.**

---

## Qué es JUNO

JUNO es un **buscador jurídico de precisión crítica** para derecho español y europeo.

No es un chatbot genérico que responde con Wikipedia jurídica. Es un analizador que:

- Consulta fuentes primarias reales: **BOE, CENDOJ, EUR-Lex, DGT, TEAC, boletines autonómicos**
- Estructura cada respuesta en: Resumen ejecutivo → Fundamento normativo → Jurisprudencia relevante → Criterio práctico → Fuentes consultadas
- Distingue explícitamente si una norma está **VIGENTE / MODIFICADA / DEROGADA**
- Mantiene contexto conversacional: puede recibir preguntas de seguimiento sin perder el hilo
- Nunca inventa citas. Si no tiene la referencia, lo declara.

**Demo en vivo (acceso libre, sin registro):** https://juno-lilac.vercel.app

---

## Estado actual del proyecto

| Aspecto | Estado |
|---|---|
| Frontend (Next.js 16 + React 19 + TypeScript) | Funcional en producción |
| Motor de búsqueda (Perplexity `sonar`) | Activo |
| Fallback automático (NVIDIA NIM + OpenRouter) | Implementado |
| Conversación multi-turno | Implementado |
| Sistema prompt jurídico (~60 reglas) | Afinado y operativo |
| Diseño visual (identidad naval + dorado) | Terminado |
| Autenticación / usuarios | Pendiente |
| Historial persistente | Pendiente |
| Streaming de respuestas | Pendiente (librería instalada, no activada) |

Estamos en **beta pública**. El motor funciona. La interfaz está pulida. Lo que falta es el siguiente bloque: saber qué necesita realmente el profesional jurídico en su workflow diario.

Y eso es exactamente lo que queremos hablar con OpenClaw.

---

## Por qué OpenClaw

OpenClaw trabaja en el mismo espacio que JUNO: herramientas digitales para el sector legal. Pero desde ángulos distintos.

Hemos construido la capa de inteligencia. La capacidad de consulta, análisis y síntesis jurídica ya existe y funciona. Lo que nos interesa explorar con vosotros es si hay una forma de que JUNO **potencie o complemente lo que ya tenéis**, en lugar de competir con ello.

No llegamos con un pitch cerrado. Llegamos con una herramienta funcionando y una pregunta abierta:

> **¿Qué parte del trabajo de vuestros usuarios podría resolverse con búsqueda jurídica inteligente integrada?**

---

## Cómo funciona técnicamente (resumen rápido)

```
Usuario escribe consulta en lenguaje natural
         ↓
API Route (Next.js) valida y orquesta
         ↓
LLM jurídico (Perplexity sonar) consulta fuentes primarias
         ↓
Respuesta estructurada con citas verificables
         ↓
UI renderiza con Markdown + pills de fuente detectadas
```

La arquitectura es **completamente API-first**. El motor de búsqueda expone un endpoint `POST /api/search` que puede integrarse en cualquier plataforma externa con pocas líneas de código.

Ver documentación técnica completa: [REPORTE_CODEBASE.md](./REPORTE_CODEBASE.md)

---

## Documentación del proyecto

| Documento | Contenido |
|---|---|
| [SOUL.md](./SOUL.md) | Identidad, valores y comportamiento de JUNO |
| [AGENT.md](./AGENT.md) | Reglas operativas del agente (capacidades y límites) |
| [REPORTE_CODEBASE.md](./REPORTE_CODEBASE.md) | Arquitectura técnica completa |
| [README.md](./README.md) | Setup local para colaboradores |

---

## Siguiente paso

Si después de explorar la demo tenéis interés en hablar, la conversación más útil que podemos tener es:

1. Vosotros nos contáis qué hace vuestro usuario cuando necesita encontrar o analizar normativa
2. Nosotros os enseñamos cómo JUNO gestiona ese caso concreto en vivo
3. Evaluamos juntos si tiene sentido una integración, una colaboración o algo que aún no hemos imaginado

No hay deck. No hay propuesta comercial todavía. Solo una herramienta funcionando y ganas de escuchar.

**Demo:** https://juno-lilac.vercel.app
**Repositorio:** https://github.com/IA22o/juno
**Contacto:** [añade aquí tu email o LinkedIn]

---

*Este documento es de uso privado. Compartido exclusivamente con el equipo de OpenClaw.*
