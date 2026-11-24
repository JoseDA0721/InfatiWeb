# InfantiWeb · Mi mundo emocional

Plataforma web para que niñas y niños de 6 a 10 años aprendan a **reconocer, comprender, expresar y regular** sus emociones jugando, mientras su familia acompaña el progreso. Prototipo de alta fidelidad del curso Usabilidad y Accesibilidad (Escuela Politécnica Nacional).

- **Cliente:** React 19 + Vite + TypeScript, React Router, TanStack Query.
- **Servidor:** Node.js + Express 5 + TypeScript, validación con Zod, sesión JWT en cookie `httpOnly`, claves con bcrypt.
- **Base de datos:** SQLite (better-sqlite3), migraciones SQL numeradas y semilla con contenido y usuarios de demostración.

## Requisitos

- **Node.js 22 LTS** (recomendado; funciona desde Node 20). Comprueba tu versión con `node -v`.
- **Git** para descargar el repositorio.
- **Chrome o Edge** para escuchar la voz del botón «Escuchar». La app funciona en otros navegadores, pero algunos (Firefox, ciertos Linux) no traen voces en español y no suenan; el texto siempre queda en pantalla.

No hace falta instalar SQLite: la base es un archivo que se crea solo.

## Cómo ejecutarlo

1. Descarga el repositorio y entra a la carpeta (se llama `InfatiWeb`, sin la «n» de Infanti):

   ```powershell
   git clone https://github.com/JoseDA0721/InfatiWeb.git
   ```

   ```powershell
   cd InfatiWeb
   ```

2. Instala las dependencias de cliente y servidor (un solo comando para las dos carpetas):

   ```powershell
   npm install
   ```

3. Levanta la API y la app juntas:

   ```powershell
   npm run dev
   ```

4. Abre <http://localhost:5173>.

