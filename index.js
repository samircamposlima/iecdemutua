/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging'; // Importe o messaging
import App from './App';
import { name as appName } from './app.json';

// LÓGICA DE BACKGROUND: Deve ser definida fora de qualquer componente
// Garante que o Android processe a notificação sem precisar abrir o app
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Notificação recebida em Background:', remoteMessage.notification);
  // Aqui você pode adicionar lógica de exibição ou processamento de dados silencioso
});

AppRegistry.registerComponent(appName, () => App);