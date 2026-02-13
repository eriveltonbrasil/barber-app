import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Import SaaS

export default function Booking({ route, navigation }: any) {
  // Recebe os dados da tela anterior
  const { barber, service } = route.params;
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gera os próximos 7 dias para agendar
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Formato: "Seg 12/02"
      const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      const diaMes = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      
      dates.push({
        fullDate: date.toISOString().split('T')[0], // 2023-02-12
        display: `${diaSemana} ${diaMes}/${mes}`
      });
    }
    return dates;
  };

  const dates = generateDates();

  async function handleConfirmBooking() {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Atenção", "Selecione um dia e um horário!");
      return;
    }

    setLoading(true);

    try {
      // 1. SaaS: Pega o ID da loja na memória
      const shopId = await AsyncStorage.getItem('@delp_shopId');
      const shopName = await AsyncStorage.getItem('@delp_shopName');

      if (!shopId) {
        Alert.alert("Erro", "Loja não identificada. Faça login novamente.");
        setLoading(false);
        return;
      }

      // 2. Cria o objeto do agendamento COM O shopId
      await addDoc(collection(db, "agendamentos"), {
        clienteId: auth.currentUser?.uid,
        clienteEmail: auth.currentUser?.email,
        barbeiroId: barber.id,
        barbeiroNome: barber.nome,
        barbeiroFoto: barber.foto,
        servicoId: service.id,
        servicoNome: service.nome,
        preco: service.preco,
        duracao: service.duracao,
        data: selectedDate,
        horario: selectedTime,
        status: 'agendado',
        shopId: shopId,      // <--- O SEGREDO DO SAAS
        shopName: shopName,  // Opcional: Ajuda a mostrar onde foi
        createdAt: new Date().toISOString()
      });

      Alert.alert("Agendamento Confirmado!", "Te esperamos lá!", [
        { text: "OK", onPress: () => navigation.navigate('Home') }
      ]);

    } catch (error) {
      console.log("Erro ao agendar:", error);
      Alert.alert("Erro", "Não foi possível realizar o agendamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Agendar Horário</Text>
      </View>

      <View className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700">
        <Text className="text-zinc-400">Serviço Escolhido:</Text>
        <Text className="text-white text-xl font-bold">{service.nome}</Text>
        <Text className="text-orange-500 font-bold">R$ {service.preco.toFixed(2)} • {service.duracao} min</Text>
        <Text className="text-zinc-500 mt-2">Profissional: {barber.nome}</Text>
      </View>

      <Text className="text-white text-lg font-bold mb-3">Escolha o Dia</Text>
      <View className="h-20 mb-6">
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={(item) => item.fullDate}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedDate(item.fullDate)}
              className={`p-4 rounded-xl mr-3 justify-center items-center border ${
                selectedDate === item.fullDate 
                ? 'bg-orange-500 border-orange-500' 
                : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <Text className={`font-bold ${selectedDate === item.fullDate ? 'text-white' : 'text-zinc-400'}`}>
                {item.display}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Text className="text-white text-lg font-bold mb-3">Escolha o Horário</Text>
      <View className="h-16 mb-8">
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={barber.horarios} // Pega os horários do cadastro do barbeiro
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setSelectedTime(item)}
              className={`px-6 py-3 rounded-xl mr-3 justify-center items-center border ${
                selectedTime === item 
                ? 'bg-orange-500 border-orange-500' 
                : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <Text className={`font-bold ${selectedTime === item ? 'text-white' : 'text-zinc-400'}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <TouchableOpacity 
        className={`p-4 rounded-xl items-center ${(!selectedDate || !selectedTime) ? 'bg-zinc-700' : 'bg-orange-500'}`}
        onPress={handleConfirmBooking}
        disabled={loading || !selectedDate || !selectedTime}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">Confirmar Agendamento ✅</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}