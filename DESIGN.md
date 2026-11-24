# Design

Sistema visual de InfantiWeb tal como está construido en `client/src/styles` y los componentes. Fuente: prototipo de Figma Make «Replicar prototipo en Figma» y sección 13 del documento de contexto.

## Mundo

Un cuarto de juegos lila y tranquilo. Cada pantalla pide una sola cosa y muestra siempre el camino de vuelta. Ilustraciones planas con contorno morado oscuro (las del equipo, en `client/src/assets`). Nada de emojis como íconos: pictogramas del equipo para lo que toca un niño y trazos de `lucide-react` para controles secundarios.

## Color (`styles/tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#3B2F63` | Texto y contornos |
| `--ink-soft` | `#625A7C` | Texto de apoyo (≥ 4,5:1 sobre el fondo) |
| `--action` / `--action-strong` | `#5B4BA0` / `#45387F` | Único color de acción (botón principal, selección, foco de estación) |
| `--lilac` / `--lilac-soft` / `--lilac-deep` | `#E8DEFF` / `#F7F4FF` / `#D6C8FB` | Fondos, chips, anillos de selección |
| `--success` / `--success-soft` | `#1F7342` / `#E4F6EB` | Acierto, completado |
| `--encourage` / `--encourage-soft` / `--encourage-line` | `#7D4C00` / `#FFF2D8` / `#E2B75D` | Ánimo y pistas (bombilla). Nunca rojo de error en el juego |
| `--danger` | `#8A2F35` | Solo «Salir» y eliminar datos |
| `--emo-*` | alegría `#FFD84D`, tristeza `#6BB6FF`, enojo `#FF6B5E`, miedo `#B58CFF`, sorpresa `#FFA94D` | Reservados para emociones |

Alto contraste (`html[data-contrast='alto']`): tinta negra, acción `#241A5C`, bordes negros y de 3 px.

## Tipografía

Nunito Variable autoalojada (`@fontsource-variable/nunito`). Base 18 px (`--text-base`), instrucciones 20–24 px, títulos 28–36 px, bienvenida hasta 64 px; nunca menos de 16 px. Todo en `rem`: `html[data-font='grande'|'muy_grande']` escala la interfaz completa al 112,5 % y 125 %. Números con `tabular-nums` (`.num`).

## Forma y espacio

Escala de 8 px (`--s-1` … `--s-8`). Radios 12 / 16 / 24 / 32 px. Una sola elevación por superficie: borde de 2 px (`--line`) en tarjetas; sombra solo en lo que flota (botón en hover, ventanas, avisos). Objetivos táctiles ≥ 48 px (`--tap`), botones de 56–64 px.

## Componentes

- **Botón** (`.btn`): `primary` (uno por pantalla), `secondary` (contorno), `soft` (lila: Escuchar, pistas), `ghost` (texto subrayado), `danger`. Siempre ícono o pictograma + texto. Estados hover (sube 2 px), activo, foco de 3 px, deshabilitado.
- **Volver** (`.back-btn`): fijo arriba a la izquierda, flecha + texto, 56 px.
- **Barra superior / barra inferior**: en pantallas ≥ 1180 px la navegación va arriba; debajo, en una barra inferior con pictograma + texto. En actividades la barra inferior se oculta (modo enfocado).
- **Tarjeta de respuesta** (`.answer`): número (atajo 1, 2, 3), cara, nombre y una pestaña con el color de la emoción. Estados: seleccionada (anillo lila), correcta (verde + «¡Esa es!»), intentada (borde discontinuo ámbar + bombilla).
- **Panel de pistas** (`.hint`): área fija junto a la pregunta, nunca encima.
- **Retroalimentación** (`.feedback`): verde con check o ámbar con bombilla; anunciada con `aria-live`.
- **Estación del mapa** (`.station`): disco de 84 px; completada (verde + check + estrellas), actual (anillo pulsante + Nubi), lista, bloqueada (discontinua + candado).
- **Ventana** (`.modal`, `<dialog>` nativo): centrada, fondo atenuado, cierre con Esc y botón «Cerrar».
- **Nubi** (`components/Nubi.tsx`): tres etapas (nubecita, nube feliz con destellos, nube arcoíris).

## Movimiento

Una entrada suave por página (`rise`, 320 ms, ease-out exponencial), estrellas que aparecen (`pop`), Nubi que flota y que camina por el mapa hasta la estación actual, confeti al cerrar una actividad. `prefers-reduced-motion` y la opción «Reducir movimiento» (`html[data-motion='reducido']`) apagan todo; la respiración guiada sigue funcionando con texto y cuenta.

## Ilustraciones

Dos familias que conviven, ambas con contorno violeta oscuro (`#3B2F63`):

- **Cuento ilustrado** (`client/src/assets/ilustraciones/*.webp`, generadas con la IA de Figma): escenas 2D con textura de gouache, niñas y niños latinoamericanos, acentos lila. Una escena propia para cada pregunta (43), portadas de módulo, tutorial, avatares y 19 stickers recortados. Se muestran a 4:3 con esquinas de 16–24 px; los stickers llevan borde blanco y sombra por CSS (`.sticker-art`). Origen y estilo de los prompts en `ilustraciones/README.md`.
- **Vectores** (`client/src/assets/*.svg`, dibujados a mano): caras de emociones con cejas, ojos y boca distintos por emoción (la pista visual que se enseña), medallas con emblema (lupa con la emoción en las de detective), estrellas, pictogramas en baldosa con sombra inferior y Nubi sin fondo.
- **Íconos de razones** («Expreso lo que siento»): íconos de `lucide-react` dentro de una baldosa pastel con borde violeta (`components/ArtImage.tsx`, `.art-icon`).

Las imágenes originales del equipo siguen en `Context/assets` como referencia; en la app las reemplazan las versiones nuevas con los mismos nombres donde aplica (caras, insignias, estrellas, pictogramas, Nubi).
