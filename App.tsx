import { NativeWindStyleSheet } from "nativewind";

// --- O TRUQUE MÁGICO PARA WEB 🌐 ---
// Isso força o navegador a pintar as cores igual ao celular
NativeWindStyleSheet.setOutput({
  default: "native",
});

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importante para ler a memória

// Importação das Telas
import AccessScreen from './src/screens/AccessScreen'; 
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import AdminPanel from './src/screens/AdminPanel';
import AddBarber from './src/screens/AddBarber';
import AddService from './src/screens/AddService';
import ManageBarbers from './src/screens/ManageBarbers';
import ManageServices from './src/screens/ManageServices';
import BarberProfile from './src/screens/BarberProfile';
import Booking from './src/screens/Booking';
import MyAppointments from './src/screens/MyAppointments';
import FinancialScreen from './src/screens/FinancialScreen';
import SignUp from './src/screens/SignUp';
import SuperAdmin from './src/screens/SuperAdmin';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Decide qual tela mostrar se o usuário NÃO estiver logado:
  // "AccessScreen" (padrão) ou "Login" (se já tiver digitado o código antes)
  const [initialPublicRoute, setInitialPublicRoute] = useState('AccessScreen');

  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Verifica se já existe um Código de Barbearia salvo
        const shopId = await AsyncStorage.getItem('@delp_shopId');
        
        if (shopId) {
            // Se já tem código, a tela inicial pública será o LOGIN
            setInitialPublicRoute('Login');
        } else {
            // Se não tem, começa do CÓDIGO
            setInitialPublicRoute('AccessScreen');
        }
      } catch (error) {
        console.log("Erro ao recuperar dados:", error);
      }

      // 2. Ouve se o usuário está Logado ou Deslogado no Firebase
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false); // Só libera o app depois de checar tudo
      });

      return unsubscribe;
    }

    initializeApp();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-900 justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // 🔓 ÁREA LOGADA (Privada)
          // Se tiver user, entra aqui direto
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
            <Stack.Screen name="FinancialScreen" component={FinancialScreen} /> 
            <Stack.Screen name="AddBarber" component={AddBarber} />
            <Stack.Screen name="AddService" component={AddService} />
            <Stack.Screen name="ManageBarbers" component={ManageBarbers} />
            <Stack.Screen name="ManageServices" component={ManageServices} />
            <Stack.Screen name="BarberProfile" component={BarberProfile} />
            <Stack.Screen name="Booking" component={Booking} />
            <Stack.Screen name="MyAppointments" component={MyAppointments} />
          </>
        ) : (
          // 🔒 ÁREA PÚBLICA (Deslogada)
          // Aqui usamos o "initialPublicRoute" para decidir se começa no Código ou Login
          <Stack.Group screenOptions={{ headerShown: false }}>
            {initialPublicRoute === 'Login' ? (
                // Se já tem código, a rota principal é Login
                <>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="AccessScreen" component={AccessScreen} />
                </>
            ) : (
                // Se não tem código, a rota principal é AccessScreen
                <>
                    <Stack.Screen name="AccessScreen" component={AccessScreen} />
                    <Stack.Screen name="Login" component={Login} />
                </>
            )}
            
            <Stack.Screen name="SuperAdmin" component={SuperAdmin} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}