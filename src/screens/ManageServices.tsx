import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

export default function ManageServices({ navigation }: any) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  async function fetchServices() {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "servicos"));
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(lista);
    } catch (error) {
      console.log("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isFocused) {
      fetchServices();
    }
  }, [isFocused]);

  function confirmDelete(id: string, nome: string) {
    Alert.alert(
      "Excluir Serviço",
      `Tem certeza que deseja remover "${nome}"?`,
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
      await deleteDoc(doc(db, "servicos", id));
      Alert.alert("Sucesso", "Serviço removido!");
      fetchServices();
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
        <Text className="text-white text-2xl font-bold">Gerenciar Serviços</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row items-center justify-between border border-zinc-700">
              <View>
                <Text className="text-white font-bold text-lg">{item.nome}</Text>
                <Text className="text-zinc-400 text-sm">R$ {item.preco?.toFixed(2)} • {item.duracao} min</Text>
              </View>

              <View className="flex-row">
                 {/* Botão de Editar (Vamos ativar jajá) */}
                <TouchableOpacity 
                   onPress={() => navigation.navigate('AddService', { serviceToEdit: item })}
                   className="bg-blue-500/20 p-3 rounded-lg border border-blue-500 mr-2"
                >
                  <Text className="text-blue-500 font-bold">✏️</Text>
                </TouchableOpacity>

                {/* Botão de Excluir */}
                <TouchableOpacity 
                  onPress={() => confirmDelete(item.id, item.nome)}
                  className="bg-red-500/20 p-3 rounded-lg border border-red-500"
                >
                  <Text className="text-red-500 font-bold">🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}