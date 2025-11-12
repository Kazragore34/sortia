-- ============================================================================
-- SCRIPT DE CORRECCIÓN: Tabla n8n_chat_histories para Postgres Chat Memory
-- ============================================================================
-- 
-- PROBLEMA: La tabla n8n_chat_histories tiene session_id como PRIMARY KEY,
-- pero el nodo Postgres Chat Memory de n8n espera un campo 'id' como PRIMARY KEY.
--
-- SOLUCIÓN: Recrear la tabla con la estructura correcta que espera n8n.
-- ============================================================================

-- Paso 1: Eliminar la tabla antigua (si existe)
DROP TABLE IF EXISTS public.n8n_chat_histories CASCADE;

-- Paso 2: Crear la tabla con la estructura correcta que espera n8n
CREATE TABLE public.n8n_chat_histories (
    id bigserial PRIMARY KEY,
    session_id text NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Paso 3: Crear índice en session_id para búsquedas rápidas
CREATE INDEX idx_n8n_chat_histories_session_id ON public.n8n_chat_histories(session_id);

-- Paso 4: Crear índice en created_at para ordenar por fecha
CREATE INDEX idx_n8n_chat_histories_created_at ON public.n8n_chat_histories(created_at);

-- Paso 5: Habilitar Row Level Security
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Paso 6: Crear políticas RLS
DROP POLICY IF EXISTS "Enable all access for chat histories" ON public.n8n_chat_histories;

CREATE POLICY "Enable all access for chat histories" ON public.n8n_chat_histories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Paso 7: Verificación
SELECT 
    'Tabla n8n_chat_histories corregida correctamente' as mensaje,
    COUNT(*) as total_registros
FROM public.n8n_chat_histories;

