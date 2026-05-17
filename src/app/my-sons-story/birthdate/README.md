# Módulo Birthdate — Mis Hijos

Registra y gestiona los perfiles de los hijos, incluyendo fecha de nacimiento y foto de perfil.

## Estructura

```
birthdate/
├── interfaces/
│   └── birth-record.interface.ts     # BirthRecord, CreateBirthPayload
├── services/
│   └── birthdate.service.ts          # HTTP hacia API Gateway
├── stores/
│   ├── birthdate.store.ts            # Estado de la lista y detalle
│   ├── fn-load-births.ts             # rxMethod: lista + carga persona por defecto
│   ├── fn-load-birth-detail.ts       # rxMethod: detalle por ID
│   ├── fn-save-birth.ts              # rxMethod: crear / actualizar
│   └── fn-delete-birth.ts            # rxMethod: soft-delete
└── pages/
    ├── birthdate-list/               # Cards de hijos + selección de persona activa
    └── birthdate-form/               # Formulario con foto de perfil + checkbox predeterminado
```

## Funcionalidades clave

- **Lista en cards**: foto redonda (o iniciales), nombre, fecha de nacimiento, resaltado del hijo seleccionado.
- **Selección de persona**: click en una card → actualiza `PersonContextStore` para toda la app.
- **Foto de perfil**: flujo S3 presignado (PUT upload → PATCH registro con `profilePhotoKey`). Las URLs de visualización (presigned GET 24h) se reciben del backend en cada listado/detalle.
- **Persona predeterminada**: checkbox en el formulario persiste el ID en `localStorage` (`msst_default_person_id`). Al cargar la lista, se auto-selecciona esa persona.

## API endpoints usados

| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/v1/nacimientos` | Lista todos los registros activos |
| GET | `/v1/nacimientos/{id}` | Detalle de un registro |
| POST | `/v1/nacimientos` | Crea un nuevo registro |
| PUT | `/v1/nacimientos/{id}` | Actualiza nombre, fecha, foto key |
| DELETE | `/v1/nacimientos/{id}` | Soft-delete |
| POST | `/v1/nacimientos/{id}/foto-perfil/presign` | URL presignada PUT para subir foto a S3 |
