import { initializeApp, getApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Suas chaves (Mantidas originais)
const firebaseConfig = {
  apiKey: "AIzaSyD36XM0x2Lu1NITvACJxB65Y4Of6kSvczo",
  authDomain: "barbershopapp-82c3b.firebaseapp.com",
  projectId: "barbershopapp-82c3b",
  storageBucket: "barbershopapp-82c3b.firebasestorage.app",
  messagingSenderId: "523904445224",
  appId: "1:523904445224:web:7ee12a7f3531f09ca6be1d"
};

// 1. Garante que o App só é criado uma vez (Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Garante que o Auth é criado uma vez e com persistência
// Usamos uma função imediata para definir o valor de 'auth' como const
const auth = (() => {
  try {
    // Tenta inicializar com AsyncStorage
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    // Se der erro (porque já existe), devolve o auth existente
    return getAuth(app);
  }
})();

// Exporta como constantes garantidas
export { auth };
export const db = getFirestore(app);