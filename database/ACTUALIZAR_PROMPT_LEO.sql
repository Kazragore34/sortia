-- ============================================================================
-- ACTUALIZACIÓN DEL PROMPT DE LEO
-- ============================================================================
-- 
-- IMPORTANTE: Actualizar las referencias de "documents" a "tickets_documents"
-- en el prompt del agente IA en n8n
-- ============================================================================

-- NOTA: Este archivo es solo para referencia.
-- Las consultas SQL que el agente debe usar son:

-- Disponibilidad General:
-- SELECT COUNT(*) FROM public.tickets_documents WHERE estado = 'disponible';

-- Disponibilidad Específica (un número):
-- SELECT estado FROM public.tickets_documents WHERE id_tickets = [numero];

-- Disponibilidad Específica (varios números):
-- SELECT id_tickets, estado FROM public.tickets_documents WHERE id_tickets IN ([lista_de_numeros]);

-- Buscar Números al Azar:
-- SELECT id_tickets FROM public.tickets_documents WHERE estado = 'disponible' ORDER BY random() LIMIT [cantidad];

-- Reservar los Números:
-- UPDATE public.tickets_documents SET estado = 'reservado', N_Whats = '[ID_del_ticket]' WHERE id_tickets IN ([lista_de_numeros]) AND estado = 'disponible';

-- Marcar documentos como ocupados:
-- UPDATE public.tickets_documents SET estado = 'ocupado' WHERE N_Whats = '[ID_del_ticket]';

-- Liberar documentos:
-- UPDATE public.tickets_documents SET estado = 'disponible', N_Whats = NULL WHERE N_Whats = '[ID_del_ticket]' AND estado = 'reservado';

