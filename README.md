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
- **Relaciones entre normas**: qué modifica a qué, qué quedó derogado por qué y qué remite a qué.
- **Búsqueda y filtros** por sección, ámbito estatal o autonómico y estado.
- **Búsqueda dentro del articulado** de las normas transcritas: se busca «promoción» y sale el artículo que lo dice, no solo la norma que lo contiene.
- **Preguntas frecuentes** de las instrucciones de curso, con el epígrafe y la cita literal de cada respuesta.
- **Esquemas de norma**, que dibujan cómo está construida una ley en vez de reproducirla.

## Estado

**En producción y en uso.** Están las 40 normas de las seis secciones con su ámbito, su estado de vigencia y sus relaciones; la portada es la herramienta de consulta —buscador instantáneo, filtros con recuento y ficha por norma—, y cualquier consulta es un enlace que se puede pegar en un correo.

La **Ley Orgánica 3/2022** tiene su esquema: la escalera de los cinco grados, la cadena de catálogos, los dos regímenes de dual y el mapa de sus 117 artículos, con la frase literal de la ley debajo de cada cifra. La **Orden 8/2025 de evaluación** tiene su articulado transcrito y consolidado con la Orden 5/2026, que el DOGV todavía no ha incorporado a su versión vigente: quien consulte hoy el texto «vigente» del diario oficial leerá un criterio de promoción derogado. Las **instrucciones de inicio de curso** tienen además 50 preguntas frecuentes dentro de su ficha: cada respuesta indica el epígrafe del que sale y reproduce la frase literal de la norma en que se apoya, y todas se verificaron una a una contra el PDF del DOGV.

**Lo que queda es ir incorporando normas, poco a poco.** Transcribir un articulado o escribir una FAQ es trabajo de datos y de lectura, no de programación: el mecanismo ya está montado y añadir la siguiente norma no toca ni una línea de la interfaz. Ver [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md).

La **fase 5 de refactorización** está hecha: el código que estaba escrito tres veces vive ahora en un módulo común, `app.js` se ha repartido en cuatro piezas y el listado ya no espera a ficheros que no necesita para pintarse. No cambia nada de lo que se ve; cambia lo que cuesta añadir la norma siguiente.

## Cómo está hecho

HTML, CSS y JavaScript de navegador. Sin backend, sin dependencias, sin paso de compilación: los datos viven en [`docs/data/normas.json`](docs/data/normas.json) y añadir una norma es editar ese fichero.

```
docs/                       lo que se publica (GitHub Pages: main + /docs)
├── index.html              portada y ficha de norma
├── diagnostico.html        comprueba el despliegue y valida los datos
├── norma/                  articulado transcrito, una página por norma
├── esquema/                esquema de una ley, una página por norma
├── assets/
│   ├── css/base.css
│   ├── js/comun.js         lo que comparten las páginas: vocabulario y utilidades
│   ├── js/rutas.js         leer y componer las URL de la portada
│   ├── js/datos.js         el almacén, la carga y la búsqueda
│   ├── js/vistas.js        el pintado del listado y de la ficha
│   ├── js/app.js           enrutado, arranque y eventos
│   ├── js/norma.js         la página de articulado
│   ├── js/esquema.js       la página de esquema
│   ├── js/diagnostico.js
│   └── favicon.svg
└── data/
    ├── normas.json         fuente de verdad
    ├── meta.json           fecha de última revisión
    ├── recursos.json       lo que la fuente enlaza y no es norma
    ├── consulta/           preguntas frecuentes, una norma por fichero
    ├── esquema/            esquema de una ley, una norma por fichero
    └── texto/              articulado transcrito, una norma por fichero
```

Toda la vista vive en la dirección, así que cualquier consulta se puede pegar en un correo:

