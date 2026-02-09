import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function BarberProfile({ route, navigation }: any) {
  // Aqui pegamos os dados do barbeiro que veio da tela anterior
  const { barber } = route.params; 
  
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os serviços no Banco de Dados
  useEffect(() => {
    async function fetchServices() {
      try {
        const querySnapshot = await getDocs(collection(db, "servicos"));
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(lista);
      } catch (error) {
        console.log("Erro ao buscar serviços:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <View className="flex-1 bg-zinc-900">
      {/* Cabeçalho com Foto do Barbeiro */}
      <View className="items-center pt-8 pb-6 bg-zinc-800 rounded-b-3xl shadow-lg">
        <Image source={{ uri: barber.foto }} className="w-32 h-32 rounded-full border-2 border-orange-500 mb-4" />
        <Text className="text-white text-2xl font-bold">{barber.nome}</Text>
        <Text className="text-zinc-400 text-lg">{barber.especialidade}</Text>
        <Text className="text-orange-400 font-bold mt-2">⭐ {barber.nota} • 120 Avaliações</Text>
      </View>

      <Text className="text-white text-xl font-bold px-6 mt-8 mb-4">Escolha o Serviço</Text>

      {/* Lista de Serviços */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" className="mt-10" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          className="px-6"
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-zinc-700">
              <View>
                <Text className="text-white text-lg font-bold">{item.nome}</Text>
                <Text className="text-zinc-400 text-sm">🕒 {item.duracao}</Text>
              </View>
              <Text className="text-orange-500 text-lg font-bold">R$ {item.preco},00</Text>
            </TouchableOpacity>
          )}
        />
      )}
      
      {/* Botão de Voltar Provisório */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full">
        <Text className="text-white font-bold">⬅ Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}