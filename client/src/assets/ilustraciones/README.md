# Ilustraciones

Imágenes generadas con la IA de imágenes de Figma (modelo `gpt-image-2.5-flare`) en el archivo de Figma «InfantiWeb · Ilustraciones» (borradores de la cuenta del equipo), donde quedan los originales en 1280 × 960 px. Aquí están convertidas a WebP (960 px de ancho las escenas, 720 px el tutorial, 384 px avatares y stickers).

**Estilo común de los prompts:** ilustración de libro infantil 2D con textura suave de gouache, formas redondeadas, colores vivos y cálidos con acentos lila y violeta, contornos violeta oscuro, niñas y niños latinoamericanos de 6 a 9 años con expresiones fáciles de leer, ambiente seguro (nada aterrador), sin texto ni números.

| Archivos | Contenido |
|---|---|
| `m{módulo}a{actividad}q{pregunta}.webp` (43) | Una escena por pregunta, pensada para su situación exacta. El texto alternativo de cada una está en `server/src/seed/content.ts` (`sceneAlt`). |
| `modulo_*.webp` (4) | Portadas de los cuatro módulos. |
| `tutorial_*.webp` (3) | Pasos del tutorial: el mapa, ganar estrellas y pedir ayuda. |
| `avatar_1..3.webp` (3) | Avatares que el niño puede elegir. |
| `sticker_*.webp` (19) | Stickers del álbum, uno por actividad. Se generaron sobre fondo blanco y se recortaron con transparencia; el borde blanco y la sombra se agregan con CSS (`.sticker-art`). |

Los vectores (caras de emociones, insignias, estrellas, pictogramas y Nubi) están en la carpeta superior (`assets/*.svg`) y se dibujaron a mano en SVG.
