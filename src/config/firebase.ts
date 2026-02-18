import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  browserSessionPersistence, // <--- IMPORTANTE: Importamos a persistência de sessão
  getAuth 
} from "firebase/auth";
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

let auth: any;

if (Platform.OS === 'web') {
  // --- CONFIGURAÇÃO ESPECÍFICA PARA WEB ---
  // Usamos browserSessionPersistence para que o logout limpe tudo.
  // Se der erro ao inicializar (porque já existe), pegamos a instância atual.
  try {
    auth = initializeAuth(app, {
      persistence: browserSessionPersistence
    });
  } catch (e) {
    auth = getAuth(app);
  }
} else {
  // --- CONFIGURAÇÃO PARA CELULAR (Android/iOS) ---
  // Usamos AsyncStorage para manter o usuário logado mesmo fechando o app.
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app); 
  }
}

export { auth };
export const db = getFirestore(app);