import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function MyAppointments({ navigation }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Busca os agendamentos APENAS do usuário logado
  async function fetchAppointments() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Query: "Busque na coleção 'agendamentos' ONDE 'clienteId' é igual ao meu ID"
      const q = query(collection(db, "agendamentos"), where("clienteId", "==", user.uid));
      
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(lista);
    } catch (error) {
      console.log("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 2. Função para Cancelar (O "D" do CRUD - Delete)
  async function handleCancel(id: string) {
    Alert.alert(
      "Cancelar",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, Cancelar", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "agendamentos", id));
              // Atualiza a lista na hora, removendo o item deletado visualmente
              setAppointments(prev => prev.filter(item => item.id !== id));
              Alert.alert("Cancelado", "Seu horário foi liberado.");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar.");
            }
          }
        }
      ]
    );
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-8">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">Meus Agendamentos 📅</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-zinc-800 p-2 rounded-full">
           <Text className="text-white font-bold">✖</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : appointments.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-zinc-500 text-lg mb-4">Nenhum agendamento encontrado.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-orange-500 p-3 rounded-lg">
             <Text className="text-white font-bold">Marcar um Horário</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-zinc-800 p-4 rounded-xl mb-4 border border-zinc-700 shadow-sm">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-orange-500 font-bold text-xl">{item.servicoNome}</Text>
                  <Text className="text-zinc-300 text-md">Barbeiro: {item.barbeiroNome}</Text>
                </View>
                <Text className="text-white font-bold text-lg">R$ {item.servicoPreco}</Text>
              </View>
              
              <View className="bg-zinc-900/50 p-2 rounded mb-3 self-start">
                 {/* Formata a data para DD/MM/YYYY */}
                <Text className="text-zinc-400 font-bold">
                  📅 {item.data.split('-').reverse().join('/')} às {item.horario}
                </Text>
              </View>

              {/* Botão de Cancelar */}
              <TouchableOpacity 
                onPress={() => handleCancel(item.id)}
                className="bg-red-500/10 p-3 rounded-lg items-center border border-red-500/30 active:bg-red-500/20"
              >
                <Text className="text-red-400 font-bold">Cancelar Agendamento 🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}