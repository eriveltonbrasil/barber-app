import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function SignUp({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignUp() {
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Sucesso!", "Conta criada com sucesso.");
      // O App.tsx vai detectar o login automático e levar para a Home
    } catch (error: any) {
      console.log(error);
      let msg = "Não foi possível criar a conta.";
      if (error.code === 'auth/email-already-in-use') msg = "Este email já está em uso.";
      if (error.code === 'auth/invalid-email') msg = "Email inválido.";
      Alert.alert("Erro", msg);
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 justify-center px-8">
      
      <View className="items-center mb-10">
        <Text className="text-white text-3xl font-bold">Crie sua Conta</Text>
        <Text className="text-zinc-400 mt-2">É rápido e gratuito.</Text>
      </View>

      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
        placeholder="Seu melhor Email"
        placeholderTextColor="#71717a"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View className="flex-row items-center bg-zinc-800 rounded-xl mb-4 border border-zinc-700">
        <TextInput 
          className="flex-1 text-white p-4" 
          placeholder="Crie uma Senha"
          placeholderTextColor="#71717a"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-4">
            <Text className="text-zinc-400 text-lg">{showPassword ? "🙈" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-zinc-800 rounded-xl mb-8 border border-zinc-700">
        <TextInput 
          className="flex-1 text-white p-4" 
          placeholder="Confirme a Senha"
          placeholderTextColor="#71717a"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity 
        className="bg-orange-500 p-4 rounded-xl items-center mb-6"
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">CADASTRAR E ENTRAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text className="text-zinc-500 text-center">
            Já tem conta? <Text className="text-orange-500 font-bold">Faça Login</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}