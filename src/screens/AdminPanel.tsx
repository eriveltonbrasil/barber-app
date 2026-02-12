import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function AdminPanel({ navigation }: any) {
  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-2xl font-bold text-orange-500">⚙️ Painel Admin</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-zinc-800 p-2 rounded-full">
           <Text className="text-white font-bold">✖</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-zinc-400 mb-6">Área exclusiva para gerenciamento do EliteBarber.</Text>

      {/* Botões de Ação */}
      <TouchableOpacity 
        className="bg-zinc-800 p-5 rounded-xl mb-4 border border-zinc-700"
        onPress={() => navigation.navigate('AddBarber')}
      >
        <Text className="text-white font-bold text-lg">👨‍⚖️ Cadastrar Novo Barbeiro</Text>
        <Text className="text-zinc-400 text-sm mt-1">Adicione profissionais à sua equipe.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="bg-zinc-800 p-5 rounded-xl mb-4 border border-zinc-700"
        onPress={() => console.log('Ir para Cadastro de Serviço')}
      >
        <Text className="text-white font-bold text-lg">✂️ Cadastrar Novo Serviço</Text>
        <Text className="text-zinc-400 text-sm mt-1">Crie novos tipos de cortes e preços.</Text>
      </TouchableOpacity>
    </View>
  );
}