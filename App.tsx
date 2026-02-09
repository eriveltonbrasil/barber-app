// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { ActivityIndicator, View, Text, Button } from 'react-native';

// Telas
import Login from './src/screens/Login';

// Criando uma Home Provisória só para testar o login
function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-zinc-900 justify-center items-center">
      <Text className="text-white text-2xl font-bold mb-4">Bem-vindo à BarberQ!</Text>
      <Text className="text-zinc-400 mb-8">Você está logado.</Text>
      <Button title="Sair" color="#f97316" onPress={() => auth.signOut()} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esse "espião" fica ouvindo se o usuário logou ou saiu
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
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
          // Se tiver usuário, mostra a Home
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Se NÃO tiver usuário, mostra o Login
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}