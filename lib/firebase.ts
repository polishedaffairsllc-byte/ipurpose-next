// /lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ⭐️ ADDED: Firestore import

const firebaseConfig = {
  apiKey: "AIzaSyDegeh8F2DEhw8kph44wrNtL7UfaQbZ2FQ",
  authDomain: "ipurpose-mvp.firebaseapp.com",
  projectId: "ipurpose-mvp",
  storageBucket: "ipurpose-mvp.appspot.com",
  messagingSenderId: "541920740886",
  appId: "1:541920740886:web:13af094ca31b9f54951737",
  measurementId: "G-9D1QBMLNWK",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app); // ⭐️ ADDED: Firestore initialization and export