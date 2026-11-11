# Módulo 5 — Evaluación real del RAG · IdeI SmartDesk AI

**Fecha de validación:** 11/11/2026 UTC / 10/11/2026 Argentina.  
**Entorno:** n8n workflow `JnnApHjEob8uNsiO` (rama manual aislada), Supabase project `gxqhcjfwszozualhdkyu`, pgvector, `text-embedding-3-small` 1536 dimensiones.  
**Documento base:** `Manual_IDEI_Modulo5.pdf`, prototipo académico, **NO norma UNSJ**, SHA-256 `38e42bbfe47915d7e6b458630d668f463ce190b0158fd2949a350f7e7a76cd96`.

## Estado constatado

- Documento procesado realmente en LlamaParse (4 páginas). Captura original del usuario de Markdown con tabla de componentes preservada.
- Supabase: 1 fuente documental, 11 fragmentos de texto y 11 embeddings (1.536 dimensiones); 0 acceso de lectura para roles `anon` y `authenticated` por la API.
- **Top-K = 4**. **Minimum Score = 0,42**, aplicado en SQL en la función `public.match_idei_documents`; similitud coseno `1 - distancia`. El nodo n8n de Supabase expone Top-K, pero el score mínimo se implementa en la función.
- Agente con System Prompt de recuperación obligatoria, referencia a documento/sección/página y respuesta `No sé` para falta de evidencia. Normalizador de abstención registra respuesta original y salida literal.
- La ruta de prueba manual no llama a Gmail, Slack ni Airtable CRM.
- M4 original permanece intacto. M5 queda inactivo para producción.

## Calibración (NO computada como evaluación ciega)

1. Ejecución **91**: umbral 0,72, pregunta coloquial sobre borradores → 0 fragmentos, respuesta `No sé.`; umbral excesivo.
2. Ejecución **92**: umbral 0,55, misma consulta → recuperó referencia documental; respuesta correcta.
3. Ejecución **95**: umbral 0,55, pregunta sobre «ficha repetida» → 0 fragmentos; falso negativo.
4. Ejecución **98**: diagnóstico sin umbral, pregunta «ficha repetida» → mejor fragmento sección 4, **score 0,4269**; respuesta correcta.
5. Ejecución **99**: diagnóstico sin umbral, pregunta sobre plazo oficial no documentado → mejor resultado **score 0,3493**; respuesta `No sé.`
6. Por separación observada entre 0,4269 y 0,3493 se fijó **0,42** (provisional; debe reevaluarse con corpus mayor). La batería de verificación 100–104 obtuvo cinco respuestas correctas, pero se usó durante la calibración y **no se presenta como evaluación ciega**.

## Segunda batería ciega — cinco preguntas nuevas, configuración congelada

**Regla de veredicto:** respuesta veraz, sustentada en los fragmentos recuperados, cita válida cuando corresponde y abstención exacta si el dato no consta. Resultados extraídos de ejecuciones reales de n8n, sin fabricar capturas ni respuestas.

### 1. Ejecución 105 — Automatismos

**Pregunta:** ¿Qué ocurre si llega un mensaje automático de vacaciones al buzón del Instituto?

**Chunks obtenidos:** #4, sección 3.2, página 2, score **0,4548**; #1, sección 1, página 1, score **0,4506**.

**Respuesta exacta del agente:**
> Si llega un mensaje automático de vacaciones al buzón del Instituto, este será descartado sin consulta al CRM, sin generar borrador y sin aviso en Slack. Esto se debe a que el sistema identifica automáticamente estos mensajes como auto-reply, out of office, undeliverable y remitentes no-reply [Fuente: Manual_IDEI_Modulo5.pdf; sección 3.2; página 2].

**Veredicto:** Correcto: el chunk #4 respalda que no se consulta CRM, no se crea draft y no hay aviso Slack.

### 2. Ejecución 106 — HITL

**Pregunta:** ¿Puede SmartDesk despachar respuestas por su cuenta o requiere autorización de una persona?

**Chunks obtenidos:** #10, sección 9, p. 3, **0,5597**; #6, sección 5, p. 2, **0,5208**; #9, sección 8, p. 3, **0,4992**; #4, sección 3.2, p. 2, **0,4951**.

