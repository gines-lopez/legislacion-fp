# Modelo de datos

`docs/data/normas.json` es la fuente de verdad única (ver D3 en [DECISIONES.md](DECISIONES.md)). Es un array de objetos norma.

## Ficha de norma

```json
{
  "id": "decreto-114-2025",
  "tipo": "decreto",
  "numero": "114/2025",
  "fecha": "2025-07-29",
  "titulo": "Decreto 114/2025, de 29 de julio, del Consell, por el que se establecen los currículos de los ciclos formativos de grado medio y grado superior",
  "resumen": "Fija el currículo autonómico de los ciclos de grado medio y superior en la Comunitat Valenciana.",
  "ambito": "autonomico",
  "seccion": "ordenacion-academica",
  "estado": "modificada",
  "modificadaPor": ["decreto-95-2026"],
  "modifica": [],
  "deroga": [],
  "enlaces": [
    { "etiqueta": "DOGV", "url": "https://dogv.gva.es/…", "formato": "pdf" }
  ],
  "etiquetas": ["curriculo", "grado-medio", "grado-superior"]
}
```

## Campos

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único. Kebab-case derivado de tipo y número: `decreto-114-2025`, `rd-659-2023`, `resolucion-2026-07-16`. Es la URL de la ficha, así que **no se renombra** una vez publicado. |
| `tipo` | enum | sí | `ley-organica`, `real-decreto`, `decreto`, `orden`, `resolucion`, `instrucciones`, `guia`, `anexo`, `calendario`. |
| `numero` | string | no | Tal cual se cita: `114/2025`. Las resoluciones e instrucciones a menudo no tienen, y se identifican por fecha. |
| `fecha` | string | sí | ISO `AAAA-MM-DD`. La de la norma, no la de publicación en diario. |
| `titulo` | string | sí | Título oficial completo, sin abreviar. Es lo que se cita. |
| `resumen` | string | sí | Una o dos frases en lenguaje llano: qué resuelve y a quién afecta. Redacción propia, no copiar el preámbulo. |
| `ambito` | enum | sí | `estatal` o `autonomico`. |
| `seccion` | enum | sí | Ver más abajo. |
| `estado` | enum | sí | `vigente`, `modificada`, `derogada`. `modificada` significa vigente pero con reformas: sigue siendo aplicable. |
| `modificadaPor` / `modifica` / `deroga` | array de `id` | sí (pueden ir vacíos) | Relaciones entre normas. |
| `enlaces` | array | sí, mínimo uno | `etiqueta` (`DOGV`, `PDF del DOGV`, `BOE`, `CEICE`, `Corrección de errores`), `url` y `formato` (`pdf` o `html`). Ver D9 en [DECISIONES.md](DECISIONES.md). |
| `etiquetas` | array de string | no | Kebab-case, transversales a las secciones: `dual`, `grado-basico`, `fct`, `curriculo`, `optatividad`. |

## Secciones

Corresponden a los bloques de la web original y ordenan la portada:

`ordenacion-academica` · `curso-actual` · `desdobles` · `anexos` · `optatividad` · `cursos-anteriores`

`curso-actual` es deliberadamente genérico y no lleva el año en el identificador: al empezar un curso nuevo, sus normas pasan a `cursos-anteriores` y las nuevas ocupan su lugar, sin renombrar nada.

## Invariantes

Deben cumplirse siempre; conviene comprobarlos tras cada tanda de cambios.

1. `id` único en todo el fichero.
2. Todo `id` citado en `modificadaPor`, `modifica` o `deroga` existe como norma.
3. **Simetría de relaciones:** si A declara `modificadaPor: [B]`, entonces B declara `modifica: [A]`. Igual con `deroga`. Una relación declarada por un solo lado es un error, no una abreviatura.
4. `estado: "modificada"` exige `modificadaPor` no vacío. `estado: "derogada"` exige que alguna norma la liste en su `deroga`.
5. Ninguna norma `derogada` en `curso-actual`: si ha sido sustituida, va a `cursos-anteriores`.
6. `enlaces` con al menos una entrada, y ninguna URL a un dominio distinto de `dogv.gva.es`, `boe.es` o `ceice.gva.es` sin justificarlo.

## Al añadir una norma

Actualizar **las dos** puntas de cada relación, y revisar si la nueva norma cambia el `estado` de otra existente. Es el error más fácil de cometer y el que produce el fallo más grave: mostrar como vigente algo que ya no lo está.
