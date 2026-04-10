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
  const db   = getFirestore();

 const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  try {
    if (firebaseUser) {
      setUser(firebaseUser);

      // 1. Busca o UID de emergência que está no banco (SEM HARDCODE NO CÓDIGO)
      // As Rules permitem a leitura se você estiver logado.
      const emergencySnap = await getDoc(doc(db, 'config', 'emergency'));
      const emergencyUid  = emergencySnap.exists() ? emergencySnap.data().uid : null;

      if (firebaseUser.uid === emergencyUid) {
        setRole('admin');
      } else {
        // 2. Usuário normal
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setRole(userSnap.exists() ? userSnap.data().role : 'membro');
      }
    } else {
      setUser(null);
      setRole(null);
    }
  } catch (error) {
    // Se der erro de permissão aqui, o catch segura e te define como membro
    console.log("Acesso administrativo via DB negado. Logando como membro.");
    setRole('membro');
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