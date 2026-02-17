import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // <--- IMPORTANTE: Adicionamos isso

// Suas chaves (Mantidas originais)
const firebaseConfig = {
  apiKey: "AIzaSyD36XM0x2Lu1NITvACJxB65Y4Of6kSvczo",
  authDomain: "barbershopapp-82c3b.firebaseapp.com",
  projectId: "barbershopapp-82c3b",
  storageBucket: "barbershopapp-82c3b.firebasestorage.app",
  messagingSenderId: "523904445224",
  appId: "1:523904445224:web:7ee12a7f3531f09ca6be1d"
};

// 1. Singleton do App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Configuração Inteligente de Auth (O SEGREDO DA CORREÇÃO) 🛠️
let auth;

if (Platform.OS === 'web') {
  // NA WEB: Usa o padrão do navegador. 
  // Isso permite que o 'Sair' funcione perfeitamente e limpe a sessão.
  auth = getAuth(app);
} else {
  // NO ANDROID/IOS: Usa o AsyncStorage.
  // Isso garante que o usuário continue logado mesmo fechando o app.
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    // Se der erro (ex: já inicializado), pega a instância existente
    auth = getAuth(app);
  }
}

// Exporta
export { auth };
export const db = getFirestore(app);