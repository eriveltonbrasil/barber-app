import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function AdminPanel({ navigation }: any) {
  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-2xl font-bold text-orange-500">⚙️ Painel Admin</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-zinc-800 p-2 rounded-full">
           <Text className="text-white font-bold">✖</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-zinc-400 mb-6">Área exclusiva para gerenciamento.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEÇÃO BARBEIROS */}
        <Text className="text-white font-bold text-lg mb-3">👨‍⚖️ Equipe</Text>
        <TouchableOpacity 
          className="bg-zinc-800 p-4 rounded-xl mb-3 border border-zinc-700"
          onPress={() => navigation.navigate('AddBarber')}
        >
          <Text className="text-white font-bold">➕ Cadastrar Novo Barbeiro</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700 flex-row justify-between"
          onPress={() => navigation.navigate('ManageBarbers')}
        >
          <Text className="text-zinc-300">📂 Gerenciar / Editar Equipe</Text>
          <Text className="text-orange-500">→</Text>
        </TouchableOpacity>

        {/* SEÇÃO SERVIÇOS */}
        <Text className="text-white font-bold text-lg mb-3">✂️ Serviços e Preços</Text>
        <TouchableOpacity 
          className="bg-zinc-800 p-4 rounded-xl mb-3 border border-zinc-700"
          onPress={() => navigation.navigate('AddService')}
        >
          <Text className="text-white font-bold">➕ Cadastrar Novo Serviço</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700 flex-row justify-between"
          onPress={() => navigation.navigate('ManageServices')}
        >
          <Text className="text-zinc-300">📂 Gerenciar / Editar Serviços</Text>
          <Text className="text-orange-500">→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}