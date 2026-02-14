import SuperAdmin from './src/screens/SuperAdmin';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/config/firebase';

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
import FinancialScreen from './src/screens/FinancialScreen'; // <--- Importou aqui?

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          // 🔓 ÁREA LOGADA
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
            <Stack.Screen name="FinancialScreen" component={FinancialScreen} /> 
            {/* ^^^ ELA PRECISA ESTAR AQUI! */}
            
            <Stack.Screen name="AddBarber" component={AddBarber} />
            <Stack.Screen name="AddService" component={AddService} />
            <Stack.Screen name="ManageBarbers" component={ManageBarbers} />
            <Stack.Screen name="ManageServices" component={ManageServices} />
            <Stack.Screen name="BarberProfile" component={BarberProfile} />
            <Stack.Screen name="Booking" component={Booking} />
            <Stack.Screen name="MyAppointments" component={MyAppointments} />
          </>
        ) : (
          // 🔒 ÁREA PÚBLICA
          <>
            <Stack.Screen name="AccessScreen" component={AccessScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SuperAdmin" component={SuperAdmin} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}