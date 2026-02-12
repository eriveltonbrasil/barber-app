import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

export default function ManageBarbers({ navigation }: any) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Para atualizar a lista quando voltar para esta tela

  async function fetchBarbers() {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "barbeiros"));
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBarbers(lista);
    } catch (error) {
      console.log("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  }

  // Atualiza a lista toda vez que a tela recebe foco
  useEffect(() => {
    if (isFocused) {
      fetchBarbers();
    }
  }, [isFocused]);

  function confirmDelete(id: string, nome: string) {
    Alert.alert(
      "Excluir Barbeiro",
      `Tem certeza que deseja remover ${nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Excluir", 
          style: "destructive", 
          onPress: () => handleDelete(id) 
        }
      ]
    );
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "barbeiros", id));
      Alert.alert("Sucesso", "Barbeiro removido!");
      fetchBarbers(); // Recarrega a lista
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir.");
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Gerenciar Equipe</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row items-center justify-between border border-zinc-700">
              <View className="flex-row items-center">
                <Image 
                  source={{ uri: item.foto }} 
                  className="w-12 h-12 rounded-full mr-3 bg-zinc-700" 
                />
                <View>
                  <Text className="text-white font-bold text-lg">{item.nome}</Text>
                  <Text className="text-zinc-400 text-sm">{item.especialidade}</Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => confirmDelete(item.id, item.nome)}
                className="bg-red-500/20 p-3 rounded-lg border border-red-500"
              >
                <Text className="text-red-500 font-bold">🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}