-- ============================================================================
-- SCRIPT FINAL DE BASE DE DATOS SUPABASE
-- Sistema de Tickets para Rifa (1000 tickets: 0-999)
-- ============================================================================
-- 
-- IMPORTANTE: Este script crea la estructura EXACTA que necesita n8n
-- - Tabla documents con embeddings para Vector Store
-- - Tabla n8n_chat_histories con message como JSON (NO text)
-- - Tabla tickets para gestionar compras
-- - Funciones SQL para consultas
-- ============================================================================

-- ========= PASO 0: LIMPIAR EXTENSIÓN VECTOR (si existe) =========
DROP EXTENSION IF EXISTS vector CASCADE;

-- ========= PASO 1: HABILITAR EXTENSIÓN PGVECTOR =========
CREATE EXTENSION vector;

-- ========= PASO 2: CREAR TIPOS ENUM =========

-- Tipo para estados de tickets individuales (en tabla documents)
DROP TYPE IF EXISTS ticket_estado_document CASCADE;
CREATE TYPE ticket_estado_document AS ENUM ('disponible', 'reservado', 'ocupado');

-- Tipo para estados de compras (en tabla tickets)
DROP TYPE IF EXISTS ticket_estado CASCADE;
CREATE TYPE ticket_estado AS ENUM ('pendiente', 'pagado', 'no_pagado');

-- ========= PASO 3: CREAR TABLA 'documents' CON EMBEDDINGS (Para Vector Store) =========

-- Esta tabla es para el Vector Store de n8n (búsqueda semántica)
DROP TABLE IF EXISTS public.documents CASCADE;

CREATE TABLE public.documents (
    id bigserial PRIMARY KEY,
    content text, -- corresponde a Document.pageContent
    metadata jsonb, -- corresponde a Document.metadata
    embedding vector(1536) -- 1536 funciona para OpenAI embeddings
);

-- Crear índice para búsqueda eficiente de similitud
CREATE INDEX ON public.documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ========= PASO 4: CREAR FUNCIÓN match_documents (Para Vector Store) =========

