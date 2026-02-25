import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDvrycEMfQJYtEbrW94Rq5ZIv_BnD95ysI",
  authDomain: "ymym-70888.firebaseapp.com",
  projectId: "ymym-70888",
  storageBucket: "ymym-70888.firebasestorage.app",
  messagingSenderId: "74979615203",
  appId: "1:74979615203:web:b73de504815affb7ec00d6",
  measurementId: "G-4CTQM4LHRT",
};

// Next.js-д зориулсан Singleton загвар (Олон дахин initialize хийхээс сэргийлнэ)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firestore-ийг экспорт хийх (Энэ мөр дутуу байсан тул алдаа зааж байсан)
export const db = getFirestore(app);

// Analytics-ийг зөвхөн хөтөч дээр (client-side) ажиллуулах
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) return getAnalytics(app);
  }
  return null;
};
