# Shared — Infraestructura compartida

Componentes, stores, servicios y constantes reutilizables en toda la aplicación.

## Estructura

```
shared/
├── components/
│   ├── app-header/          # Header con logo, nav, foto del hijo seleccionado, toggle de tema
│   └── app-footer/          # Footer con copyright y versión
├── constants/
│   ├── storage-keys.constant.ts      # Claves de localStorage
│   └── config-primeng.constant.ts    # Configuración global de PrimeNG
├── interfaces/              # Interfaces compartidas entre módulos
├── services/
│   └── notification.service.ts       # Wrapper Toast/ConfirmDialog de PrimeNG
└── stores/
    ├── person-context/
    │   └── person-context.store.ts   # Persona activa en la sesión + persona predeterminada
    └── theme/
        └── theme.store.ts            # Modo claro/oscuro con persistencia en localStorage
```

## PersonContextStore

Gestiona qué hijo está activo en la sesión actual.

| Señal / Método | Descripción |
|----------------|-------------|
| `selectedPerson()` | Registro `BirthRecord` seleccionado actualmente |
| `defaultPersonId()` | ID guardado como predeterminado en `localStorage` |
| `selectedPersonName()` | `"Nombre Apellido"` de la persona activa |
| `selectedPersonPhotoUrl()` | URL de foto de perfil (presignada, desde el backend) |
| `selectPerson(person)` | Cambia la persona activa en la sesión |
| `setAsDefault(id)` | Persiste el ID en `localStorage` (`msst_default_person_id`) |
| `clearDefault()` | Elimina la preferencia de predeterminado |
| `loadDefault(records)` | Auto-selecciona el predeterminado al cargar la lista de hijos |

## ThemeStore

| Señal / Método | Descripción |
|----------------|-------------|
| `theme()` | `'light'` o `'dark'` |
| `themeIcon()` | Clase de ícono PrimeIcons para el botón de toggle |
| `themeTooltip()` | Texto del tooltip del botón de toggle |
| `toggleTheme()` | Alterna el tema y lo persiste en `localStorage` (`msst_theme`) |
| `loadTheme()` | Lee `localStorage` y aplica la clase `.dark` en `<html>` |

El ThemeStore aplica/quita la clase `.dark` en `document.documentElement`, lo que activa tanto las variables de PrimeNG como las clases `dark:` de TailwindCSS.
