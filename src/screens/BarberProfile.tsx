import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function BarberProfile({ route, navigation }: any) {
  const { barber } = route.params; 
  
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para guardar qual serviço o usuário clicou
  const [selectedService, setSelectedService] = useState<any>(null);

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

  function handleBooking() {
    if (!selectedService) {
      Alert.alert("Ops!", "Selecione um serviço para continuar.");
      return;
    }
    // Por enquanto, apenas avisa. Na próxima etapa vamos abrir o calendário!
    Alert.alert("Sucesso", `Você escolheu: ${selectedService.nome}. Vamos para o calendário!`);
  }

  return (
    <View className="flex-1 bg-zinc-900">
      <View className="items-center pt-8 pb-6 bg-zinc-800 rounded-b-3xl shadow-lg">
        <Image source={{ uri: barber.foto }} className="w-32 h-32 rounded-full border-2 border-orange-500 mb-4" />
        <Text className="text-white text-2xl font-bold">{barber.nome}</Text>
        <Text className="text-zinc-400 text-lg">{barber.especialidade}</Text>
        <Text className="text-orange-400 font-bold mt-2">⭐ {barber.nota} • 120 Avaliações</Text>
      </View>

      <Text className="text-white text-xl font-bold px-6 mt-8 mb-4">Escolha o Serviço</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" className="mt-10" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          className="px-6"
          renderItem={({ item }) => {
            // Verifica se este item é o selecionado
            const isSelected = selectedService?.id === item.id;
            
            return (
              <TouchableOpacity 
                onPress={() => setSelectedService(item)} // Ao clicar, marca como selecionado
                className={`p-4 rounded-xl mb-3 flex-row justify-between items-center border 
                  ${isSelected ? 'bg-zinc-700 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}
              >
                <View>
                  <Text className={`text-lg font-bold ${isSelected ? 'text-orange-500' : 'text-white'}`}>
                    {item.nome}
                  </Text>
                  <Text className="text-zinc-400 text-sm">🕒 {item.duracao}</Text>
                </View>
                <Text className="text-orange-500 text-lg font-bold">R$ {item.preco},00</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
      
      {/* Botão Flutuante de Continuar (Só aparece se tiver algo selecionado) */}
      {selectedService && (
        <View className="p-6 absolute bottom-0 w-full bg-zinc-900/90">
          <TouchableOpacity 
            onPress={handleBooking}
            className="bg-orange-500 p-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-lg">Escolher Horário ➝</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botão Voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-4 left-4 bg-black/50 p-2 rounded-full">
        <Text className="text-white font-bold">⬅ Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}