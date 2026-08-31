# legislación fp

Consulta visual de la normativa de ordenación y organización académica de los ciclos formativos de Formación Profesional de la Comunitat Valenciana.

**https://gines-lopez.github.io/legislacion-fp**

> [!IMPORTANT]
> Este sitio **no es fuente oficial**. El texto auténtico de cada norma es el publicado en el [DOGV](https://dogv.gva.es/) y en el [BOE](https://www.boe.es/). Aquí se reorganiza y se enlaza, no se sustituye.

## Por qué

La [página de aspectos normativos de la Conselleria](https://ceice.gva.es/es/web/formacion-profesional/normativa-sobre-ordenacion-y-organizacion-academica-de-los-ciclos-formativos) reúne más de cien documentos en listas anidadas de enlaces a PDF. Está todo, pero cuesta usarla: no hay buscador ni filtros, y lo que de verdad necesita saber quien la consulta —si una norma sigue vigente, o si la reformó otra posterior— aparece redactado en prosa dentro del propio texto del enlace.

Este proyecto parte de esa misma información y le añade lo que le falta:

- **Estado de vigencia visible** en cada norma: vigente, modificada o derogada.
- **Relaciones entre normas**: qué modifica a qué, y qué quedó derogado por qué.
- **Búsqueda y filtros** por sección, ámbito estatal o autonómico y estado.
- Más adelante, **páginas de consulta** con el articulado en HTML, para no tener que abrir el PDF.

## Estado

En construcción. Publicado el esqueleto del sitio y validado el despliegue; el volcado de normas es el siguiente paso. Ver [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md).

## Cómo está hecho

HTML, CSS y JavaScript de navegador. Sin backend, sin dependencias, sin paso de compilación: los datos viven en [`docs/data/normas.json`](docs/data/normas.json) y añadir una norma es editar ese fichero.

```
docs/                    lo que se publica (GitHub Pages: main + /docs)
├── index.html
├── assets/css/base.css
├── assets/js/app.js
└── data/normas.json     fuente de verdad
```

Para verlo en local basta con servir la carpeta; abrirla como `file://` no funciona, porque el navegador bloquea la carga del JSON.

```bash
cd docs && python3 -m http.server 8000
```

En producción el sitio cuelga de `/legislacion-fp/`, así que **todas las rutas internas son relativas**. Una ruta absoluta funciona en local y rompe al publicar, que es la forma más fácil de perder una tarde.

## Documentación

| Fichero | Contenido |
|---|---|
| [DECISIONES.md](DECISIONES.md) | Qué se decidió y por qué. |
| [MODELO-DATOS.md](MODELO-DATOS.md) | Esquema de `normas.json`: campos, valores e invariantes. |
| [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md) | Fases y estado actual. |

## Si encuentras un error

Los errores de contenido son los que más importan: una norma marcada como vigente cuando ya no lo está, una fecha equivocada, un enlace roto o una modificación que falta. Abre una [incidencia](https://github.com/gines-lopez/legislacion-fp/issues) indicando la norma y, si puedes, el enlace al DOGV o al BOE que lo acredita.

## Licencia

Código bajo licencia [MIT](LICENSE). Los textos normativos enlazados son de sus organismos publicadores y se rigen por sus propias condiciones.
