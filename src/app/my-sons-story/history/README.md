# Módulo History — Mis Historias

Registra y visualiza las historias de vida asociadas a un hijo seleccionado.

## Estructura

```
history/
├── interfaces/
│   └── history-entry.interface.ts    # HistoryEntry, HistoryAttachment
├── services/
│   └── history.service.ts            # HTTP hacia API Gateway
├── stores/
│   ├── history.store.ts              # Estado de la lista y detalle
│   ├── fn-load-histories.ts          # rxMethod: lista filtrada por hijo seleccionado
│   ├── fn-load-history-detail.ts     # rxMethod: detalle por ID
│   └── fn-delete-history.ts          # rxMethod: soft-delete
├── management.routes.ts              # Rutas lazy del módulo
└── pages/
    ├── history-list/                 # Cards de historias con banner del hijo activo
    ├── history-form/                 # Formulario con PrimeNG Editor + persona bloqueada
    └── history-detail/               # Vista completa con Galleria de imágenes
```

## Funcionalidades clave

- **Filtro por persona**: la lista solo muestra historias del hijo seleccionado en `PersonContextStore`.
- **Editor enriquecido**: `<p-editor>` (PrimeNG / Quill) guarda contenido HTML.
- **Persona bloqueada en formulario**: no se puede cambiar de hijo en la historia; se hereda del contexto global.
- **Galería de imágenes**: `<p-galleria>` en la vista de detalle, visible solo si existen adjuntos con imagen. Usa URLs presignadas GET (24h) devueltas por el backend (`viewUrl` en cada adjunto).
- **Adjuntos**: flujo S3 presignado existente (PUT upload → registro en DynamoDB).

## API endpoints usados

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/v1/historias?birthdateId=xxx` | Lista historias del hijo indicado |
| GET | `/v1/historias/{id}` | Detalle con adjuntos enriquecidos con `viewUrl` |
| POST | `/v1/historias` | Crea historia (incluye `birthdateId`) |
| PUT | `/v1/historias/{id}` | Actualiza historia |
| DELETE | `/v1/historias/{id}` | Soft-delete |
| POST | `/v1/historias/{id}/adjuntos/presign` | URL presignada PUT para subir adjunto |
