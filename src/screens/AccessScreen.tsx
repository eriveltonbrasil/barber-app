import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const MASTER_CODE = "DELPMASTER"; 

export default function AccessScreen({ navigation }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Função auxiliar para exibir alertas em Web e Mobile
  function showAlert(title: string, message: string) {
      if (Platform.OS === 'web') {
          alert(`${title}\n\n${message}`);
      } else {
          Alert.alert(title, message);
      }
  }

  async function handleAccess() {
    if (code.trim() === '') {
      showAlert("Atenção", "Digite o código da barbearia.");
      return;
    }

    if (code.toUpperCase() === MASTER_CODE) {
        navigation.navigate('SuperAdmin');
        return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "barbearias"), 
        where("codigo", "==", code.toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showAlert("Erro", "Código não encontrado.");
        setLoading(false);
        return;
      }

      const shopDoc = querySnapshot.docs[0];
      const shopData = shopDoc.data();

      if (shopData.ativo === false) {
          showAlert("Acesso Suspenso 🚫", "Barbearia indisponível.");
          setLoading(false);
          return;
      }

      // SALVAMOS O EMAIL DO DONO NA MEMÓRIA
      await AsyncStorage.setItem('@delp_shopId', shopDoc.id);
      await AsyncStorage.setItem('@delp_shopName', shopData.nome);
      
      // Se tiver emailDono, salva. Se for antigo e não tiver, salva string vazia.
      await AsyncStorage.setItem('@delp_ownerEmail', shopData.emailDono || "");

      navigation.replace('Login');

    } catch (error) {
      console.log(error);
      showAlert("Erro", "Falha ao verificar código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 justify-center items-center px-8">
      <View className="items-center mb-10">
        <Text className="text-orange-500 font-bold text-5xl mb-2">DELP</Text>
        <Text className="text-white text-xl tracking-widest">SYSTEM</Text>
      </View>

      <Text className="text-zinc-400 mb-4 text-center">
        Digite o código da sua barbearia para acessar
      </Text>

      <TextInput 
        className="bg-zinc-800 text-white w-full p-4 rounded-xl text-center text-2xl font-bold tracking-widest border border-zinc-700 mb-6"
        placeholder="CÓDIGO"
        placeholderTextColor="#52525b"
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
      />

      <TouchableOpacity 
        className="bg-orange-500 w-full p-4 rounded-xl items-center"
        onPress={handleAccess}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">ACESSAR 🚀</Text>
        )}
      </TouchableOpacity>
      
      <Text className="text-zinc-600 mt-8 text-xs">v1.0.6 EriBrasil</Text>
    </View>
  );
}