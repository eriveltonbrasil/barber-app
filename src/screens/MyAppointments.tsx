import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function MyAppointments({ navigation }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const shopId = await AsyncStorage.getItem('@delp_shopId'); 

      if (!user || !shopId) {
          setLoading(false);
          return;
      }

      const q = query(
        collection(db, "agendamentos"),
        where("clienteId", "==", user.uid),
        where("shopId", "==", shopId) 
      );

      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // --- ORDENAÇÃO (DATA + HORA) ---
      // Como data é "YYYY-MM-DD" e hora é "HH:MM", a comparação de string funciona perfeitamente
      list.sort((a: any, b: any) => {
        // Primeiro compara a Data
        if (a.data !== b.data) {
            return a.data.localeCompare(b.data);
        }
        // Se a data for igual, compara a Hora
        return a.horario.localeCompare(b.horario);
      });

      setAppointments(list);
    } catch (error) {
      console.log("Erro ao buscar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancel(id: string) {
    Alert.alert(
      "Cancelar",
      "Deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, Cancelar", 
          style: "destructive", 
          onPress: async () => {
            await deleteDoc(doc(db, "agendamentos", id));
            fetchAppointments(); 
          }
        }
      ]
    );
  }

  const formatDate = (dateString: string) => {
    if(!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Meus Agendamentos</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-zinc-800 p-4 rounded-xl mb-4 border border-zinc-700">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-orange-500 font-bold text-lg">{item.servicoNome}</Text>
                  <Text className="text-zinc-400">Barbeiro: {item.barbeiroNome}</Text>
                </View>
                <Text className="text-white font-bold text-xl">
                  R$ {item.preco ? Number(item.preco).toFixed(2).replace('.', ',') : '0,00'}
                </Text>
              </View>

              <View className="flex-row items-center mb-4 bg-zinc-900/50 p-2 rounded-lg self-start">
                <Text className="text-white font-bold mr-2">📅 {formatDate(item.data)}</Text>
                <Text className="text-white font-bold">⏰ {item.horario}</Text>
              </View>

              <TouchableOpacity 
                onPress={() => handleCancel(item.id)}
                className="bg-red-500/10 border border-red-500 p-3 rounded-lg items-center"
              >
                <Text className="text-red-500 font-bold">Cancelar Agendamento 🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text className="text-zinc-500 text-center mt-10">Você não tem agendamentos nesta barbearia.</Text>
          )}
        />
      )}
    </View>
  );
}