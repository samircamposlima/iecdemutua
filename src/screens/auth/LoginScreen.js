import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, 
  Platform, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * LoginScreen: Componente de autenticação.
 * Utiliza ScrollView interno para garantir que o layout recupere a posição
 * original após o fechamento do teclado no Android.
 */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Controle do "Password Visibility Toggle"
  const [secureMode, setSecureMode] = useState(true);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha email e senha.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      if (!result.success) {
        setErrorMessage(translateFirebaseError(result.message));
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Verifique sua rede.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // No Android, o comportamento 'undefined' permite que o sistema gerencie o ajuste nativamente
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>IEC de Mutua</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureMode}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setSecureMode(!secureMode)}
              activeOpacity={0.6}
            >
              <MaterialIcons 
                name={secureMode ? "visibility-off" : "visibility"} 
                size={22} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separador}>
            <View style={styles.linha} />
            <Text style={styles.separadorTexto}>ou</Text>
            <View style={styles.linha} />
          </View>

          <TouchableOpacity 
            style={styles.buttonSecundario} 
            onPress={() => navigation.navigate('VisitorApp')}
          >
            <Text style={styles.buttonSecundarioTexto}>Continuar sem conta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonCriarConta} 
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.buttonCriarContaTexto}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function translateFirebaseError(message) {
  const msg = message.toLowerCase();
  if (msg.includes('user-not-found') || msg.includes('invalid-credential')) 
    return 'Email ou senha incorretos.';
  if (msg.includes('wrong-password'))   return 'Senha incorreta.';
  if (msg.includes('invalid-email'))    return 'Email inválido.';
  if (msg.includes('too-many-requests')) return 'Muitas tentativas. Tente mais tarde.';
  if (msg.includes('network-request-failed')) return 'Sem conexão com a internet.';
  return 'Erro ao fazer login. Tente novamente.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Garante a centralização vertical quando o teclado está fechado
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    height: 52, 
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1a1a2e',
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: { color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  separador: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  linha: { flex: 1, height: 1, backgroundColor: '#eee' },
  separadorTexto: { marginHorizontal: 10, color: '#999', fontSize: 13 },
  buttonSecundario: { borderWidth: 1, borderColor: '#1a1a2e', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonSecundarioTexto: { color: '#1a1a2e', fontSize: 15, fontWeight: '500' },
  buttonCriarConta: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonCriarContaTexto: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
});