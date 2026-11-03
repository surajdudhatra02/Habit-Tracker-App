import { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabase';
import { useDeepLink, useFCMToken, useNotificationPermission } from '../hooks';
import { useHabitStore } from '../store';
import { showErrorToast } from '../utils/toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  useDeepLink();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useNotificationPermission(user?.id ?? null);
  useFCMToken(user?.id ?? null);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;
    const applySession = (nextSession: Session | null) => {
      const currentUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(currentUser);
      // Do not await backend work inside Supabase's auth event callback.
      useHabitStore
        .getState()
        .setUserId(currentUser?.id ?? null)
        .catch(error => {
          console.error('Failed to synchronize account habits:', error);
          if (active)
            showErrorToast(
              'Unable to synchronize habits and reminders',
              'Please reopen the app to retry.',
            );
        });
      if (!nextSession) setIsPasswordRecovery(false);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      receivedAuthEvent = true;
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      applySession(nextSession);
    });

    // A late startup result must not overwrite a newer SIGNED_IN/SIGNED_OUT.
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (active && !receivedAuthEvent) applySession(data.session);
      })
      .catch(error => {
        console.error('Failed to restore session:', error);
        if (active && !receivedAuthEvent) applySession(null);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
