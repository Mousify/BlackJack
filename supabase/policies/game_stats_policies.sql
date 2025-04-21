-- Update RLS policies for game_stats table
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own game stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can update their own game stats" ON public.game_stats;
DROP POLICY IF EXISTS "Service role can insert game stats" ON public.game_stats;
DROP POLICY IF EXISTS "Service role can update game stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can insert their own game stats" ON public.game_stats;

-- Create new policies
CREATE POLICY "Users can view their own game stats"
ON public.game_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game stats"
ON public.game_stats FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game stats"
ON public.game_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert game stats"
ON public.game_stats FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update game stats"
ON public.game_stats FOR UPDATE
USING (true);
