# Módulo 5 — Cerebro Documental RAG | IdeI SmartDesk AI

**Alumno:** Matías Silva · **Fecha:** 10/11/2026 · **Estado:** configuración parcial verificable (no presentar como pruebas finales).

El checkpoint **evoluciona el workflow real del Módulo 4**, manteniendo Gmail Trigger, filtro anti-loop, Airtable CRM, Gmail **Create Draft** (HITL) y alerta a Slack. No se altera ni activa el M4 original.

## Evidencia técnica
- **M4 base (conservado):** `zEqwm7nIX1tCliOA` (50 nodos).
- **M5 creado en n8n:** [IdeI SmartDesk AI | M5 Cerebro documental RAG](https://masilva.app.n8n.cloud/workflow/JnnApHjEob8uNsiO) (54 nodos, inactivo).
- **Exportación reutilizable:** [`workflows/idei-smartdesk-m5-rag.sanitizado.json`](../workflows/idei-smartdesk-m5-rag.sanitizado.json). Se omitieron credenciales y webhooks.
- **Herramienta RAG:** `M5 | Vector Store Retrieve Tool (LlamaCloud)` (HTTP Request Tool conectado por `ai_tool`, interfaz equivalente).
- **Endpoint oficial:** `POST https://api.cloud.llamaindex.ai/api/v1/retrieval/retrieve`; `top_k: 4` y `score_threshold: 0.72`.
- **Prompts:** obligación de consultar y citar fragmentos, afirmaciones 100 % basadas en evidencia y respuesta exacta `No sé` ante vacíos.
- **Tests:** rama independiente de disparo manual (sin escrituras Gmail/Airtable ni notificaciones Slack).

## Qué falta para cerrar la rúbrica

1. En LlamaCloud, crear un proyecto e índice documental privado y cargar el archivo `Manual_Operativo_IDEI_SmartDesk_RAG_v1.pdf` generado como fuente. Verificar procesamiento de jerarquía H1/H2 y tablas preservadas; obtener captura **auténtica** del Data Source.
2. Configurar la credencial de autenticación del HTTP Request Tool en n8n **sin incluir la clave en el JSON o capturas**. Tipo previsto: `httpTemplatedCustomAuth`; Header `Authorization: Bearer <LLAMA_CLOUD_API_KEY>`. Sustituir el placeholder `PENDIENTE_INDEX_ID_LLAMA` con el `index_id` real del índice. El índice y la credencial **no están conectados todavía**.
3. Capturar el nodo con `top_k=4` y `score_threshold=0.72` y el editor del System Prompt con regla `No sé`.
4. Ejecutar **cinco preguntas ciegas reales** con la rama de prueba, conservar fragmentos, scores, citas, respuestas textuales y IDs de ejecución, computar `casos correctos/5`. Incluir un caso `No sé` y fallos reales si aparecieran.
5. Actualizar el PDF de entrega formal `PreEntrega_Modulo5_MatiasSilva.pdf` con las evidencias originales de los pasos previos. No inferir métricas ni falsificar capturas.

El PDF preliminar y el documento maestro están disponibles en el paquete de entrega preparado en la conversación de ChatGPT. El manual documenta **un prototipo académico, no normas oficiales de la UNSJ**.

## Decisión de arquitectura
El nodo LlamaParse nativo de esta instancia expone `topK` pero no `score_threshold`. Se usó la API oficial, que permite ambos parámetros de forma explícita y medible, mediante una herramienta `HTTP Request Tool` de n8n. [Referencia técnica de LlamaCloud](https://developers.llamaindex.ai/reference/resources/retrieval/methods/retrieve/).

**Protección de datos:** exportación sin credenciales; no publicar documentos internos confidenciales, datos personales ni claves.