La API corre en el puerto 4000 y Vite le reenvía las peticiones `/api`. La primera vez se crea `server/data/infantiweb.db` con el contenido y los usuarios de demostración. Para detener todo, pulsa `Ctrl + C` en la terminal.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run db:reset` | Borra la base y la vuelve a crear con la semilla (historial de Mateo relativo a la fecha de hoy). |
| `npm test` | Pruebas del servidor (reglas de gamificación y API) y del cliente (componentes). |
| `npm run typecheck` | Revisa los tipos de TypeScript en servidor y cliente. |
| `npm run build` | Compila cliente (`client/dist`) y servidor (`server/dist`). |
| `npm start` | Ejecuta el servidor compilado. Con `NODE_ENV=production` también entrega la app de React desde el mismo puerto. |

Configuración opcional: copia `.env.example` a `server/.env` (`API_PORT`, `JWT_SECRET`, `DB_PATH`). En producción `JWT_SECRET` es obligatorio.

## Usuarios de demostración

Datos ficticios creados por la semilla. No aparecen en la interfaz.

| Rol | Usuario | Clave | Notas |
|---|---|---|---|
| Niño | `Mateo` | `nubi123` · o imágenes: Nubi, Estrella, Cara feliz | Nivel 4, módulo 1 completo y 2 actividades del módulo 2; 4 de 5 en la meta semanal. |
| Niña | `Sofía` (o `sofia`) | `luna45` · o imágenes: Cara feliz, Familia, Respira | Cuenta nueva: verás el tutorial. |
| Familia | `rivera` | PIN `2468` | Vinculada a Mateo y Sofía. Pregunta de seguridad: primera mascota → `Canela`. |

El nombre no distingue mayúsculas ni tildes. Tras 5 intentos fallidos la cuenta hace una pausa de 5 minutos.

El historial de Mateo se arma según la fecha del día en que se crea la base. Si pasan días o semanas, su meta semanal y su tiempo de uso se verán vacíos; ejecuta `npm run db:reset` para regenerarlos con la fecha de hoy.

## Problemas comunes

| Síntoma | Solución |
|---|---|
| `npm install` falla al compilar `better-sqlite3` (menciona `node-gyp`, Python o Visual Studio) | Tu versión de Node no tiene binarios listos. Instala Node 22 LTS, borra la carpeta `node_modules` y vuelve a ejecutar `npm install`. |
| `EADDRINUSE` o «port is already in use» con el puerto 4000 | Otro programa usa ese puerto. Crea `server/.env` con `API_PORT=4001` (u otro libre) y vuelve a ejecutar `npm run dev`; la app también lee ese archivo. |
| Vite abre en 5174 en lugar de 5173 | El 5173 estaba ocupado; usa la dirección que muestra la terminal. |
| La página dice «No pudimos conectarnos» | La API no está corriendo: revisa la terminal de `npm run dev` y busca la línea `[api]` con el error. |
| Los datos de demostración quedaron mezclados después de probar | `npm run db:reset` (con `npm run dev` detenido) borra la base y la vuelve a crear. |
| El botón «Escuchar» no suena | Revisa que el botón «Sonido» no esté en silencio y el volumen del equipo; usa Chrome o Edge. |
| No puedo entrar: «Tomemos una pausa» | Hubo 5 intentos fallidos; espera 5 minutos o ejecuta `npm run db:reset`. |

## Qué incluye

**Sección del niño (N1–N13):** bienvenida, «¿Cómo funciona?», acceso con clave escrita o con imágenes, recuperación asistida por un adulto, tutorial de 3 pasos con Nubi, inicio con «Seguir: …», mapa con camino de estaciones y Nubi que avanza, detalle de módulo, ejemplo ilustrado antes de cada actividad, actividad, cierre con celebración, mis premios (insignias, álbum de stickers, evolución de Nubi), perfil con avatar, «Cómo quiero ver y oír» y ayuda con «Necesito ayuda».

**Siete tipos de actividad:** Identifica la emoción, Observa la expresión (con lupa), Escucha y responde, Une las emociones (arrastrar o tocar y tocar), ¿Qué harías?, Expreso lo que siento (frase con pictogramas e intensidad) y Respira conmigo. 19 actividades en 4 módulos (5, 4, 5 y 5) y 55 preguntas; el 62 % usa una escena ilustrada de la vida diaria (HU-06 pide al menos 60 %).

**Gamificación (sección 8):** 3/2/1 estrellas por pregunta (nunca 0), XP por estrella, actividad y módulo, +5 por perseverar y por respirar, 6 niveles con nombre, desbloqueo secuencial con «¡Has completado el nivel!», 9 insignias con su condición visible, un sticker por actividad, Nubi en 3 etapas y meta semanal de 5 sin rachas.

**Sección de familia (F1–F8):** acceso con PIN (teclado numérico, PIN nunca visible, recuperación con pregunta de seguridad), resumen semanal con avisos de ayuda, habilidades (nivel en palabras + ícono + barra), historial de actividades, logros, tiempo de uso (gráfico + tabla), 2–3 ideas para casa según la habilidad menos practicada, perfil y privacidad (corregir datos, cambiar la clave del niño, cambiar PIN, contactar a soporte, eliminar datos) y guía para familias.

**Accesibilidad:** botón Escuchar en cada instrucción, pregunta y pista (Web Speech API) con el texto siempre visible; lectura automática según el modo elegido; volumen y silencio siempre visibles; tres tamaños de letra que escalan toda la interfaz; alto contraste; reducir movimiento; atajos 1, 2 y 3; foco visible de 3 px; `aria-live` en la retroalimentación; objetivos de 48 px o más; diseño desde 360 px. Revisado con axe-core (WCAG 2.2 AA) sin violaciones en las pantallas principales.

## Estructura

```text
InfatiWeb/
├─ client/                 React + Vite
│  └─ src/
│     ├─ assets/           Ilustraciones SVG (Context/assets + escenas nuevas en el mismo estilo)
│     ├─ components/       Button, Modal, Stars, Nubi, SpeakButton, PinPad, PictureKey, WeeklyGoal…
│     ├─ features/         welcome, auth, tutorial, home, map, activities, rewards, profile,
│     │                    settings, help, family, preferences
│     ├─ layouts/          Layouts del niño y público
│     ├─ lib/              API, consultas, voz, sonidos, tipos
│     └─ styles/           tokens.css, base.css, ui.css, layout.css
├─ server/                 Express + SQLite
│  ├─ src/db/migrations/   001_init.sql
│  ├─ src/routes/          auth, child, family
│  ├─ src/services/        gamification (reglas puras), progress, attempts
│  ├─ src/seed/            contenido, semilla y reinicio
│  └─ test/                Vitest + Supertest
├─ PRODUCT.md              Contexto de producto
└─ DESIGN.md               Sistema visual
```

## Decisiones tomadas

- **Alcance:** niños y familias; sin panel docente ni administración (decisión confirmada en el documento).
- **Esquema:** se respeta el modelo de la sección 11 y se agregan campos necesarios para los requisitos: clave con imágenes, pregunta de seguridad, límite de intentos, retroalimentación por opción, frase construida y mensajes a soporte.
- **Desbloqueo:** cada actividad se abre al completar la anterior y cada módulo al completar el anterior.
- **Sesiones separadas** para niño y familia (dos cookies), para que un adulto pueda entrar con su PIN sin cerrar la sesión del niño.
- **Módulo 4:** se usa el nombre del prototipo, «Mis relaciones con otros», con la habilidad Expresión (pendiente de confirmar con la docente, como indica el documento).
- **Cambios respecto al Figma:** íconos dibujados en lugar de emojis, barra inferior en celular, mapa con camino serpenteante, sin etiquetas pequeñas sobre los títulos y modo enfocado dentro de las actividades.
