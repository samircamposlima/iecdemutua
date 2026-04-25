import './src/services/firebase';
import React,{ useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import notifee, { AndroidImportance } from '@notifee/react-native';

export default function App() {

 // App.js
useEffect(() => {
  const setupNotifications = async () => {
    // Cria o canal com configurações de alta prioridade
    await notifee.createChannel({
      id: 'eventos_lembretes',
      name: 'Lembretes e Pedidos',
      importance: AndroidImportance.HIGH,
      vibration: true, // Adicionado conforme App.tsx
    });

    await notifee.requestPermission();
  };

  setupNotifications();
}, []);



  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
