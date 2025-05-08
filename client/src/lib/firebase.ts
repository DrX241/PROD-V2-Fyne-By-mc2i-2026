import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from "firebase/auth";

// Configuration Firebase avec les variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyC2kxgH5E09zv-SvQgkoMJaExrj-R4EA9Q",
  authDomain: "fyne-76509.firebaseapp.com",
  projectId: "fyne-76509",
  storageBucket: "fyne-76509.firebasestorage.app",
  messagingSenderId: "1035357559789",
  appId: "1:1035357559789:web:20946651d1eeb06cc165e4"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Récupération de l'authentification Firebase
export const auth = getAuth(app);

// Authentification avec Google
export const googleProvider = new GoogleAuthProvider();

// Fonction pour se connecter avec Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erreur lors de la connexion avec Google :", error);
    throw error;
  }
};

// Fonction pour se connecter avec email et mot de passe
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Erreur lors de la connexion avec email :", error);
    throw error;
  }
};

// Fonction pour créer un utilisateur avec email et mot de passe
export const createUserWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    throw error;
  }
};

// Fonction pour se déconnecter
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    throw error;
  }
};

// Export de l'instance Firebase
export default app;