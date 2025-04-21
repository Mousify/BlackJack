-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists to avoid duplicates
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Insert new profile
  INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at, chips, vip_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NULL,
    NOW(),
    NOW(),
    1000,
    0
  );
  
  -- Wait a moment to ensure profile is created
  PERFORM pg_sleep(0.5);
  
  -- Check if game stats already exists
  IF NOT EXISTS (SELECT 1 FROM public.game_stats WHERE user_id = NEW.id) THEN
    -- Create initial game stats
    INSERT INTO public.game_stats (user_id, hands_played, hands_won, hands_lost, blackjacks, biggest_win, longest_streak)
    VALUES (NEW.id, 0, 0, 0, 0, 0, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
