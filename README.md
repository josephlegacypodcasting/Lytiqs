# LYTIQS – Workforce Data Calculator (copia)

Copia de https://lytiqs-workforce-signal-check.vercel.app/calculator
(Next.js 15 + React 19 + Tailwind v4 + framer-motion, fuente Poppins).

## Ejecutar

```bash
npm install
npm run dev      # http://localhost:3000/calculator
npm run build && npm start
```

`/calculator?embed=1` oculta el logo y el encabezado (para insertarla en un iframe).

## Configuración (`.env.local`, ver `.env.example`)

- `NEXT_PUBLIC_LYT_CTA_URL`: enlace del botón "See What LYTE Could Show You".
- `LEAD_WEBHOOK_URL`: cada lead (nombre, email, respuestas, resultados, UTMs) se envía
  por POST en JSON a esta URL (p. ej. un webhook entrante de GoHighLevel). Si está vacía,
  el lead solo se registra en el log del servidor.

## Leads a GoHighLevel

`.env.local` ya tiene `LEAD_WEBHOOK_URL` con el webhook del workflow. En Vercel, agrega
la misma variable en *Settings → Environment Variables* (`.env.local` no se sube).

El webhook recibe un JSON plano, listo para mapear en el trigger "Inbound Webhook":

| Campo | Ejemplo |
|---|---|
| `first_name`, `last_name`, `email` | contacto |
| `source` | `lyte-calculator` |
| `submitted_at` | fecha ISO |
| `employees`, `avgSalary`, `voluntaryTurnoverPct`, `annualHires` | respuestas del paso 1 |
| `replacementCostPct`, `firstYearTurnoverPct`, `costPerHire`, `internalHirePct` | número o `unsure` |
| `turnoverVisible`, `acquisitionVisible`, `mobilityVisible` | opciones marcadas, separadas por coma |
| `turnoverOpportunity`, `acquisitionOpportunity`, `mobilityOpportunity` | p. ej. `HIGH (4 of 5 unseen)` |
| `voluntaryTurnoverCost`, `firstYearReplacementCost`, `recruitingSpendLost` | dólares o `not calculated` |
| `utm_*` | si la URL los trae |

## Estructura

- `src/components/lyte/calc.ts`: pantallas, validación y aritmética (idéntica al original).
- `src/components/lyte/lyte-experience.tsx`: flujo landing → 4 pasos → formulario → resultado.
- `src/components/lyte/snapshot.tsx`: pantalla de resultados.
- `src/app/api/lead/route.ts`: recibe el lead del formulario.