| Enlace | Qué muestra |
|---|---|
| `?q=dual` | Lo que menciona la formación dual |
| `?estado=derogada` | Las seis normas derogadas |
| `?seccion=curso-actual` | Las instrucciones del curso en vigor |
| `?etiqueta=fct` | Todo lo que toca la FCT |
| `?n=decreto-114-2025` | La ficha de esa norma, con sus relaciones |
| `?n=resolucion-2026-07-16` | Las instrucciones del curso, con sus 50 preguntas |
| `?n=resolucion-2026-07-16&p=exencion-experiencia` | Directamente esa respuesta, abierta |
| `norma/orden-8-2025.html#articulo-14` | El artículo 14 de la Orden de evaluación |
| `norma/orden-8-2025.html?q=promoción#articulo-14` | Ese artículo con lo buscado resaltado |
| `esquema/lo-3-2022.html#grados` | Los cinco grados de la Ley Orgánica de FP |

En producción el sitio cuelga de `/legislacion-fp/`, así que **todas las rutas internas son relativas**. Una ruta absoluta funciona si sirves `docs/` en la raíz y revienta al publicar, que es la forma más fácil de perder una tarde. Por eso el servidor local imita el subpath en vez de servir `docs/` a pelo. Abrirlo como `file://` tampoco vale: el navegador bloquea la carga del JSON.

Desde la raíz del repositorio:

```bash
mkdir -p /tmp/fp-local && ln -sfn "$PWD/docs" /tmp/fp-local/legislacion-fp
```

```bash
cd /tmp/fp-local && python3 -m http.server 8000
```

Y abrir **http://localhost:8000/legislacion-fp/**. El enlace simbólico apunta a `docs/`, así que no hay copias que se queden viejas: al editar basta con recargar. Si el servidor devuelve 404 a través del enlace, copia `docs/` en su lugar y vuelve a copiarla tras cada cambio.

**Al publicar, sube `VERSION` en `docs/assets/js/comun.js`,** que es el único sitio donde está. GitHub Pages cachea los assets diez minutos, así que hay una ventana en la que un navegador ejecuta el código anterior contra el HTML nuevo y el sitio parece roto sin estarlo; el diagnóstico compara ambas versiones y, fichero a fichero, si el navegador guarda copias anteriores de algún módulo o de la hoja de estilos. Ver D19 y D31 en [DECISIONES.md](DECISIONES.md).

Tras editar `docs/data/normas.json`, abre **http://localhost:8000/legislacion-fp/diagnostico.html**: comprueba sola que los tres ficheros de datos cargan y que las relaciones entre normas son coherentes por los dos lados, que es el error más fácil de cometer.

## Añadir una norma

Es lo único que queda por hacer de forma recurrente, y no hace falta tocar código.

1. Añadir el objeto a [`docs/data/normas.json`](docs/data/normas.json) siguiendo [MODELO-DATOS.md](MODELO-DATOS.md). **Las relaciones se declaran por las dos puntas** (`modifica` ↔ `modificadaPor`), y hay que revisar si la norma nueva cambia el `estado` de alguna existente: es el error más fácil de cometer y el que más daño hace.
2. Antes de declarar que deroga o modifica a otra, consultar el análisis jurídico del DOGV en lugar de deducirlo del preámbulo (D21), y comprobar que el PDF que se enlaza es el que dice ser (D9). Que la API responda no basta: ni el DOGV ni el BOE devuelven 404 cuando el documento no existe.
3. Si además se transcribe su articulado: escribir `docs/data/texto/<id>.json`, copiar `docs/norma/orden-8-2025.html` con el nombre `<id>.html` y poner `"texto": true` en la norma. El script deduce de cuál se trata por el nombre del fichero (D23). **Cada párrafo tiene que aparecer literalmente en el PDF de origen** (invariante 10).
4. Si lleva preguntas frecuentes: `docs/data/consulta/<id>.json` y `"consulta": true`. Ninguna respuesta va sin epígrafe y sin la frase literal en que se apoya (D18).
5. Si lleva esquema: `docs/data/esquema/<id>.json`, copiar `docs/esquema/lo-3-2022.html` con el nombre `<id>.html` y poner `"esquema": true`. Los tipos de bloque están en [MODELO-DATOS.md](MODELO-DATOS.md), y **toda cita necesita el artículo del que sale** (D29).
6. Abrir el diagnóstico, que valida los invariantes solo, y subir `VERSION` en `docs/assets/js/comun.js` si se ha tocado algún script.

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
