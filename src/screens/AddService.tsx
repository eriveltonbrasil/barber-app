import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddService({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (nome === '' || preco === '' || duracao === '') {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // Salva na coleção "servicos"
      await addDoc(collection(db, "servicos"), {
        nome: nome,
        preco: parseFloat(preco.replace(',', '.')), // Garante que salva como número (ex: 35.00)
        duracao: parseInt(duracao), // Salva como número inteiro (ex: 30)
      });

      Alert.alert("Sucesso!", "Serviço cadastrado!");
      navigation.goBack(); 
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar o serviço.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Novo Serviço</Text>
      </View>

      <Text className="text-zinc-400 mb-2">Nome do Serviço</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
        placeholder="Ex: Corte Degradê"
        placeholderTextColor="#71717a"
        value={nome}
        onChangeText={setNome}
      />

      <Text className="text-zinc-400 mb-2">Preço (R$)</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
        placeholder="Ex: 35.00"
        placeholderTextColor="#71717a"
        keyboardType="numeric"
        value={preco}
        onChangeText={setPreco}
      />

      <Text className="text-zinc-400 mb-2">Duração (minutos)</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-6 border border-zinc-700"
        placeholder="Ex: 30"
        placeholderTextColor="#71717a"
        keyboardType="numeric"
        value={duracao}
        onChangeText={setDuracao}
      />

      <TouchableOpacity 
        className="bg-orange-500 p-4 rounded-xl items-center"
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">💾 Salvar Serviço</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}