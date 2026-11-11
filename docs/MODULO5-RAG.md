# Módulo 5 — Cerebro documental RAG · IdeI SmartDesk AI

**Actualización:** 11/11/2026, **estado:** ingesta y cinco pruebas ciegas finales verificadas.

**Proyecto del usuario:** prototipo académico de automatización administrativa del Instituto de Informática (IdeI), FCEFN / UNSJ; **no equivale a normativa oficial ni autorización de actos administrativos**.

## Enlaces auditables

- [Workflow M5 SmartDesk AI — recuperación y agente](https://masilva.app.n8n.cloud/workflow/JnnApHjEob8uNsiO) — **56 nodos**, M4 preservado, rama manual de pruebas, HITL.
- [Workflow M5 — ingesta documental Supabase](https://masilva.app.n8n.cloud/workflow/T5jqyxqF04AvYxvQ) — **5 nodos**; ejecución n.º **90**, éxito.
- [Supabase proyecto](https://supabase.com/dashboard/project/gxqhcjfwszozualhdkyu) — corpus privado y pgvector.
- [Validación RAG, trazabilidad de ejecución, textos exactos y fallo de calibración](MODULO5-VALIDACION-RAG.md).
- [Workflow n8n M5 — exportación JSON saneada](../workflows/idei-smartdesk-m5-rag.sanitizado.json).
- [Workflow ingesta n8n — exportación JSON saneada](../workflows/idei-smartdesk-m5-ingesta.sanitizado.json).

## Componentes reales

1. **Parseo:** LlamaParse Agentic de `Manual_IDEI_Modulo5.pdf`; capturas originales del usuario muestran las cuatro páginas, títulos y tablas. La plataforma no permitió crear el **índice/Data Source** sin comprar créditos; este paso se sustituyó por Supabase gratuito, con impacto potencial en la evaluación académica.
2. **Curaduría documental:** una fuente canónica, 11 fragmentos en `idei_rag_chunks` con metadatos (versión, sección, página, fuente, checksum SHA-256 `38e42bbfe47915d7e6b458630d668f463ce190b0158fd2949a350f7e7a76cd96`).
3. **Vectorización:** n8n generó 11 embeddings con `text-embedding-3-small` de 1.536 dimensiones y los insertó en `idei_rag_vectors`. Verificación SQL: 11 filas, 11 vectores, una fuente.
4. **Recuperación:** nodo nativo Supabase Vector Store con `mode=retrieve-as-tool`, **Top-K=4**. La función SQL `public.match_idei_documents` implementa **Minimum Score=0,42** por similitud coseno y limita a cuatro documentos; el score y sección quedan en metadatos. La configuración está en el backend, no en un campo nativo de Minimum Score del nodo visual.
5. **Agente:** system prompt obligatorio para 100 % de respaldo en fragmentos recuperados, citas [Fuente: archivo; sección; página], abstención literal `No sé` para ausencia documental y no enviar correos. Un nodo de salida de la rama de pruebas normaliza puntualmente el formato de abstención y conserva `raw_model_output`.
6. **HITL:** para correos externos, la ruta M4+M5 mantiene `Gmail Create Draft`, revisión humana y notificación Slack; no activa envíos automáticos.
7. **Privacidad:** RLS activo en las tablas, lectura pública revocada, credenciales exclusivamente en n8n. Ningún JSON subido a GitHub contiene claves. Workflow de producción permanece inactivo.

## Resultados reales

- **Calibración:** 0,72 causó falsos negativos; 0,55 no reconoció una paráfrasis de deduplicación; diagnóstico observó score 0,4269 para fragmento válido y 0,3493 en consulta sin respuesta; se eligió corte de 0,42.
- **Batería de ajuste:** cinco ejecuciones finales 100–104, **5/5 correctas** (no computadas como evaluación ciega, pues sirvieron para calibración).
- **Batería ciega posterior, sin nuevos ajustes:** ejecuciones **105–109**, **5/5 respuestas correctas**, cuatro citas verificables y un `No sé` exacto. Ver [reporte](MODULO5-VALIDACION-RAG.md).
- **Interpretación:** 100 % *en esta muestra pequeña*, no una tasa de precisión general ni prueba de preparación productiva.

## Gobernanza

**Dueño:** Jefatura administrativa IdeI (prototipo académico). **Revisión:** cada 30 días o tras cambios operativos. **Actualización:** validar versión + autoría + checksum; retirar documento obsoleto del índice y conservarlo en archivo histórico separado, sin embeddings activos. **Seguridad:** excluir credenciales, datos personales, expedientes reales y normativa no autorizada. **Calidad:** reejecutar al menos cinco preguntas ciegas y medir recuperaciones vacías, errores de cita y abstenciones. La operación con comunicaciones oficiales requiere validación institucional.

## Pendiente para PDF formal de entrega

La rúbrica solicita capturas **reales** de (1) Data Source de LlamaCloud con H1/H2/tabla; (2) interfaz de Vector Store Retrieve Tool con Top-K y Minimum Score; (3) System Prompt. La evidencia real que tenemos cubre LlamaParse, SQL/Supabase, configuración textual exportada y ejecuciones n8n. **No falsificar capturas** ni confundir Supabase con índice LlamaCloud. En el nodo n8n la similitud mínima se aplica por SQL y no tiene campo visual; se debe mostrar también consulta SQL de la función y explicar su implementación.

