-- ============================================================================
-- FUNCIONES SQL PARA SUPABASE - Herramientas para el Agente IA
-- ============================================================================
-- 
-- Estas funciones permiten que el agente IA ejecute consultas SQL de forma
-- segura a través de la API REST de Supabase.
--
-- USO: Llamar estas funciones desde n8n usando HTTP Request a:
-- https://[tu-proyecto].supabase.co/rest/v1/rpc/[nombre_funcion]
-- ============================================================================

-- ========= FUNCIÓN 1: Verificar Disponibilidad de un Ticket =========

CREATE OR REPLACE FUNCTION check_ticket_availability(ticket_number integer)
RETURNS TABLE(id_tickets integer, estado text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id_tickets, d.estado::text
    FROM public.documents d
    WHERE d.id_tickets = ticket_number;
END;
$$;

-- ========= FUNCIÓN 2: Verificar Disponibilidad de Varios Tickets =========

CREATE OR REPLACE FUNCTION check_tickets_availability(ticket_numbers integer[])
RETURNS TABLE(id_tickets integer, estado text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id_tickets, d.estado::text
    FROM public.documents d
    WHERE d.id_tickets = ANY(ticket_numbers)
    ORDER BY d.id_tickets;
END;
$$;

-- ========= FUNCIÓN 3: Contar Tickets Disponibles =========

CREATE OR REPLACE FUNCTION count_available_tickets()
RETURNS TABLE(total_disponibles bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*)::bigint as total_disponibles
    FROM public.documents
    WHERE estado = 'disponible';
END;
$$;

-- ========= FUNCIÓN 4: Buscar Tickets al Azar =========

CREATE OR REPLACE FUNCTION get_random_tickets(count_tickets integer)
RETURNS TABLE(id_tickets integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT d.id_tickets
    FROM public.documents d
    WHERE d.estado = 'disponible'
    ORDER BY random()
    LIMIT count_tickets;
END;
$$;

-- ========= FUNCIÓN 5: Reservar Tickets =========

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
    UPDATE public.documents
    SET estado = 'reservado', N_Whats = new_ticket_id
    WHERE id_tickets = ANY(ticket_numbers)
      AND estado = 'disponible'
    RETURNING id_tickets INTO ARRAY reserved_ids;
    
    ticket_id := new_ticket_id;
    tickets_reservados := reserved_ids;
END;
$$;

-- ========= FUNCIÓN 6: Confirmar Pago =========

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
    UPDATE public.documents
    SET estado = 'ocupado'
    WHERE N_Whats = ticket_uuid AND estado = 'reservado';
    
    RETURN QUERY SELECT true, 'Pago confirmado correctamente'::text;
END;
$$;

-- ========= FUNCIÓN 7: Liberar Tickets No Pagados =========

CREATE OR REPLACE FUNCTION release_unpaid_tickets(ticket_uuid uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Liberar documentos
    UPDATE public.documents
    SET estado = 'disponible', N_Whats = NULL
    WHERE N_Whats = ticket_uuid AND estado = 'reservado';
    
    -- Marcar ticket como no pagado
    UPDATE public.tickets
    SET estado = 'no_pagado'
    WHERE id = ticket_uuid AND estado = 'pendiente';
    
    RETURN QUERY SELECT true, 'Tickets liberados correctamente'::text;
END;
$$;

-- ========= GRANT PERMISSIONS =========

-- Dar permisos a usuarios autenticados para ejecutar estas funciones
GRANT EXECUTE ON FUNCTION check_ticket_availability(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tickets_availability(integer[]) TO authenticated;
GRANT EXECUTE ON FUNCTION count_available_tickets() TO authenticated;
GRANT EXECUTE ON FUNCTION get_random_tickets(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_tickets(integer[], text) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_payment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION release_unpaid_tickets(uuid) TO authenticated;

-- ========= FIN DEL SCRIPT =========

-- Verificación: Probar una función
SELECT * FROM check_ticket_availability(50);

