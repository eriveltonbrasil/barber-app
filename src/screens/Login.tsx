// src/screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importa nossa conexão

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Alterna entre Login e Cadastro

  async function handleAccess() {
    if (email === '' || password === '') {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // Criar conta
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Sucesso", "Conta criada! Bem-vindo.");
      } else {
        // Fazer login
        await signInWithEmailAndPassword(auth, email, password);
        // O App.tsx vai perceber o login e mudar de tela automaticamente
      }
    } catch (error: any) {
      console.log(error);
      let msg = "Ocorreu um erro.";
      if (error.code === 'auth/invalid-email') msg = "Email inválido.";
      if (error.code === 'auth/weak-password') msg = "A senha deve ter 6+ caracteres.";
      if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
      if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
      if (error.code === 'auth/email-already-in-use') msg = "Este email já está cadastrado.";
      
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 justify-center px-6">
      <Text className="text-white text-4xl font-bold text-center mb-2">
        Elite<Text className="text-orange-500">Barber</Text>
      </Text>
      <Text className="text-zinc-400 text-center mb-10 text-lg">
        Seu estilo, no seu tempo.
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#71717a"
        value={email}
        onChangeText={setEmail}
        className="bg-zinc-800 text-white p-4 rounded-lg mb-4 text-lg border border-zinc-700"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#71717a"
        value={password}
        onChangeText={setPassword}
        className="bg-zinc-800 text-white p-4 rounded-lg mb-8 text-lg border border-zinc-700"
        secureTextEntry
      />

      <TouchableOpacity 
        onPress={handleAccess}
        className="bg-orange-500 p-4 rounded-lg items-center"
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white font-bold text-lg">
            {isRegistering ? "CRIAR CONTA" : "ENTRAR"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setIsRegistering(!isRegistering)}
        className="mt-6 p-2"
      >
        <Text className="text-zinc-400 text-center">
          {isRegistering ? "Já tem conta? Faça Login" : "Não tem conta? Cadastre-se"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}