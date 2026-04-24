import './src/services/firebase';
import React,{ useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import notifee, { AndroidImportance } from '@notifee/react-native';

export default function App() {

  useEffect(() => {
    // Configuração inicial do canal de notificação (Obrigatório para Android)
    const setupNotifications = async () => {
      // Cria o canal necessário para o Android exibir os alertas
      await notifee.createChannel({
        id: 'eventos_lembretes',
        name: 'Lembretes e Pedidos',
        importance: AndroidImportance.HIGH,
      });

      // Opcional: Solicita permissão para Android 13+
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
