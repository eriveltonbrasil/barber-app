import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, Platform } from 'react-native';
import { signOut } from 'firebase/auth'; 
import { auth, db } from '../config/firebase'; 
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation }: any) {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [shopName, setShopName] = useState('');
  const [isOwner, setIsOwner] = useState(false); 

  useEffect(() => {
    async function checkPermission() {
        const name = await AsyncStorage.getItem('@delp_shopName');
        const ownerEmail = await AsyncStorage.getItem('@delp_ownerEmail');
        const currentUserEmail = auth.currentUser?.email;

        setShopName(name || "Barbearia");

        if (currentUserEmail && ownerEmail && currentUserEmail.toLowerCase() === ownerEmail.toLowerCase()) {
            setIsOwner(true); 
        } else {
            setIsOwner(false);
        }
    }
    checkPermission();
  }, []);

  useEffect(() => {
    async function fetchBarbers() {
      try {
        const shopId = await AsyncStorage.getItem('@delp_shopId');
        if (!shopId) return;

        const q = query(collection(db, "barbeiros"), where("shopId", "==", shopId));
        const querySnapshot = await getDocs(q);
        
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBarbers(lista);
      } catch (error) {
        console.log(error);
      }
    }
    fetchBarbers();
  }, []);

  function handleLogout() {
    // 1. LOG DE DEPURAÇÃO (Para vermos no navegador se funcionou)
    console.log("--- INICIANDO PROCESSO DE LOGOUT NUCLEAR ---");

    Alert.alert("Sair", "Deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sim, Sair", 
        onPress: async () => {
          
          if (Platform.OS === 'web') {
            try {
               // 2. LIMPEZA PROFUNDA WEB
               console.log("Limpando IndexedDB...");
               
               // @ts-ignore
               if (window.indexedDB && window.indexedDB.databases) {
                   // @ts-ignore
                   const dbs = await window.indexedDB.databases();
                   dbs.forEach((db: any) => {
                       if (db.name && db.name.includes('firebase')) {
                           window.indexedDB.deleteDatabase(db.name);
                           console.log(`Deletado DB: ${db.name}`);
                       }
                   });
               }
               
               window.localStorage.clear();
               window.sessionStorage.clear();
               console.log("Storage limpo.");

            } catch (e) {
               console.log("Erro na limpeza web:", e);
            }
          }

          try {
            await signOut(auth);
            console.log("Firebase SignOut realizado.");
          } catch (error) {
            console.log("Erro Firebase:", error);
          }

          // 3. REDIRECIONAMENTO FORÇADO
          if (Platform.OS === 'web') {
              console.log("Redirecionando para raiz...");
              window.location.href = "/"; 
          }
        }
      }
    ]);
  }

  return (
    <View className="flex-1 bg-zinc-900 px-6 pt-12">
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <Text className="text-zinc-400 text-sm">Olá, Bem-vindo</Text>
          <Text className="text-white text-3xl font-bold">{shopName}</Text>
        </View>
        
        {/* --- BOTÃO DE TESTE VISUAL (ROXO) --- */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-purple-600 px-4 py-2 rounded-lg border border-purple-500"
        >
          <Text className="text-white font-bold">SAIR (TESTE)</Text>
        </TouchableOpacity>
        {/* ------------------------------------ */}

      </View>

      <View className="mb-8">
        <TouchableOpacity 
          className="bg-orange-500 p-4 rounded-xl mb-3 items-center"
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <Text className="text-white font-bold text-lg">📅 Meus Agendamentos</Text>
        </TouchableOpacity>

        {isOwner && (
            <TouchableOpacity 
            className="bg-zinc-800 p-4 rounded-xl items-center border border-zinc-700"
            onPress={() => navigation.navigate('AdminPanel')}
            >
            <Text className="text-orange-500 font-bold text-lg">⚙️ Painel Admin</Text>
            </TouchableOpacity>
        )}
      </View>

      <Text className="text-white text-xl font-bold mb-4">Nossos Profissionais</Text>

      <FlatList
        data={barbers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('BarberProfile', { barber: item })}
            className="bg-zinc-800 p-4 rounded-xl mb-4 flex-row items-center border border-zinc-700"
          >
            <Image 
              source={{ uri: item.foto }} 
              className="w-16 h-16 rounded-full mr-4 bg-zinc-700" 
            />
            <View>
              <Text className="text-white font-bold text-lg">{item.nome}</Text>
              <Text className="text-zinc-400 text-sm">{item.especialidade}</Text>
              <Text className="text-orange-500 text-sm mt-1">⭐ {item.nota}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
            <Text className="text-zinc-500 mt-4 text-center">Nenhum barbeiro disponível.</Text>
        )}
      />
    </View>
  );
}