CREATE OR REPLACE FUNCTION match_documents (
    query_embedding vector(1536),
    match_count int DEFAULT NULL,
    filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
    RETURN QUERY
    SELECT
        documents.id,
        documents.content,
        documents.metadata,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE metadata @> filter
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ========= PASO 5: CREAR TABLA 'tickets' (Para gestionar compras) =========

DROP TABLE IF EXISTS public.tickets CASCADE;

CREATE TABLE public.tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    nombre_completo text,
    estado ticket_estado DEFAULT 'pendiente' NOT NULL
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- ========= PASO 6: CREAR TABLA 'tickets_documents' (Para los 1000 tickets de la rifa) =========

-- Esta tabla almacena los 1000 tickets individuales (0-999)
DROP TABLE IF EXISTS public.tickets_documents CASCADE;

CREATE TABLE public.tickets_documents (
    id_tickets integer PRIMARY KEY,
    N_Whats uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
    estado ticket_estado_document DEFAULT 'disponible' NOT NULL
);

-- Agregar constraint de rango
ALTER TABLE public.tickets_documents
    ADD CONSTRAINT check_id_tickets_range CHECK (id_tickets >= 0 AND id_tickets <= 999);

ALTER TABLE public.tickets_documents ENABLE ROW LEVEL SECURITY;

-- Poblar la tabla con los 1000 tickets (0-999)
INSERT INTO public.tickets_documents (id_tickets, estado)
SELECT generate_series(0, 999), 'disponible'::ticket_estado_document
ON CONFLICT (id_tickets) DO NOTHING;

-- ========= PASO 7: CREAR TABLA 'n8n_chat_histories' (EXACTA como n8n la necesita) =========

-- IMPORTANTE: Esta tabla DEBE tener esta estructura EXACTA para que funcione con n8n
DROP TABLE IF EXISTS public.n8n_chat_histories CASCADE;

CREATE TABLE public.n8n_chat_histories (
    id bigserial PRIMARY KEY, -- int8, Primary Key
    session_id text, -- text, Default NULL
    message jsonb, -- json (NO text), Default NULL - ESTO ES CRÍTICO
    created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_n8n_chat_histories_session_id ON public.n8n_chat_histories(session_id);
CREATE INDEX idx_n8n_chat_histories_created_at ON public.n8n_chat_histories(created_at);

ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- ========= PASO 8: CREAR FUNCIONES SQL PARA CONSULTAS =========

-- Función 1: Verificar disponibilidad de un ticket
CREATE OR REPLACE FUNCTION check_ticket_availability(ticket_number integer)
RETURNS TABLE(id_tickets integer, estado text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT td.id_tickets, td.estado::text
    FROM public.tickets_documents td
    WHERE td.id_tickets = ticket_number;
END;
$$;

-- Función 2: Verificar disponibilidad de varios tickets
CREATE OR REPLACE FUNCTION check_tickets_availability(ticket_numbers integer[])
RETURNS TABLE(id_tickets integer, estado text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT td.id_tickets, td.estado::text
    FROM public.tickets_documents td
    WHERE td.id_tickets = ANY(ticket_numbers)
    ORDER BY td.id_tickets;
END;
$$;

-- Función 3: Contar tickets disponibles
CREATE OR REPLACE FUNCTION count_available_tickets()
RETURNS TABLE(total_disponibles bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*)::bigint as total_disponibles
    FROM public.tickets_documents
    WHERE estado = 'disponible';
END;
$$;

-- Función 4: Buscar tickets al azar
CREATE OR REPLACE FUNCTION get_random_tickets(count_tickets integer)
RETURNS TABLE(id_tickets integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT td.id_tickets
    FROM public.tickets_documents td
    WHERE td.estado = 'disponible'
    ORDER BY random()
    LIMIT count_tickets;
END;
$$;

-- Función 5: Reservar tickets
CREATE OR REPLACE FUNCTION reserve_tickets(
    ticket_numbers integer[],
    nombre_completo text,
    OUT ticket_id uuid,
    OUT tickets_reservados integer[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_ticket_id uuid;
    reserved_ids integer[];
BEGIN
    -- Crear el registro de compra
    INSERT INTO public.tickets (nombre_completo, estado)
    VALUES (nombre_completo, 'pendiente')
    RETURNING id INTO new_ticket_id;
    
    -- Reservar los tickets
    UPDATE public.tickets_documents
    SET estado = 'reservado', N_Whats = new_ticket_id
    WHERE id_tickets = ANY(ticket_numbers)
      AND estado = 'disponible'
    RETURNING id_tickets INTO ARRAY reserved_ids;
    
    ticket_id := new_ticket_id;
    tickets_reservados := reserved_ids;
END;
$$;

-- Función 6: Confirmar pago
CREATE OR REPLACE FUNCTION confirm_payment(ticket_uuid uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ticket_exists boolean;
BEGIN
    -- Verificar que el ticket existe
    SELECT EXISTS(SELECT 1 FROM public.tickets WHERE id = ticket_uuid) INTO ticket_exists;
    
    IF NOT ticket_exists THEN
        RETURN QUERY SELECT false, 'Ticket no encontrado'::text;
        RETURN;
    END IF;
    
    -- Actualizar el ticket a pagado
    UPDATE public.tickets
    SET estado = 'pagado'
    WHERE id = ticket_uuid AND estado = 'pendiente';
    
    -- Marcar documentos como ocupados
    UPDATE public.tickets_documents
    SET estado = 'ocupado'
    WHERE N_Whats = ticket_uuid AND estado = 'reservado';
    
    RETURN QUERY SELECT true, 'Pago confirmado correctamente'::text;
END;
$$;

-- Función 7: Liberar tickets no pagados
CREATE OR REPLACE FUNCTION release_unpaid_tickets(ticket_uuid uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Liberar documentos
    UPDATE public.tickets_documents
    SET estado = 'disponible', N_Whats = NULL
    WHERE N_Whats = ticket_uuid AND estado = 'reservado';
    
    -- Marcar ticket como no pagado
    UPDATE public.tickets
    SET estado = 'no_pagado'
    WHERE id = ticket_uuid AND estado = 'pendiente';
    
    RETURN QUERY SELECT true, 'Tickets liberados correctamente'::text;
END;
$$;

-- ========= PASO 9: POLÍTICAS RLS (Row Level Security) =========

-- Políticas para documents (Vector Store)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.documents;

CREATE POLICY "Enable read access for authenticated users" ON public.documents
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.documents
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Políticas para tickets
DROP POLICY IF EXISTS "Enable read access for tickets" ON public.tickets;
DROP POLICY IF EXISTS "Enable insert access for tickets" ON public.tickets;
DROP POLICY IF EXISTS "Enable update access for tickets" ON public.tickets;

CREATE POLICY "Enable read access for tickets" ON public.tickets
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for tickets" ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for tickets" ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para tickets_documents
DROP POLICY IF EXISTS "Enable all access for tickets_documents" ON public.tickets_documents;

CREATE POLICY "Enable all access for tickets_documents" ON public.tickets_documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para n8n_chat_histories
DROP POLICY IF EXISTS "Enable all access for chat histories" ON public.n8n_chat_histories;

CREATE POLICY "Enable all access for chat histories" ON public.n8n_chat_histories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========= PASO 10: ÍNDICES ADICIONALES =========

-- Índices para tickets_documents
CREATE INDEX IF NOT EXISTS idx_tickets_documents_estado ON public.tickets_documents(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_documents_n_whats ON public.tickets_documents(N_Whats);

-- Índices para tickets
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);

-- ========= PASO 11: PERMISOS PARA FUNCIONES =========

GRANT EXECUTE ON FUNCTION check_ticket_availability(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tickets_availability(integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION count_available_tickets() TO authenticated;
GRANT EXECUTE ON FUNCTION get_random_tickets(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_tickets(integer[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION release_unpaid_tickets(uuid) TO authenticated;

-- ========= FIN DEL SCRIPT =========

-- Verificación: Mostrar resumen
SELECT 
    'Tablas creadas correctamente' as mensaje,
    (SELECT COUNT(*) FROM public.tickets_documents WHERE estado = 'disponible') as tickets_disponibles,
    (SELECT COUNT(*) FROM public.n8n_chat_histories) as historiales_chat;

