import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';


export default function LoginScreen() {
  const { signIn }     = useAuth();
  const navigation     = useNavigation();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha email e senha.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    const result = await signIn(email.trim(), password);
    console.log('resultado login:', JSON.stringify(result)); // ← adiciona aqui
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(translateFirebaseError(result.message));
    }
    // Se sucesso: AuthContext atualiza user → RootNavigator redireciona sozinho
  }

  function handleContinuarSemConta() {
    // Volta para o VisitorDrawer sem fazer login
    navigation.navigate('VisitorApp');
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        {/* Separador */}
        <View style={styles.separador}>
          <View style={styles.linha} />
          <Text style={styles.separadorTexto}>ou</Text>
          <View style={styles.linha} />
        </View>

        <TouchableOpacity
          style={styles.buttonSecundario}
          onPress={handleContinuarSemConta}
        >
          <Text style={styles.buttonSecundarioTexto}>Continuar sem conta</Text>
        </TouchableOpacity>

        {/* Botão criar conta */}
        <TouchableOpacity
          style={styles.buttonCriarConta}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.buttonCriarContaTexto}>Criar conta</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

function translateFirebaseError(message) {
  if (message.includes('user-not-found') || message.includes('invalid-credential'))
    return 'Email ou senha incorretos.';
  if (message.includes('wrong-password'))   return 'Senha incorreta.';
  if (message.includes('invalid-email'))    return 'Email inválido.';
  if (message.includes('too-many-requests')) return 'Muitas tentativas. Tente mais tarde.';
  if (message.includes('network-request-failed')) return 'Sem conexão com a internet.';
  return 'Erro ao fazer login. Tente novamente.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
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
  errorText: {
    color: '#c0392b',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  separadorTexto: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 13,
  },
  buttonSecundario: {
    borderWidth: 1,
    borderColor: '#1a1a2e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonSecundarioTexto: {
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: '500',
  },
buttonCriarConta: {
  paddingVertical: 14,
  alignItems: 'center',
  marginTop: 8,
},
buttonCriarContaTexto: {
  color: '#C9A84C',
  fontSize: 15,
  fontWeight: '600',
},

});