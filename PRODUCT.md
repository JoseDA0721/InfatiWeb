# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + Vite + TypeScript (cliente), Node.js + Express + TypeScript (API REST), SQLite con better-sqlite3 (archivo único `infantiweb.db`). Por ahora solo se ejecuta en local; no hay destino de despliegue decidido. Fuente: `Context/CONTEXTO_InfantiWeb_Prototipo_Alta_Fidelidad.md`, sección 3, y respuesta del equipo ("solo local").

## Users

- **Niñas y niños de 6 a 10 años** (decisión confirmada). Usan sobre todo el celular, prefieren dibujos y audio a leer, y los más pequeños necesitan pocos pasos e íconos claros. Su tarea: jugar actividades cortas para reconocer, comprender, expresar y regular sus emociones.
- **Madres, padres y cuidadores**. Entran con un PIN para ver el progreso semanal del niño vinculado, sus habilidades, logros, tiempo de uso y recomendaciones para hacer en casa.
- Fuera de alcance: panel docente y administración (el contenido se carga con un script de semilla).

## Product Purpose

InfantiWeb ("Mi Mundo Emocional") es un prototipo de alta fidelidad del curso Usabilidad y Accesibilidad (Escuela Politécnica Nacional). El niño aprende y juega; el adulto observa y acompaña. El tono es siempre educativo, nunca clínico. Éxito: las historias HU-01 a HU-12 se cumplen y una prueba SUS con niños y familias se acerca al 84,5 de Catbears.

## Positioning

Ninguna de las apps evaluadas (Catbears, PBS Kids, The Feelings Game) ofrece accesibilidad más allá del audio. InfantiWeb hace de la accesibilidad completa su diferencia: audio con texto equivalente, letra escalable, alto contraste, teclado, lector de pantalla y reducción de movimiento, más una gamificación que nunca castiga el error.

## Operating Context

- Sesiones cortas (2 a 4 minutos por actividad, 3 a 5 preguntas), muchas veces en celular, a veces con un adulto al lado.
- La familia revisa un resumen semanal, no en tiempo real.
- Las pruebas de usabilidad se hacen con niños y padres reales usando datos ficticios (niño de demostración: Mateo).

## Capabilities and Constraints

- Sección del niño: bienvenida, acceso (nombre + clave o clave con imágenes), tutorial con Nubi, inicio, mapa de aprendizaje, detalle de módulo, actividades (7 tipos), cierre con recompensas, mis premios, perfil, "Cómo quiero ver y oír" y ayuda.
- Sección de familia: acceso con PIN, resumen, habilidades, actividades, logros, tiempo de uso, recomendaciones, perfil y privacidad.
- Regla central: ningún elemento que parezca interactivo puede quedar sin función. Nada de "Próximamente", "por diseñar" ni credenciales de demostración en la interfaz.
- Una respuesta equivocada nunca reinicia la actividad ni resta puntos.
- Textos para familias describen práctica, no diagnóstico. Niveles permitidos: Muy bueno, Bueno, En progreso, Por explorar.
- Sin rankings, sin tienda, sin anuncios, sin alertas de pérdida; meta semanal en lugar de rachas.

## Brand Commitments

- Nombre InfantiWeb, mascota Nubi (nube que evoluciona en 3 etapas).
- Paleta de marca: morado oscuro `#3B2F63`, lila `#E8DEFF`, blanco. Colores de emoción reservados para emociones: Alegría `#FFD84D`, Tristeza `#6BB6FF`, Enojo `#FF6B5E`, Miedo `#B58CFF`, Sorpresa `#FFA94D`.
- Tipografía redondeada (Nunito), ilustraciones vectoriales planas con contorno morado.
- Rótulos cercanos: "Mi nombre", "Mi clave secreta", "Cómo quiero ver y oír", "Hola, familia".

## Evidence on Hand

- Ilustraciones del equipo en `Context/assets/` (logo, Nubi, 5 caras de emociones, 3 escenas, 5 insignias, estrellas, mapa, 10 pictogramas, 3 avatares).
- Prototipo visual en Figma Make ("Replicar prototipo en Figma").
- Resultados de fases previas (SUS, Focus Group, evaluación heurística) resumidos en el documento de contexto. No hay testimonios ni métricas propias de InfantiWeb todavía; no se deben inventar.

## Product Principles

1. No me hagas pensar: una instrucción por pantalla, ícono más texto, la primera opción razonable lleva al objetivo.
2. Equivocarse es parte de aprender: pistas progresivas, reintentos y premios por perseverar.
3. Todo se puede escuchar y todo se puede leer.
4. Siempre se puede volver: salidas grandes, fijas y consistentes.
5. La familia acompaña, no evalúa.

## Accessibility & Inclusion

WCAG 2.2 AA como mínimo: texto ≥4,5:1, componentes ≥3:1, objetivos táctiles ≥48 px con 8 px de separación, foco visible de 3 px, todo operable con teclado (atajos 1, 2, 3 en respuestas), `aria-live` para retroalimentación, alternativa táctil para arrastrar, `prefers-reduced-motion` respetado y opción propia, tres tamaños de letra en rem, funcionamiento desde 360 px de ancho.
