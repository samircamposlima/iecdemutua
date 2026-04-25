import './src/services/firebase';
import React,{ useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import notifee, { AndroidImportance } from '@notifee/react-native';
import BootSplash from "react-native-bootsplash";

export default function App() {

  useEffect(() => {
    const setupNotifications = async () => {
      await notifee.createChannel({
        id: 'eventos_lembretes',
        name: 'Lembretes e Pedidos',
        importance: AndroidImportance.HIGH,
        vibration: true,
      });

      await notifee.requestPermission();
      
      // ESCONDER A SPLASH SCREEN AQUI
      // O delay de 250ms evita um "piscar" brusco na transição
      setTimeout(() => {
        BootSplash.hide({ fade: true });
      }, 250);
    };

    setupNotifications();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
