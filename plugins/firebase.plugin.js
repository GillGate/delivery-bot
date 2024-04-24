import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../config/firebase.config";

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);