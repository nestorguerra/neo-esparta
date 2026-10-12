# NEO·ESPARTA · Nº 1: La Grieta

Cómic web de cinco páginas en el que Néstor y su hijo Leo defienden Neo-Esparta, una megaciudad de 2099, de los monstruos que caen por una grieta dimensional. Estética de *300* (cielos de bronce, capas rojas, contraluces) dentro de una ciudad de lluvia y neones a lo *Blade Runner*. Pensado para lectores de 15 a 19 años.

**Léelo aquí:** https://nestorguerra.github.io/neo-esparta/

## Cómo se lee

- Cada viñeta es un **diorama 3D**: arrástrala y los personajes se despegan del fondo.
- **Doble clic** devuelve la viñeta al encuadre original.
- **⤢** abre la viñeta a pantalla completa (con zoom); **i** muestra la descripción de la escena.
- Flechas **← →** para pasar página. En el móvil, toca ⤢ para girar una viñeta.

## Qué hay dentro

| Parte | Contenido |
|---|---|
| Portada | Portada de colección con el diorama de Néstor y Leo |
| Páginas I–V | *La Grieta*, *El Muro*, *El Coloso*, *El Estadio*, *Golazo*: 50 viñetas (de 8 a 12 por página) |
| Fin | Contraportada con el adelanto del Nº 2 |
| Guion | Storyboard de cada página y descripción de cada viñeta: plano, acción, luz y textos |

## Cómo está hecho

1. **Guion y storyboard**: cinco páginas con la maqueta de viñetas de cada una (`src/story.js`).
2. **Dibujos**: 51 ilustraciones generadas con IA (GPT Image en ChatGPT) a partir de fichas de personaje hechas con fotos reales. Las instrucciones de cada imagen están en `tools/prompts.py` y `tools/kit.py` genera la guía para producirlas a mano.
3. **Dioramas**: `tools/layers.py` separa cada dibujo en fondo y figuras con tres modelos que se ejecutan en local:
   - Depth Anything V2 para la profundidad,
   - BiRefNet para recortar personajes y monstruos,
   - LaMa para rellenar lo que había detrás.
4. **Web**: Three.js pinta cada viñeta como dos capas con relieve; bocadillos, cartuchos y onomatopeyas son HTML encima, y las colas de los bocadillos siguen al personaje al girar. Si una viñeta no tiene dibujo, la web cae a una escena 3D hecha en código (`src/kit.js`).

## Estructura

```
index.html        la web completa (generada)
art3/             capas de cada viñeta: _b fondo, _f figuras, _d profundidad; meta.json
src/              page.html (estilos y portada), core.js, kit.js, story.js, artmeta.js, app.js
tools/            build.py y el proceso de dibujos y capas
```

Para regenerar `index.html` después de tocar `src/`:

```bash
python3 tools/build.py
```

Para probarlo en local (hace falta un servidor; abrir el archivo directamente no carga las capas):

```bash
python3 -m http.server 8000
```

y abre http://localhost:8000.

## Créditos

Protagonistas: Néstor y Leo. Dibujos generados con IA a partir de fotos reales; las fotos originales no están en este repositorio.
