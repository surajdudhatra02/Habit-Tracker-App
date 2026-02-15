import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Linking } from 'react-native';

export const useDeepLink = () => {
  useEffect(() => {
    const handle = ({ url }: { url: string }) => {
      console.log('Deep link received:', url);
      supabase.auth.exchangeCodeForSession(url);
      console.log('Session exchanged');
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('Initial URL:', url);
        supabase.auth.exchangeCodeForSession(url);
      }
    });

    const sub = Linking.addEventListener('url', handle);

    return () => sub.remove();
  }, []);
};
