import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, Linking } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Importamos query/where/getDocs
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function Booking({ route, navigation }: any) {
  const { barber, service } = route.params;
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Lista de horários ocupados
  const [busyTimes, setBusyTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const paymentOptions = [
    { id: 'dinheiro', label: '💵 Dinheiro' },
    { id: 'pix', label: '💠 Pix' },
    { id: 'cartao', label: '💳 Cartão' },
  ];

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      const diaMes = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      dates.push({
        fullDate: date.toISOString().split('T')[0], 
        display: `${diaSemana} ${diaMes}/${mes}`
      });
    }
    return dates;
  };
  const dates = generateDates();

  // --- NOVA FUNÇÃO: Busca horários ocupados ---
  useEffect(() => {
    if (selectedDate) {
        checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  async function checkAvailability(date: string) {
    setLoadingTimes(true);
    setBusyTimes([]); // Limpa enquanto carrega
    setSelectedTime(null); // Reseta horário selecionado

    try {
        // Busca agendamentos DESSE barbeiro NESTA data
        const q = query(
            collection(db, "agendamentos"),
            where("barbeiroId", "==", barber.id),
            where("data", "==", date),
            where("status", "==", "agendado") // Só conta os confirmados
        );

        const querySnapshot = await getDocs(q);
        const times = querySnapshot.docs.map(doc => doc.data().horario);
        setBusyTimes(times);
    } catch (error) {
        console.log("Erro ao verificar disponibilidade", error);
    } finally {
        setLoadingTimes(false);
    }
  }

  const openWhatsApp = (date: string, time: string, method: string) => {
    const [ano, mes, dia] = date.split('-');
    const dataFormatada = `${dia}/${mes}`;
    const message = `Olá *${barber.nome}*! 👋\nAcabei de agendar pelo App:\n\n✂️ *${service.nome}*\n📅 ${dataFormatada} às ${time}\n💰 R$ ${service.preco.toFixed(2)}\n💳 Pagamento: *${method.toUpperCase()}*`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  async function handleConfirmBooking() {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Atenção", "Selecione um dia e um horário!");
      return;
    }
    if (!paymentMethod) {
      Alert.alert("Atenção", "Selecione a forma de pagamento!");
      return;
    }

    setLoading(true);

    try {
      const shopId = await AsyncStorage.getItem('@delp_shopId');
      const shopName = await AsyncStorage.getItem('@delp_shopName');

      if (!shopId) {
        Alert.alert("Erro", "Loja não identificada. Faça login novamente.");
        setLoading(false);
        return;
      }

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
        metodoPagamento: paymentMethod,
        status: 'agendado',
        shopId: shopId,
        shopName: shopName,
        createdAt: new Date().toISOString()
      });

      Alert.alert(
        "Agendamento Confirmado! ✅", 
        "Deseja enviar o comprovante para o barbeiro no WhatsApp?", 
        [
          { text: "Não, obrigado", onPress: () => navigation.navigate('Home') },
          { text: "Sim, Enviar no Zap 💬", onPress: () => {
              openWhatsApp(selectedDate, selectedTime, paymentMethod);
              navigation.navigate('Home');
            }
          }
        ]
      );
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
      <View className="h-16 mb-6">
        {loadingTimes ? (
            <ActivityIndicator color="#f97316" size="small" />
        ) : (
            <FlatList 
            horizontal
            showsHorizontalScrollIndicator={false}
            data={barber.horarios} 
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
                // Se o horário estiver na lista de ocupados, ele fica invisível (ou bloqueado)
                const isBusy = busyTimes.includes(item);
                
                if (isBusy) return null; // RETORNA NULL = NÃO MOSTRA O HORÁRIO

                return (
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
                );
            }}
            ListEmptyComponent={() => (
                <Text className="text-zinc-500 italic">Selecione um dia para ver os horários.</Text>
            )}
            />
        )}
      </View>

      <Text className="text-white text-lg font-bold mb-3">Pagamento no Local</Text>
      <View className="flex-row justify-between mb-8">
        {paymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setPaymentMethod(option.id)}
            className={`flex-1 p-3 mx-1 rounded-xl items-center border ${
              paymentMethod === option.id
              ? 'bg-orange-500 border-orange-500'
              : 'bg-zinc-800 border-zinc-700'
            }`}
          >
            <Text className={`font-bold ${paymentMethod === option.id ? 'text-white' : 'text-zinc-400'}`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        className={`p-4 rounded-xl items-center ${(!selectedDate || !selectedTime || !paymentMethod) ? 'bg-zinc-700' : 'bg-orange-500'}`}
        onPress={handleConfirmBooking}
        disabled={loading || !selectedDate || !selectedTime || !paymentMethod}
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