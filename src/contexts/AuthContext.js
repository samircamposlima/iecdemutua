import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

// Contexto centralizado para prover dados de autenticação para toda a aplicação
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    /**
     * Listener em tempo real do estado de autenticação do Firebase.
     * Gerencia a sessão do usuário e busca permissões (roles) no Firestore.
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. Fluxo de Logout: limpa estados e encerra o carregamento
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // 2. Fluxo de Login/Sessão Ativa: define usuário e busca permissões de acesso
      try {
        setUser(firebaseUser);

        // Verificação de UID de emergência/super-admin via configuração remota
        const emergencySnap = await getDoc(doc(db, 'config', 'emergency'));
        const emergencyUid = emergencySnap.exists ? emergencySnap.data().uid : null;

        if (firebaseUser.uid === emergencyUid) {
          setRole('admin');
        } else {
          // Busca o perfil do usuário no Firestore para determinar o nível de acesso (RBAC)
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userRole = userSnap.exists ? userSnap.data().role : 'pendente';
          setRole(userRole);
        }
      } catch (error) {
        // Fallback de segurança para garantir que o app não fique travado em caso de erro de rede
        setRole('visitante');
      } finally {
        // O estado de loading só é finalizado após a resolução completa de identidade e permissões
        setLoading(false);
      }
    });

    return unsubscribe; // Cleanup: remove o listener ao desmontar o Provider
  }, []);

  /**
   * Autentica o usuário com email e senha.
   * Centraliza o tratamento de erros para simplificar a lógica na UI.
   */
  async function signIn(email, password) {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Encerra a sessão atual no Firebase Auth.
   */
  async function signOut() {
    try {
      await firebaseSignOut(getAuth());
    } catch (error) {
      console.error('[Auth] Erro ao deslogar:', error);
    }
  }

  // Helper para facilitar a verificação de estado de convidado em telas públicas
  const isVisitor = !user;

  return (
    <AuthContext.Provider value={{ user, role, loading, isVisitor, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o acesso ao contexto em componentes funcionais
export function useAuth() {
  return useContext(AuthContext);
}