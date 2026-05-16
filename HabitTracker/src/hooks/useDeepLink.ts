import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Linking } from 'react-native';

export const useDeepLink = () => {
  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      
      try {
        if (url.includes('?code=') || url.includes('&code=')) {
          const codeMatch = url.match(/code=([^&]+)/);
          if (codeMatch && codeMatch[1]) {
            await supabase.auth.exchangeCodeForSession(codeMatch[1]);
          }
        } else if (url.includes('access_token=') && url.includes('refresh_token=')) {
          const access_token_match = url.match(/access_token=([^&]+)/);
          const refresh_token_match = url.match(/refresh_token=([^&]+)/);
          
          if (access_token_match && access_token_match[1] && refresh_token_match && refresh_token_match[1]) {
            await supabase.auth.setSession({
              access_token: access_token_match[1],
              refresh_token: refresh_token_match[1],
            });
          }
        }
      } catch (error) {
        console.error('Error handling deep link auth:', error);
      }
    };

    const handle = ({ url }: { url: string }) => {
      handleUrl(url);
    };

    Linking.getInitialURL().then(handleUrl);

    const sub = Linking.addEventListener('url', handle);

    return () => sub.remove();
  }, []);
};
