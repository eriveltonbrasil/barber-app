import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AccessScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verifica se já tem uma barbearia salva na memória
  useEffect(() => {
    async function checkSavedAccess() {
      const savedShopId = await AsyncStorage.getItem('@delp_shopId');
      if (savedShopId) {
        // Se já tiver salvo, pula direto para o Login
        navigation.replace('Login');
      }
      setChecking(false);
    }
    checkSavedAccess();
  }, []);

  async function handleAccess() {
    if (code === '') return;

    setLoading(true);
    try {
      // Busca no Firebase se existe uma barbearia com esse código (ex: "ELITE")
      const q = query(collection(db, "barbearias"), where("codigo", "==", code.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Erro", "Barbearia não encontrada! Verifique o código.");
        setLoading(false);
      } else {
        // ACHOU! Pega o ID da barbearia (aquele código 2VbZ...)
        const shopData = querySnapshot.docs[0];
        const shopId = shopData.id;
        const shopName = shopData.data().nome;

        // Salva na memória do celular
        await AsyncStorage.setItem('@delp_shopId', shopId);
        await AsyncStorage.setItem('@delp_shopName', shopName);

        Alert.alert("Bem-vindo!", `Acessando ${shopName}...`);
        navigation.replace('Login');
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao verificar código.");
      setLoading(false);
    }
  }

  if (checking) return <View className="flex-1 bg-zinc-900 justify-center items-center"><ActivityIndicator color="#f97316" /></View>;

  return (
    <View className="flex-1 bg-zinc-900 justify-center px-8">
      <View className="items-center mb-10">
        <Text className="text-white text-4xl font-bold mb-2">Delp System</Text>
        <Text className="text-zinc-400 text-center">Digite o código da barbearia para acessar</Text>
      </View>

      <Text className="text-white mb-2 ml-1 font-bold">Código da Barbearia</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-6 border border-zinc-700 text-center text-xl tracking-widest uppercase"
        placeholder="EX: ELITE"
        placeholderTextColor="#52525b"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
      />

      <TouchableOpacity 
        className="bg-orange-500 p-4 rounded-xl items-center"
        onPress={handleAccess}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Entrar na Barbearia</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity className="mt-8 items-center">
        <Text className="text-zinc-500 text-sm">É dono de barbearia?</Text>
        <Text className="text-orange-500 font-bold">Crie seu sistema aqui</Text>
      </TouchableOpacity>
    </View>
  );
}