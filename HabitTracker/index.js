/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './global.css';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandlers } from './src/lib/backgroundHandlers';

// Register FCM + Notifee background/kill mode handlers.
// Must run BEFORE AppRegistry.registerComponent — see backgroundHandlers.ts.
registerBackgroundHandlers();

AppRegistry.registerComponent(appName, () => App);
