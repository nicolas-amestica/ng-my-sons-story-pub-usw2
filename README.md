# My Son's Story — Frontend

Aplicación Angular para que padres registren y revivan los momentos de sus hijos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 21 (standalone, OnPush) |
| Estado | NgRx Signals (`signalStore`) |
| UI | PrimeNG 21 + TailwindCSS 4 |
| Backend | AWS Lambda via API Gateway (Serverless Framework 4) |
| Almacenamiento | DynamoDB + S3 (fotos y adjuntos) |

## Requisitos

- Node.js ≥ 22
- Angular CLI 21

## Scripts

```bash
npm start        # dev server en puerto 4400
npm run build    # build de producción
```

## Variables de entorno

| Archivo | Uso |
|---------|-----|
| `src/environments/environment.ts` | Desarrollo local |
| `src/environments/environment.production.ts` | Producción |

Configurar `baseApi` con la URL base del API Gateway.

## Estructura de módulos

```
src/app/
├── shared/                  # Componentes, stores y servicios compartidos
├── my-sons-story/
│   ├── birthdate/           # Módulo de hijos registrados
│   └── history/             # Módulo de historias por hijo
```

Ver el README de cada módulo para detalles de implementación.

## Tema visual

Diseño Claymorphism: tonos rosa/crema cálidos, modo oscuro persistido en `localStorage` (`msst_theme`).

La persona predeterminada se persiste en `localStorage` (`msst_default_person_id`) y se auto-selecciona al iniciar la aplicación.
