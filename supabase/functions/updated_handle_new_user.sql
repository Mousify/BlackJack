-- Create a function to handle new user creation with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists to avoid duplicates
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RETURN NEW;
  END IF;

  -- Insert new profile with error handling
  BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but continue
      RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Wait a moment to ensure profile is created
  PERFORM pg_sleep(1);
  
  -- Check if profile was actually created
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- Only create game stats if profile exists
  IF profile_exists THEN
    -- Check if game stats already exists
    IF NOT EXISTS (SELECT 1 FROM public.game_stats WHERE user_id = NEW.id) THEN
      -- Create initial game stats with error handling
      BEGIN
        INSERT INTO public.game_stats (user_id, hands_played, hands_won, hands_lost, blackjacks, biggest_win, longest_streak)
        VALUES (NEW.id, 0, 0, 0, 0, 0, 0);
        EXCEPTION WHEN OTHERS THEN
          -- Log the error but continue
          RAISE NOTICE 'Error creating game stats for user %: %', NEW.id, SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
