-- ============================================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- Sistema de Tickets para Rifa (1000 tickets: 0-999)
-- ============================================================================
-- 
-- ESTE SCRIPT:
-- 1. Crea/Actualiza la estructura de tablas con estados (disponible/reservado/ocupado)
-- 2. Migra datos existentes de 'disponibilidad' boolean a 'estado' ENUM
-- 3. Mantiene document_embeddings solo si se necesita búsqueda semántica
-- 4. Configura políticas RLS para seguridad
--
-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor (gratis, sin servidor)
-- ============================================================================

-- ========= PASO 0: HABILITAR EXTENSIÓN PGVECTOR (si no existe) =========
CREATE EXTENSION IF NOT EXISTS vector;

-- ========= PASO 1: CREAR TIPOS ENUM =========

-- Tipo para estados de tickets individuales (en tabla documents)
DROP TYPE IF EXISTS ticket_estado_document CASCADE;
CREATE TYPE ticket_estado_document AS ENUM ('disponible', 'reservado', 'ocupado');

-- Tipo para estados de compras (en tabla tickets)
DROP TYPE IF EXISTS ticket_estado CASCADE;
CREATE TYPE ticket_estado AS ENUM ('pendiente', 'pagado', 'no_pagado');

-- ========= PASO 2: CREAR/MODIFICAR TABLA 'tickets' =========

-- Si la tabla ya existe, no la borramos (para preservar datos)
CREATE TABLE IF NOT EXISTS public.tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    nombre_completo text,
    estado ticket_estado DEFAULT 'pendiente' NOT NULL
);

-- Agregar columna 'estado' si no existe (para migración)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN estado ticket_estado DEFAULT 'pendiente' NOT NULL;
    END IF;
END $$;

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- ========= PASO 3: CREAR/MODIFICAR TABLA 'documents' =========

-- Si la tabla ya existe, necesitamos migrar datos
CREATE TABLE IF NOT EXISTS public.documents (
    id_tickets integer PRIMARY KEY,
    N_Whats uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
    disponibilidad boolean DEFAULT true NOT NULL  -- Se eliminará después de migrar
);

-- Agregar columna 'estado' si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE public.documents ADD COLUMN estado ticket_estado_document DEFAULT 'disponible' NOT NULL;
    END IF;
END $$;

-- Migrar datos de 'disponibilidad' a 'estado' (si existe la columna disponibilidad)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'documents' 
        AND column_name = 'disponibilidad'
    ) THEN
        -- Migrar: true -> 'disponible', false -> 'ocupado' (si tiene N_Whats) o 'disponible'
        UPDATE public.documents 
        SET estado = CASE 
            WHEN disponibilidad = true THEN 'disponible'::ticket_estado_document
            WHEN N_Whats IS NOT NULL THEN 'ocupado'::ticket_estado_document
            ELSE 'disponible'::ticket_estado_document
        END;
        
        -- Ahora eliminar la columna antigua
        ALTER TABLE public.documents DROP COLUMN IF EXISTS disponibilidad;
    END IF;
END $$;

-- Agregar constraint de rango
ALTER TABLE public.documents
    DROP CONSTRAINT IF EXISTS check_id_tickets_range;
ALTER TABLE public.documents
    ADD CONSTRAINT check_id_tickets_range CHECK (id_tickets >= 0 AND id_tickets <= 999);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Poblar la tabla si está vacía (1000 tickets: 0-999)
INSERT INTO public.documents (id_tickets, estado)
SELECT generate_series(0, 999), 'disponible'::ticket_estado_document
ON CONFLICT (id_tickets) DO NOTHING;

-- ========= PASO 4: TABLA 'document_embeddings' (OPCIONAL - Solo si necesitas búsqueda semántica) =========

-- MANTENER esta tabla solo si planeas usar búsqueda semántica de información sobre la rifa
-- Si NO la necesitas, puedes comentar o eliminar esta sección

CREATE TABLE IF NOT EXISTS public.document_embeddings (
    id bigserial PRIMARY KEY,
    content text NOT NULL,
    metadata jsonb,
    embedding vector(1536) NOT NULL  -- 1536 es la dimensión para OpenAI text-embedding-3-small
);

-- Crear índice para búsqueda eficiente (solo si la tabla tiene datos)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM public.document_embeddings LIMIT 1) THEN
        CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
        ON public.document_embeddings 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    END IF;
END $$;

ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- ========= PASO 5: FUNCIÓN 'match_documents' (Solo si mantienes document_embeddings) =========

-- Esta función es necesaria SOLO si usas el nodo Supabase Vector Store en n8n
-- Si NO usas búsqueda semántica, puedes comentar esta sección

CREATE OR REPLACE FUNCTION public.match_documents (
    query_embedding vector(1536),
    match_count int DEFAULT 5,
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
BEGIN
    RETURN QUERY
    SELECT
        document_embeddings.id,
        document_embeddings.content,
        document_embeddings.metadata,
        1 - (document_embeddings.embedding <=> query_embedding) AS similarity
    FROM public.document_embeddings
    WHERE
        CASE
            WHEN filter = '{}'::jsonb THEN true
            ELSE document_embeddings.metadata @> filter
        END
    ORDER BY document_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ========= PASO 6: TABLA 'n8n_chat_histories' (Para memoria del agente) =========

-- IMPORTANTE: Esta tabla debe tener 'id' como PRIMARY KEY (no session_id)
-- porque el nodo Postgres Chat Memory de n8n lo requiere así
DROP TABLE IF EXISTS public.n8n_chat_histories CASCADE;

CREATE TABLE public.n8n_chat_histories (
    id bigserial PRIMARY KEY,
    session_id text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_n8n_chat_histories_session_id ON public.n8n_chat_histories(session_id);
CREATE INDEX idx_n8n_chat_histories_created_at ON public.n8n_chat_histories(created_at);

ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- ========= PASO 7: POLÍTICAS RLS (Row Level Security) =========

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.document_embeddings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.document_embeddings;
DROP POLICY IF EXISTS "Enable read access for tickets" ON public.tickets;
DROP POLICY IF EXISTS "Enable all access for documents" ON public.documents;
DROP POLICY IF EXISTS "Enable all access for chat histories" ON public.n8n_chat_histories;

-- Políticas para document_embeddings
CREATE POLICY "Enable read access for authenticated users" ON public.document_embeddings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.document_embeddings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Políticas para tickets
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

-- Políticas para documents
CREATE POLICY "Enable all access for documents" ON public.documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para chat histories
CREATE POLICY "Enable all access for chat histories" ON public.n8n_chat_histories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========= PASO 8: ÍNDICES PARA MEJOR RENDIMIENTO =========

-- Índice en documents para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_documents_estado ON public.documents(estado);
CREATE INDEX IF NOT EXISTS idx_documents_n_whats ON public.documents(N_Whats);

-- Índice en tickets para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON public.tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);

-- ========= FIN DEL SCRIPT =========

-- Verificación: Mostrar resumen de tablas creadas
SELECT 
    'Tablas creadas/actualizadas:' as mensaje,
    COUNT(*) as total_tickets_disponibles
FROM public.documents 
WHERE estado = 'disponible';

