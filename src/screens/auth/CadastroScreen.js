import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CadastroScreen() {
  const navigation = useNavigation();

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [anivCasamento, setAnivCasamento] = useState('');
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [secureMode, setSecureMode] = useState(true);

  async function handleCadastro() {
    if (!nome.trim()) return setErrorMessage('Informe seu nome completo.');
    if (!email.trim()) return setErrorMessage('Informe seu email.');
    if (senha.length < 6) return setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
    if (senha !== confirmarSenha) return setErrorMessage('As senhas não coincidem.');
    if (!telefone.trim()) return setErrorMessage('Informe seu telefone.');
    if (!nascimento.trim()) return setErrorMessage('Informe sua data de nascimento.');
    if (!isValidDate(nascimento)) return setErrorMessage('Data de nascimento inválida.');
    
    if (anivCasamento.trim() && !isValidDate(anivCasamento)) {
      return setErrorMessage('Data de aniversário de casamento inválida.');
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const auth = getAuth();
      const db = getFirestore();

      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await updateProfile(user, { displayName: nome.trim() });

      await setDoc(doc(db, 'users', user.uid), {
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        phone: telefone.trim(),
        birthDate: parseDateToTimestamp(nascimento),
        weddingAnniversary: anivCasamento.trim() ? parseDateToTimestamp(anivCasamento) : null,
        role: 'pendente', 
        createdAt: serverTimestamp(),
        createdBy: 'self',
      });
    } catch (error) {
      setErrorMessage(translateFirebaseError(error.message));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>IEC de Mutua</Text>

          <Text style={styles.label}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha *</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.inputInside}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={secureMode}
            />
            <TouchableOpacity onPress={() => setSecureMode(!secureMode)} style={styles.eyeBtn}>
              <MaterialIcons name={secureMode ? "visibility-off" : "visibility"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={secureMode}
          />

          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="(00) 00000-0000"
            value={telefone}
            onChangeText={(t) => setTelefone(formatPhone(t))}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Data de nascimento *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={nascimento}
            onChangeText={(t) => setNascimento(formatDate(t))}
            keyboardType="numeric"
            maxLength={10}
          />

          <Text style={styles.label}>
            Aniversário de casamento <Text style={styles.labelOpcional}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            value={anivCasamento}
            onChangeText={(t) => setAnivCasamento(formatDate(t))}
            keyboardType="numeric"
            maxLength={10}
          />

          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>
              ℹ️ Após criar sua conta, um administrador precisará aprovar seu acesso.
            </Text>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.buttonText}>Criar conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.voltarButton} onPress={() => navigation.goBack()}>
            <Text style={styles.voltarTexto}>← Voltar para o login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helpers
function formatPhone(value) {
  const nums = value.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
}

function formatDate(value) {
  const nums = value.replace(/\D/g, '').slice(0, 8);
  if (nums.length <= 2) return nums;
  if (nums.length <= 4) return `${nums.slice(0,2)}/${nums.slice(2)}`;
  return `${nums.slice(0,2)}/${nums.slice(2,4)}/${nums.slice(4)}`;
}

function isValidDate(str) {
  if (str.length !== 10) return false;
  const [d, m, y] = str.split('/').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function parseDateToTimestamp(str) {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function translateFirebaseError(message) {
  const msg = message.toLowerCase();
  if (msg.includes('email-already-in-use')) return 'Este email já está cadastrado.';
  if (msg.includes('weak-password')) return 'Senha muito fraca.';
  return 'Erro ao criar conta. Verifique os dados.';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContent: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: 'center', // Isso garante que o card volte ao centro
    paddingBottom: 40 
  },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, elevation: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4 },
  labelOpcional: { fontWeight: '400', color: '#999' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontSize: 15, 
    color: '#1A1A1A', 
    marginBottom: 14, 
    backgroundColor: '#fafafa' 
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 14,
    height: 50
  },
  inputInside: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: '#1A1A1A' },
  eyeBtn: { paddingHorizontal: 12 },
  avisoContainer: { backgroundColor: '#FFF9E6', borderRadius: 8, padding: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#C9A84C' },
  avisoTexto: { fontSize: 13, color: '#7A6000', lineHeight: 18 },
  errorText: { color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#C9A84C', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#1A1A1A', fontSize: 16, fontWeight: '700' },
  voltarButton: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  voltarTexto: { color: '#666', fontSize: 14 },
});