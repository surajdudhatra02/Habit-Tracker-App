import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { supabase } from '../lib/supabase';

type AppStatus = 'loading' | 'normal' | 'soft' | 'hard' | 'maintenance';

export interface AppUpdateData {
  status: AppStatus;
  message?: string;
  url?: string;
}

function compareVersions(v1: string, v2: string) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const p1 = v1Parts[i] || 0;
    const p2 = v2Parts[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export function useAppUpdate() {
  const [updateData, setUpdateData] = useState<AppUpdateData>({
    status: 'loading',
  });

  useEffect(() => {
    async function checkUpdate() {
      try {
        const { data: config, error } = await supabase
          .from('app_versions')
          .select('*')
          .eq('platform', Platform.OS)
          .single();

        if (error || !config) {
          setUpdateData({ status: 'normal' });
          return;
        }

        if (config.status === 1) {
          setUpdateData({
            status: 'maintenance',
            message:
              config.status_message ||
              'App is under maintenance. Please try again later.',
          });
          return;
        }

        const currentAppVersion = DeviceInfo.getVersion();

        const isBelowMinVersion =
          compareVersions(currentAppVersion, config.min_version) < 0;
        const isBelowLatestVersion =
          compareVersions(currentAppVersion, config.latest_version) < 0;

        if (isBelowMinVersion) {
          setUpdateData({
            status: 'hard',
            message: config.update_message || 'A required update is available.',
            url: config.update_url,
          });
          return;
        }

        if (isBelowLatestVersion) {
          if (config.update_type === 2) {
            setUpdateData({
              status: 'hard',
              message: config.update_message || 'A new update is available.',
              url: config.update_url,
            });
            return;
          } else if (config.update_type === 1) {
            setUpdateData({
              status: 'soft',
              message: config.toast_message,
              url: config.update_url,
            });
            return;
          } else if (config.update_type === 0) {
            setUpdateData({ status: 'normal' });
            return;
          }
        }

        setUpdateData({ status: 'normal' });
      } catch (err) {
        console.error('Failed to check for updates:', err);
        setUpdateData({ status: 'normal' });
      }
    }

    checkUpdate();
  }, []);

  return updateData;
}