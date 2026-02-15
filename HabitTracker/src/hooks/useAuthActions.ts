import { Linking } from 'react-native';
import { supabase } from '../lib/supabase';

const REDIRECT_URL = 'habittracker://auth';

export const useAuthActions = () => {
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URL,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.url) {
      await Linking.openURL(data.url);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: REDIRECT_URL,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.session && data.user !== null,
    };
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: REDIRECT_URL,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    resendConfirmationEmail,
  };
};
