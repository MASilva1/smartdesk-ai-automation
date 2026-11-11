# Módulo 5 — Base documental y RAG | IdeI SmartDesk AI

**Alumno:** Matías Silva · **Fecha:** 11 de noviembre de 2026 · **Estado real:** en integración; falta la credencial Supabase en n8n, embeddings y pruebas.

## Arquitectura efectivamente preparada

El proyecto es la continuación **del workflow M4 real**, no un proyecto desde cero. M4 original no se modifica.

- [M5 — SmartDesk AI / agente documental RAG](https://masilva.app.n8n.cloud/workflow/JnnApHjEob8uNsiO) — **55 nodos**, inactivo; Gmail, Airtable CRM, Create Draft HITL, Slack y memoria de conversación se preservan; AI Agent RAG con vector store y regla de cita/«No sé».
- [M5 — Ingesta documental en Supabase](https://masilva.app.n8n.cloud/workflow/T5jqyxqF04AvYxvQ) — **5 nodos**, inactivo; lectura de fragmentos, data loader y OpenAI Embeddings `text-embedding-3-small` (1536 dimensiones), escritura de vectores en Supabase.
- [Supabase — proyecto privado](https://supabase.com/dashboard/project/gxqhcjfwszozualhdkyu) — tabla de fuentes, 11 fragmentos documentales con referencia de sección y página, índice de vectores, funciones de búsqueda semántica y protección RLS.
- [JSON del agente M5](../workflows/idei-smartdesk-m5-rag.sanitizado.json).
- [JSON de ingesta M5](../workflows/idei-smartdesk-m5-ingesta.sanitizado.json).

### Fuente documental

`Manual_IDEI_Modulo5.pdf` — documento normalizado del prototipo IdeI SmartDesk AI, con títulos y tablas. Documento de **estudio y prototipo**, no norma oficial de la Universidad Nacional de San Juan.

- Identificador: `IDEI-SMARTDESK-MAN-RAG-001`.
- SHA-256 PDF: `38e42bbfe47915d7e6b458630d668f463ce190b0158fd2949a350f7e7a76cd96`.
- Tablas: `idei_rag_sources` (1 fuente), `idei_rag_chunks` (11 fragmentos), `idei_rag_vectors` (pendiente de generación).
- Se utiliza un **Data Source Supabase gratuito** porque LlamaCloud exigía pago para crear un índice. No debe presentarse como índice LlamaCloud: la consigna puede penalizar la sustitución.

### Recuperación y anti-alucinación

- Herramienta: Supabase Vector Store (modo `retrieve-as-tool`) con OpenAI Embeddings.
- **Top-K = 4** en n8n; máximo en SQL = 4.
- **Minimum Score = 0.72** en función SQL `match_idei_documents` sobre similitud coseno.
- Justificación: cuatro fragmentos suelen alcanzar para consultas operativas breves sin inyectar exceso de tokens; el umbral inicial conservador reduce recuperación no pertinente, sujeto a recalibración empírica con cinco pruebas ciegas.
- Prompt obliga a consultar la fuente para hechos institucionales, citar documento + sección + página disponible y emitir exactamente `No sé` si no hay evidencia.
- Nunca envía correos sin aprobación humana: se conserva `Gmail Create Draft`.

### Seguridad

- Tablas con **RLS activado** y ningún permiso de lectura `anon` ni `authenticated`; acceso previsto mediante credencial de servidor almacenada **solo en n8n**.
- Ningún JSON de GitHub contiene tokens, claves de autenticación o IDs de webhook.
- El flujo original M4 y la nueva versión M5 están inactivos salvo el proyecto final independiente preexistente; no enviar pruebas por Gmail.

## Intervención mínima pendiente

1. En **n8n > Credentials**, crear la credencial **Supabase API**, eligiendo nombre `Supabase IDEI RAG M5`, Project URL `https://gxqhcjfwszozualhdkyu.supabase.co` y la clave **secret/service_role** obtenida dentro del panel Supabase. **No copiar la clave al chat, PDF, repo ni capturas.**
2. Asignar **esa misma credencial** a los nodos `02 | Leer 11 fragmentos IDEI Supabase`, `03 | Indexar fragmentos vectoriales en Supabase` (workflow de ingesta) y `M5 | Supabase Vector Store Retrieve Tool` (agente).
3. Ejecutar una sola vez la ingesta en n8n. Verificar en Supabase que existan 11 embeddings; el índice rechaza duplicaciones de texto por hash.
4. Ejecutar las cinco preguntas ciegas en la rama manual de pruebas del agente. Registrar fragmentos y respuestas exactas; calcular `aciertos / 5` y revisar fallas. Incluir caso `No sé`.
5. Agregar capturas originales a `PreEntrega_Modulo5_MatiasSilva.pdf` y mantener el estado explícito del índice Supabase en lugar de simular Data Source LlamaCloud.

### Cinco preguntas iniciales de control
1. «¿Si me escribe un bot, también lo atienden?» — manual §3.2.
2. «¿Le responden de una o alguien da el OK?» — manual §5.2.
3. «¿Cómo evitan duplicar una ficha si ya había escrito?» — manual §§4.1–4.2.
4. «¿Dónde aparece que hay un mail pendiente de revisar?» — manual §5.3.
5. «¿Cuántos días da la UNSJ para aprobar una licencia?» — ausencia de dato en §7: corresponde `No sé`.

**No se informan métricas RAG hasta ejecutar las cinco pruebas reales.**
