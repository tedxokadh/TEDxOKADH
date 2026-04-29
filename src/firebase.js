import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyCqOrRKYZBkF7FhzRHNiw8o3uqHqydh4Ho",
  authDomain: "tedxokadh2026.firebaseapp.com",
  projectId: "tedxokadh2026",
  storageBucket: "tedxokadh2026.firebasestorage.app",
  messagingSenderId: "131769637196",
  appId: "1:131769637196:web:5594ed18059e8bbbad97e9"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app, 'default')
export const fns = getFunctions(app)
