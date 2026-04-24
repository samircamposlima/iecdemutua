import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const auth = getAuth();
  const db = getFirestore();

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    // 1. Se não há usuário, limpa tudo imediatamente e para o loading
    if (!firebaseUser) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    // 2. Se há usuário, buscamos o role ANTES de desligar o loading
    try {
      setUser(firebaseUser);

      // Busca UID de emergência
      const emergencySnap = await getDoc(doc(db, 'config', 'emergency'));
      const emergencyUid = emergencySnap.exists ? emergencySnap.data().uid : null;

      if (firebaseUser.uid === emergencyUid) {
        setRole('admin');
      } else {
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userRole = userSnap.exists ? userSnap.data().role : 'pendente';
        setRole(userRole);
      }
    } catch (error) {
      console.error('Erro ao buscar role:', error);
      setRole('visitante'); // Fallback para não travar o app
    } finally {
      // 3. SÓ DESLIGA O LOADING após ter o user E o role definidos
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