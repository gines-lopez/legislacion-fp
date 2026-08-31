# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

`legislacion-fp` — adaptación visual y consultable de la normativa de ordenación y organización académica de los ciclos formativos de FP de la Comunitat Valenciana. Público destinatario: profesorado de FP. Contenido en castellano.

- Fuente oficial que se adapta: `https://ceice.gva.es/es/web/formacion-profesional/normativa-sobre-ordenacion-y-organizacion-academica-de-los-ciclos-formativos`
- Publicado en: `https://gines-lopez.github.io/legislacion-fp`

## Arquitectura

Sitio estático sin build ni dependencias: HTML, CSS y JS de navegador, con los datos en `docs/data/normas.json` como fuente de verdad única. No hay backend, ni Node, ni `node_modules`, ni GitHub Actions. Añadir una norma es editar el JSON.

GitHub Pages sirve `main` + carpeta `/docs`. Solo se versionan `docs/` y los `.md` de la raíz (ver `.gitignore`): cualquier utilidad de desarrollo es de usar y tirar, en el scratchpad.

Todo se sirve bajo el subpath `/legislacion-fp/`, así que **las rutas internas deben ser relativas**. Una ruta absoluta (`/assets/…`) funciona en local y rompe en producción, por lo que probar en local no detecta el fallo.

El JavaScript son módulos ES que carga el navegador, sin empaquetar (D30). Dónde va cada cosa:

| Módulo | Qué le toca |
|---|---|
| `comun.js` | Lo que usan dos o más páginas: `VERSION`, el vocabulario con el que se cita una norma, las utilidades de texto y el ancla y el rótulo de una pieza de articulado. Lo que solo usa una página no entra aquí. |
| `rutas.js` | Leer y componer las URL de la portada. |
| `datos.js` | El almacén, la carga en tres tiempos y las preguntas sobre el corpus. No toca el DOM. |
| `vistas.js` | Componer el HTML del listado y de la ficha. No lee ni escribe la URL. |
| `app.js` | Decidir: enrutado, arranque y eventos. |
| `norma.js`, `esquema.js` | Una página cada uno, sobre `comun.js`. |
| `diagnostico.js` | Script clásico y sin importaciones, a propósito: tiene que poder cargar cuando lo demás no carga. |

**El ancla de un artículo se compone en un solo sitio** (`anclaDePieza`). El buscador la escribe en el enlace y la página del texto la pinta en el destino: si dejaran de coincidir, los resultados caerían en el vacío.

**Al publicar, sube `VERSION` en `docs/assets/js/comun.js`** (D19, D31).

## Documentación

| Fichero | Contenido |
|---|---|
| [DECISIONES.md](DECISIONES.md) | Qué se decidió y por qué. Léelo antes de proponer cambios de stack o de diseño. |
| [MODELO-DATOS.md](MODELO-DATOS.md) | Esquema de `normas.json`: campos, valores admitidos e invariantes. |
| [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md) | Fases, estado actual y qué toca después. |

## Reglas

**Interfaz.** Invoca la skill `anthropic-skills:frontend-design` *antes* de escribir cualquier componente, página u hoja de estilos, también al remodelar los existentes. Cárgala en silencio, sin narrar la invocación.

**Diseño.** Escala de grises estricta, sin color de acento. Los estados de las normas se distinguen por tipografía y filetes, nunca por color.

**Rigor jurídico.** Citar mal un artículo, una versión ya modificada o una norma derogada perjudica activamente a quien consulta. Cita siempre identificador completo y fecha, y enlaza al DOGV o al BOE. El sitio no es fuente oficial y debe decirlo.

**Alcance de las relaciones.** `estado` dice *que* una norma fue modificada o derogada; nunca *hasta dónde*, y aquí el alcance casi nunca es total. Ese matiz vive en el `resumen`, así que donde se muestre un estado o una relación, el `resumen` va a la vista. Ver «Lo que el modelo no captura» en [MODELO-DATOS.md](MODELO-DATOS.md).

**Vocabulario.** En castellano y sin traducir: `ciclo formativo`, `módulo profesional`, `resultados de aprendizaje`.
