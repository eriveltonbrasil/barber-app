import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Importamos 'query' e 'where'
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para ler a memória

export default function Home() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused(); // Para saber se a tela está ativa
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('');

  // Função para buscar barbeiros FILTRADOS
  async function fetchBarbers() {
    setLoading(true);
    try {
      // 1. Descobre qual barbearia o usuário escolheu
      const shopId = await AsyncStorage.getItem('@delp_shopId');
      const name = await AsyncStorage.getItem('@delp_shopName');
      setShopName(name || 'Barbearia');

      if (!shopId) {
        console.log("Nenhuma barbearia selecionada.");
        setLoading(false);
        return;
      }

      // 2. Cria a pergunta para o banco: "Me dê os barbeiros onde shopId == xxxxx"
      const q = query(collection(db, "barbeiros"), where("shopId", "==", shopId));
      
      // 3. Busca os dados
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setBarbers(lista);
    } catch (error) {
      console.log("Erro ao buscar barbeiros:", error);
    } finally {
      setLoading(false);
    }
  }

  // Recarrega sempre que a tela ganha foco
  useEffect(() => {
    if (isFocused) {
      fetchBarbers();
    }
  }, [isFocused]);

  function handleLogout() {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-zinc-400 text-sm">Olá, Bem-vindo</Text>
          {/* Mostra o nome da Barbearia Dinamicamente */}
          <Text className="text-white text-2xl font-bold">{shopName}</Text>
        </View>
        
        <TouchableOpacity 
          className="bg-zinc-800 p-2 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-red-400 font-bold text-xs">Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Botões Principais */}
      <View className="mb-8">
        <TouchableOpacity 
          className="bg-orange-500 p-4 rounded-xl mb-3 flex-row items-center justify-center"
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <Text className="text-white font-bold text-lg">📅 Meus Agendamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-zinc-800 border border-orange-500/50 p-4 rounded-xl flex-row items-center justify-center"
          onPress={() => navigation.navigate('AdminPanel')}
        >
          <Text className="text-orange-500 font-bold text-lg">⚙️ Painel Admin</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white text-xl font-bold mb-4">Nossos Profissionais</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" />
      ) : (
        <FlatList 
          data={barbers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="bg-zinc-800 p-4 rounded-xl mb-4 flex-row items-center border border-zinc-700"
              onPress={() => navigation.navigate('BarberProfile', { barber: item })}
            >
              <Image 
                source={{ uri: item.foto }} 
                className="w-16 h-16 rounded-full mr-4" 
              />
              <View>
                <Text className="text-white text-lg font-bold">{item.nome}</Text>
                <Text className="text-zinc-400">{item.especialidade}</Text>
                <Text className="text-orange-500 font-bold mt-1">★ {item.nota}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
             <Text className="text-zinc-500 text-center mt-10">
               Nenhum barbeiro encontrado nesta unidade.
             </Text>
          )}
        />
      )}
    </View>
  );
}