**Respuesta exacta del agente:**
> SmartDesk no despacha respuestas por su cuenta. El sistema crea un borrador que debe ser revisado y aprobado por una persona autorizada antes de ser enviado. Esto asegura que la revisión y el eventual envío sean realizados por humanos [Fuente: Manual_IDEI_Modulo5.pdf; sección 5.2; página 2].

**Veredicto:** Correcto; Gmail Create Draft no es Send; sigue revisión humana.

### 3. Ejecución 107 — Deduplicación CRM

**Pregunta:** Cuando vuelve a entrar una consulta desde una dirección ya conocida, ¿se edita el contacto o se crea otro?

**Chunks obtenidos:** #5, sección 4, p. 2, **0,5929**.

**Respuesta exacta del agente:**
> Cuando vuelve a entrar una consulta desde una dirección ya conocida, se edita el contacto existente en lugar de crear otro. Esto se realiza para reducir errores de registros duplicados y evitar la creación innecesaria en el CRM [Fuente: Manual_IDEI_Modulo5.pdf; sección 4.1; página 2].

**Veredicto:** Correcto; lookup por email y actualización del registro encontrado.

### 4. Ejecución 108 — Notificación de revisión

**Pregunta:** ¿Qué canal usan para avisar que quedó pendiente la revisión de un borrador?

**Chunks obtenidos:** #6, sección 5, p. 2, **0,4967**; #9, sección 8, p. 3, **0,4469**.

**Respuesta exacta del agente:**
> El canal utilizado para avisar que quedó pendiente la revisión de un borrador es Slack. Después de la creación del borrador, se informa al canal del equipo sobre el asunto, el identificador del borrador y la obligación de revisión humana. Esta notificación es meramente informativa y no constituye una aprobación ni respuesta oficial [Fuente: Manual_IDEI_Modulo5.pdf; sección 5; página 2].

**Veredicto:** Correcto; la notificación está documentada en §5.3.

### 5. Ejecución 109 — Abstención sobre norma no documentada

**Pregunta:** ¿Qué fecha límite legal rige para que se resuelvan pedidos de licencia por enfermedad en la UNSJ?

**Chunks obtenidos:** **ninguno** (todos bajo score 0,42).

**Respuesta exacta del agente:**
> No sé

**Veredicto:** Correcto; ninguna fuente cargada acredita un plazo legal. La salida contiene exactamente `No sé`, sin punto.

## Métrica y límites

**Aciertos = 5/5 = 100 %**, solo sobre esta batería ciega de cinco preguntas. Cuatro respuestas documentadas con citas válidas; una abstención literal. Cinco ejecuciones reales verificadas: **105, 106, 107, 108, 109**, todas `success`.

**Precisión observada de respuestas = 5/5 (100 %).** Esta medida NO equivale a precisión estadística general ni a precisión@K de fragmentos. Una muestra de cinco preguntas no basta para establecer robustez productiva.

**Análisis crítico:** el score 0,72 y 0,55 generó falsos negativos para preguntas cotidianas; se recalibró a 0,42 sin recalibrar después durante la batería ciega. La fuente es un único manual pequeño y contiene preguntas frecuentes similares, por lo que las pruebas siguen siendo cercanas al dominio conocido. Antes de producción: test de no-respuesta más amplio, consultas adversariales, citas equivocadas, cambios de versión y controles de acceso.

## Integridad y evidencia

En n8n: menú **Executions** del workflow M5, IDs 91, 92, 95, 98, 99 y 105–109; los nodos `M5 | Supabase Vector Store Retrieve Tool`, `M5 02 | Agente documental de validación` y `M5 03 | Control de abstención literal` conservan datos de ejecución.

**Limitaciones formales de la consigna:** se utilizó Supabase en lugar del índice de pago de LlamaCloud. La captura de procesamiento real en LlamaParse sí existe; no existe Data Source LlamaCloud indexado. Las capturas auténticas del editor del nodo vectorial y del System Prompt de n8n deben obtenerse del editor; los JSON/exportaciones no sustituyen esas capturas.
