import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { messaging } from '../services/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Definimos a função de tópicos FORA do useEffect para organização
  const configurarTopicos = async (userRole) => {
    try {
      if (userRole === 'admin') {
        await messaging().subscribeToTopic('admins');
        await messaging().subscribeToTopic('membros'); 
        await messaging().subscribeToTopic('todos');   
      } else if (userRole === 'membro') {
        await messaging().subscribeToTopic('membros');
        await messaging().subscribeToTopic('todos');
        await messaging().unsubscribeFromTopic('admins');
      } else {
        await messaging().subscribeToTopic('todos');
        await messaging().unsubscribeFromTopic('membros');
        await messaging().unsubscribeFromTopic('admins');
      }
      console.log(`Inscrito nos tópicos para: ${userRole}`);
    } catch (e) {
      console.error("Erro na inscrição de tópicos:", e);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setUser(firebaseUser);

        const emergencySnap = await getDoc(doc(db, 'config', 'emergency'));
        const emergencyUid = emergencySnap.exists ? emergencySnap.data().uid : null;

        let currentRole = 'visitante'; // Variável local para evitar atraso do useState

        if (firebaseUser.uid === emergencyUid) {
          currentRole = 'admin';
        } else {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          currentRole = userSnap.exists ? userSnap.data().role : 'pendente';
        }

        setRole(currentRole);
        
        // 2. CHAMADA CORRETA: Aqui dentro, onde 'currentRole' existe!
        await configurarTopicos(currentRole);

      } catch (error) {
        console.error('Erro ao buscar role:', error);
        setRole('visitante');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function signIn(email, password) {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(getAuth());
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  }

  const isVisitor = !user;

  return (
    <AuthContext.Provider value={{ user, role, loading, isVisitor, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}