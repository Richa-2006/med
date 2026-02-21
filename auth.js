import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyC9mRnnrw7pHm2gcPRuiKQlrMrvAlXBoqI",
  authDomain: "medscan-c5465.firebaseapp.com",
  projectId: "medscan-c5465",
  storageBucket: "medscan-c5465.firebasestorage.app",
  messagingSenderId: "79146789931",
  appId: "1:79146789931:web:d6fd36a44dd4b314580e6e",
  measurementId: "G-Y3FEM70XZP"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export async function registerWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}
export { auth, onAuthStateChanged };