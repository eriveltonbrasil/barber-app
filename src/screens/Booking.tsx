import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { auth, db } from '../config/firebase'; // <--- Importante
import { collection, addDoc } from 'firebase/firestore'; // <--- Importante

export default function Booking({ route, navigation }: any) {
  const { barber, service } = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // <--- Para travar o botão enquanto salva

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  useEffect(() => {
    const nextDays = [];
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const dayIndex = date.getDay();
      const weekDay = weekDays[dayIndex];
      const dayNumber = date.getDate();
      const fullDate = date.toISOString().split('T')[0];

      nextDays.push({ weekDay, dayNumber, fullDate });
    }
    setDays(nextDays);
  }, []);

  // --- FUNÇÃO QUE SALVA NO FIREBASE ---
  async function handleFinishBooking() {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Atenção", "Escolha um dia e um horário!");
      return;
    }

    // Verifica se o usuário está logado
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      return;
    }

    setLoading(true);

    try {
      // Cria o documento na coleção "agendamentos"
      await addDoc(collection(db, "agendamentos"), {
        clienteId: user.uid,
        clienteEmail: user.email,
        barbeiroNome: barber.nome,
        barbeiroId: barber.id,
        servicoNome: service.nome,
        servicoPreco: service.preco,
        data: selectedDate,
        horario: selectedTime,
        status: "agendado", // Pode ser: agendado, cancelado, concluido
        criadoEm: new Date()
      });

      Alert.alert("Sucesso! 🎉", "Seu horário foi agendado.", [
        { text: "OK", onPress: () => navigation.navigate("Home") }
      ]);

    } catch (error) {
      console.log("Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível agendar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-8">
      <Text className="text-zinc-400 text-lg mb-2">Resumo do Pedido</Text>
      <View className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700">
        <Text className="text-white text-xl font-bold">{service.nome}</Text>
        <Text className="text-zinc-400">Com: {barber.nome}</Text>
        <Text className="text-orange-500 font-bold mt-1">R$ {service.preco},00</Text>
      </View>

      <Text className="text-white text-xl font-bold mb-4">Escolha a Data</Text>
      
      <View className="h-24">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={days}
          keyExtractor={(item) => item.fullDate}
          renderItem={({ item }) => {
            const isSelected = selectedDate === item.fullDate;
            return (
              <TouchableOpacity 
                onPress={() => setSelectedDate(item.fullDate)}
                className={`w-16 h-20 justify-center items-center rounded-2xl mr-3 border ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}
              >
                <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{item.weekDay}</Text>
                <Text className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>{item.dayNumber}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text className="text-white text-xl font-bold mt-6 mb-4">Escolha o Horário</Text>
      
      <View className="flex-row flex-wrap justify-between">
        {times.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <TouchableOpacity 
              key={time}
              onPress={() => setSelectedTime(time)}
              className={`w-[30%] py-3 rounded-lg mb-3 items-center border ${isSelected ? 'bg-zinc-700 border-orange-500' : 'bg-zinc-800 border-zinc-700'}`}
            >
              <Text className={`font-bold ${isSelected ? 'text-orange-500' : 'text-white'}`}>{time}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity 
        onPress={handleFinishBooking}
        disabled={loading || !selectedDate || !selectedTime}
        className={`mt-auto mb-6 p-4 rounded-xl items-center ${selectedDate && selectedTime ? 'bg-orange-500' : 'bg-zinc-700 opacity-50'}`}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white font-bold text-lg">Confirmar Agendamento ✅</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}