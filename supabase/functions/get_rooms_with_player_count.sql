CREATE OR REPLACE FUNCTION get_rooms_with_player_count()
RETURNS TABLE (
  id uuid,
  name text,
  host_id uuid,
  max_players integer,
  min_bet integer,
  max_bet integer,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  current_players bigint,
  host_username text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.host_id,
    r.max_players,
    r.min_bet,
    r.max_bet,
    r.status,
    r.created_at,
    r.updated_at,
    COUNT(rp.id)::bigint as current_players,
    p.username as host_username
  FROM 
    multiplayer_rooms r
  LEFT JOIN 
    room_players rp ON r.id = rp.room_id
  LEFT JOIN
    profiles p ON r.host_id = p.id
  WHERE
    r.status = 'waiting'
  GROUP BY 
    r.id, p.username
  ORDER BY 
    r.created_at DESC;
END;
$$ LANGUAGE plpgsql;
