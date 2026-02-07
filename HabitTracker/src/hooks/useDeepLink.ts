import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Linking } from 'react-native';

export const useDeepLink = () => {
  useEffect(() => {
    const handle = ({ url }: { url: string }) => {
      supabase.auth.exchangeCodeForSession(url);
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        supabase.auth.exchangeCodeForSession(url);
      }
    });

    const sub = Linking.addEventListener('url', handle);

    return () => sub.remove();
  }, []);
};
