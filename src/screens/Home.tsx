import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home({ navigation }: any) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    auth.signOut();
  }

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const querySnapshot = await getDocs(collection(db, "barbeiros"));
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBarbers(lista);
      } catch (error) {
        console.log("Erro ao buscar:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBarbers();
  }, []);

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-zinc-400 text-lg">Olá, Bem-vindo</Text>
          <Text className="text-white text-2xl font-bold mb-2">EliteBarber</Text>
          
          {/* BOTÃO NOVO AQUI EMBAIXO 👇 */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('MyAppointments')}
            className="bg-orange-500 px-4 py-2 rounded-lg self-start mt-2"
          >
            <Text className="text-white font-bold text-sm">📅 Meus Agendamentos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout} className="bg-zinc-800 p-2 rounded-lg">
          <Text className="text-red-400 font-bold">Sair</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white text-xl font-bold mb-4 mt-4">Nossos Profissionais</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <FlatList
          data={barbers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="bg-zinc-800 p-4 rounded-2xl mb-4 flex-row items-center border border-zinc-700"
              onPress={() => navigation.navigate('BarberProfile', { barber: item })}
            >
              <Image 
                source={{ uri: item.foto }} 
                className="w-16 h-16 rounded-full mr-4" 
              />
              <View>
                <Text className="text-white text-lg font-bold">{item.nome}</Text>
                <Text className="text-zinc-400">{item.especialidade}</Text>
                <Text className="text-orange-500 font-bold">⭐ {item.nota}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}