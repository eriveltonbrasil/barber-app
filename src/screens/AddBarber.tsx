import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function AddBarber({ navigation, route }: any) {
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [foto, setFoto] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica edição
  const barberToEdit = route.params?.barberToEdit;
  const isEditing = !!barberToEdit;

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: 'Editar Profissional' });
      setNome(barberToEdit.nome);
      setEspecialidade(barberToEdit.especialidade);
      setFoto(barberToEdit.foto);
    }
  }, [barberToEdit]);

  async function handleSave() {
    if (nome === '' || especialidade === '') {
      Alert.alert("Erro", "Por favor, preencha o nome e a especialidade.");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        nome: nome,
        especialidade: especialidade,
        foto: foto || "https://cdn-icons-png.flaticon.com/512/1995/1995515.png",
      };

      if (isEditing) {
         // Atualiza
         const barberRef = doc(db, "barbeiros", barberToEdit.id);
         await updateDoc(barberRef, dataToSave);
         Alert.alert("Sucesso!", "Dados do barbeiro atualizados!");
      } else {
         // Cria novo (adicionando campos extras padrão)
         await addDoc(collection(db, "barbeiros"), {
            ...dataToSave,
            nota: 5.0,
            horarios: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
         });
         Alert.alert("Sucesso!", "Barbeiro cadastrado com sucesso.");
      }
      
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível salvar.");
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
        <Text className="text-white text-2xl font-bold">
            {isEditing ? 'Editar Profissional' : 'Novo Barbeiro'}
        </Text>
      </View>

      <Text className="text-zinc-400 mb-2">Nome do Profissional</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
        placeholder="Ex: Pedro Santos"
        placeholderTextColor="#71717a"
        value={nome}
        onChangeText={setNome}
      />

      <Text className="text-zinc-400 mb-2">Especialidade</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
        placeholder="Ex: Cortes Degradê e Barba"
        placeholderTextColor="#71717a"
        value={especialidade}
        onChangeText={setEspecialidade}
      />

      <Text className="text-zinc-400 mb-2">Link da Foto (URL)</Text>
      <TextInput 
        className="bg-zinc-800 text-white p-4 rounded-xl mb-6 border border-zinc-700"
        placeholder="Cole o link da imagem aqui (opcional)"
        placeholderTextColor="#71717a"
        value={foto}
        onChangeText={setFoto}
      />

      <TouchableOpacity 
        className="bg-orange-500 p-4 rounded-xl items-center"
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">
             {isEditing ? '💾 Atualizar Barbeiro' : '💾 Salvar Barbeiro'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}