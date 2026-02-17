import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyD36XM0x2Lu1NITvACJxB65Y4Of6kSvczo",
  authDomain: "barbershopapp-82c3b.firebaseapp.com",
  projectId: "barbershopapp-82c3b",
  storageBucket: "barbershopapp-82c3b.firebasestorage.app",
  messagingSenderId: "523904445224",
  appId: "1:523904445224:web:7ee12a7f3531f09ca6be1d"
};

// Singleton do App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth Configurado Separadamente para Web e Mobile
let auth: any;

if (Platform.OS === 'web') {
  // Na Web, usamos o padrão (localStorage do navegador)
  // Isso evita conflitos com o AsyncStorage do React Native
  auth = getAuth(app);
} else {
  // No Mobile, usamos o AsyncStorage
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app); // Fallback caso já esteja inicializado
  }
}

export { auth };
export const db = getFirestore(app);