import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Linking, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FinancialScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    pix: 0,
    dinheiro: 0,
    cartao: 0
  });

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  async function fetchFinancialData() {
    setLoading(true);
    try {
      const shopId = await AsyncStorage.getItem('@delp_shopId');
      const today = getTodayDate();

      if (!shopId) return;

      const q = query(
        collection(db, "agendamentos"), 
        where("shopId", "==", shopId),
        where("data", "==", today) 
      );

      const querySnapshot = await getDocs(q);
      
      let list: any[] = [];
      let sumTotal = 0;
      let sumPix = 0;
      let sumDinheiro = 0;
      let sumCartao = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ id: doc.id, ...data });

        const preco = Number(data.preco || 0);
        sumTotal += preco;

        if (data.metodoPagamento === 'pix') sumPix += preco;
        else if (data.metodoPagamento === 'dinheiro') sumDinheiro += preco;
        else if (data.metodoPagamento === 'cartao') sumCartao += preco;
      });

      // Ordena por horário
      list.sort((a, b) => a.horario.localeCompare(b.horario));

      setTransactions(list);
      setTotals({
        total: sumTotal,
        pix: sumPix,
        dinheiro: sumDinheiro,
        cartao: sumCartao
      });

    } catch (error) {
      console.log("Erro financeiro:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // --- NOVA FUNÇÃO DE LIMPEZA DO TELEFONE ---
  const formatPhoneForWhatsApp = (phone: string) => {
    // 1. Remove tudo que NÃO for número (tira parenteses, traços, espaços)
    let cleanPhone = phone.replace(/\D/g, ''); 
    
    // 2. Se não tiver o código do país (55), adiciona
    // Verifica se o numero tem tamanho de DDD + Celular (10 ou 11 digitos)
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        cleanPhone = '55' + cleanPhone;
    }

    return cleanPhone;
  };

  const contactClient = async (phone: string, name: string) => {
    if (!phone) return;

    const cleanNumber = formatPhoneForWhatsApp(phone);
    const message = `Olá ${name}! ✂️ Aqui é da barbearia. Tudo certo para seu horário hoje?`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    // Verifica se consegue abrir (se tem zap ou navegador)
    const supported = await Linking.canOpenURL(url);

    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Agenda & Caixa 💰</Text>
      </View>

      {/* CARD DO TOTAL GERAL */}
      <View className="bg-orange-500 p-6 rounded-2xl mb-6 shadow-lg">
        <Text className="text-white font-bold text-lg opacity-80">Faturamento Hoje</Text>
        <Text className="text-white font-bold text-4xl mt-1">
          R$ {totals.total.toFixed(2).replace('.', ',')}
        </Text>
        <Text className="text-white mt-2 opacity-80 text-sm">
          {transactions.length} atendimentos agendados
        </Text>
      </View>

      {/* RESUMO POR TIPO */}
      <View className="flex-row justify-between mb-8">
        <View className="bg-zinc-800 p-3 rounded-xl flex-1 mr-2 border border-zinc-700 items-center">
          <Text className="text-zinc-400 text-xs font-bold">💵 DINHEIRO</Text>
          <Text className="text-white font-bold text-lg mt-1">R$ {totals.dinheiro.toFixed(0)}</Text>
        </View>
        <View className="bg-zinc-800 p-3 rounded-xl flex-1 mr-2 border border-zinc-700 items-center">
          <Text className="text-zinc-400 text-xs font-bold">💠 PIX</Text>
          <Text className="text-white font-bold text-lg mt-1">R$ {totals.pix.toFixed(0)}</Text>
        </View>
        <View className="bg-zinc-800 p-3 rounded-xl flex-1 border border-zinc-700 items-center">
          <Text className="text-zinc-400 text-xs font-bold">💳 CARTÃO</Text>
          <Text className="text-white font-bold text-lg mt-1">R$ {totals.cartao.toFixed(0)}</Text>
        </View>
      </View>

      <Text className="text-white text-lg font-bold mb-4">Agenda do Dia</Text>

      {loading ? (
        <ActivityIndicator color="#f97316" size="large" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row justify-between items-center border border-zinc-700">
              <View className="flex-1">
                 {/* Agora mostra o NOME DO CLIENTE */}
                <Text className="text-white font-bold text-lg">
                    {item.clienteNome ? item.clienteNome : "Cliente (sem nome)"}
                </Text>
                <Text className="text-zinc-400 text-sm">{item.servicoNome} • {item.horario}</Text>
                
                {/* Mostra qual barbeiro vai atender (útil se tiver muitos) */}
                <Text className="text-zinc-500 text-xs mt-1">Prof: {item.barbeiroNome}</Text>
              </View>

              <View className="items-end">
                <Text className="text-orange-500 font-bold text-lg">
                  R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                </Text>
                
                {/* BOTÃO DO WHATSAPP DO CLIENTE */}
                {item.clienteTelefone && (
                    <TouchableOpacity 
                        onPress={() => contactClient(item.clienteTelefone, item.clienteNome)}
                        className="bg-green-600 px-3 py-1 rounded-full mt-2 flex-row items-center"
                    >
                        <Text className="text-white text-xs font-bold">Chamar no Zap 💬</Text>
                    </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text className="text-zinc-500 text-center mt-4">Nenhum agendamento hoje.</Text>
          )}
        />
      )}
    </View>
  );
}