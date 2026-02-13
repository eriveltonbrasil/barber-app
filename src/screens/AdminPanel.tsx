import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminPanel() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-orange-500 text-lg font-bold">← Voltar</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold mt-4">Painel Admin ⚙️</Text>
        <Text className="text-zinc-400">Gerencie sua barbearia por aqui.</Text>
      </View>

      {/* Botão FINANCEIRO (Novo!) */}
      <TouchableOpacity 
        className="bg-green-600 p-5 rounded-xl mb-4 flex-row items-center border border-green-400"
        onPress={() => navigation.navigate('FinancialScreen')}
      >
        <View className="bg-white/20 p-3 rounded-full mr-4">
          <Text className="text-2xl">💰</Text>
        </View>
        <View>
          <Text className="text-white font-bold text-xl">Financeiro & Caixa</Text>
          <Text className="text-green-100 text-sm">Ver faturamento do dia</Text>
        </View>
      </TouchableOpacity>

      <Text className="text-zinc-500 font-bold mb-2 mt-4 uppercase text-xs">Cadastros</Text>

      <TouchableOpacity 
        className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row items-center border border-zinc-700"
        onPress={() => navigation.navigate('ManageBarbers')}
      >
        <Text className="text-2xl mr-4">✂️</Text>
        <View>
          <Text className="text-white font-bold text-lg">Gerenciar Equipe</Text>
          <Text className="text-zinc-400 text-sm">Adicionar ou remover barbeiros</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-zinc-800 p-4 rounded-xl mb-3 flex-row items-center border border-zinc-700"
        onPress={() => navigation.navigate('ManageServices')}
      >
        <Text className="text-2xl mr-4">🏷️</Text>
        <View>
          <Text className="text-white font-bold text-lg">Gerenciar Serviços</Text>
          <Text className="text-zinc-400 text-sm">Preços e tipos de corte</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}