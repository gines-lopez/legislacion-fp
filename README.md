# legislación fp

Consulta visual de la normativa de ordenación y organización académica de los ciclos formativos de Formación Profesional de la Comunitat Valenciana.

**https://gines-lopez.github.io/legislacion-fp**

> [!IMPORTANT]
> Este sitio **no es fuente oficial**. El texto auténtico de cada norma es el publicado en el [DOGV](https://dogv.gva.es/) y en el [BOE](https://www.boe.es/). Aquí se reorganiza y se enlaza, no se sustituye.

## Por qué

La [página de aspectos normativos de la Conselleria](https://ceice.gva.es/es/web/formacion-profesional/normativa-sobre-ordenacion-y-organizacion-academica-de-los-ciclos-formativos) reúne más de cien documentos en listas anidadas de enlaces a PDF. Está todo, pero cuesta usarla: no hay buscador ni filtros, y lo que de verdad necesita saber quien la consulta —si una norma sigue vigente, o si la reformó otra posterior— aparece redactado en prosa dentro del propio texto del enlace.

Este proyecto parte de esa misma información y le añade lo que le falta:

- **Estado de vigencia visible** en cada norma: vigente, modificada o derogada.
- **Ámbito visible**: si la norma es estatal o autonómica, y en qué diario se publica.
- **Relaciones entre normas**: qué modifica a qué, y qué quedó derogado por qué.
- **Búsqueda y filtros** por sección, ámbito estatal o autonómico y estado.
- **Preguntas frecuentes** de las instrucciones de curso, con el epígrafe y la cita literal de cada respuesta.

## Estado

En uso. El sitio contiene las 37 normas de las seis secciones, con su ámbito, su estado de vigencia y sus relaciones, y la portada ya es la herramienta de consulta: buscador instantáneo, filtros con recuento y ficha por norma.

Las **instrucciones de inicio de curso** tienen además 50 preguntas frecuentes dentro de su ficha: cada respuesta indica el epígrafe del que sale y reproduce la frase literal de la norma en que se apoya, y todas se verificaron una a una contra el PDF del DOGV. Ver [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md).

## Cómo está hecho

HTML, CSS y JavaScript de navegador. Sin backend, sin dependencias, sin paso de compilación: los datos viven en [`docs/data/normas.json`](docs/data/normas.json) y añadir una norma es editar ese fichero.

```
docs/                       lo que se publica (GitHub Pages: main + /docs)
├── index.html              portada y ficha de norma
├── diagnostico.html        comprueba el despliegue y valida los datos
├── assets/
│   ├── css/base.css
│   ├── js/app.js           buscador, filtros, enrutado y ficha
│   ├── js/diagnostico.js
│   └── favicon.svg
└── data/
    ├── normas.json         fuente de verdad
    ├── meta.json           fecha de última revisión
    ├── recursos.json       lo que la fuente enlaza y no es norma
    └── consulta/           preguntas frecuentes, una norma por fichero
```

Toda la vista vive en la dirección, así que cualquier consulta se puede pegar en un correo:

| Enlace | Qué muestra |
|---|---|
| `?q=dual` | Lo que menciona la formación dual |
| `?estado=derogada` | Las cinco normas derogadas |
| `?seccion=curso-actual` | Las instrucciones del curso en vigor |
| `?etiqueta=fct` | Todo lo que toca la FCT |
| `?n=decreto-114-2025` | La ficha de esa norma, con sus relaciones |
| `?n=resolucion-2026-07-16` | Las instrucciones del curso, con sus 50 preguntas |
| `?n=resolucion-2026-07-16&p=exencion-experiencia` | Directamente esa respuesta, abierta |

En producción el sitio cuelga de `/legislacion-fp/`, así que **todas las rutas internas son relativas**. Una ruta absoluta funciona si sirves `docs/` en la raíz y revienta al publicar, que es la forma más fácil de perder una tarde. Por eso el servidor local imita el subpath en vez de servir `docs/` a pelo. Abrirlo como `file://` tampoco vale: el navegador bloquea la carga del JSON.

Desde la raíz del repositorio:

```bash
mkdir -p /tmp/fp-local && ln -sfn "$PWD/docs" /tmp/fp-local/legislacion-fp
```

```bash
cd /tmp/fp-local && python3 -m http.server 8000
```

Y abrir **http://localhost:8000/legislacion-fp/**. El enlace simbólico apunta a `docs/`, así que no hay copias que se queden viejas: al editar basta con recargar.

**Al publicar, sube `VERSION` en `docs/assets/js/app.js`.** GitHub Pages cachea los assets diez minutos, así que hay una ventana en la que un navegador ejecuta el script anterior contra el HTML nuevo y el sitio parece roto sin estarlo; el diagnóstico compara ambas versiones y lo dice. Ver D19 en [DECISIONES.md](DECISIONES.md).

Tras editar `docs/data/normas.json`, abre **http://localhost:8000/legislacion-fp/diagnostico.html**: comprueba sola que los tres ficheros de datos cargan y que las relaciones entre normas son coherentes por los dos lados, que es el error más fácil de cometer.

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
