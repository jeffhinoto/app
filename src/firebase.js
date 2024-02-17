
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



const firebaseConfig = {
    apiKey: "AIzaSyCohyOHfHYCms8ZOE1ln5gLsG_uXZRne-w",
    authDomain: "tribos-caixa.firebaseapp.com",
    projectId: "tribos-caixa",
    storageBucket: "tribos-caixa.appspot.com",
    messagingSenderId: "328491405685",
    appId: "1:328491405685:web:5b633ad25d5055b023833c",
    measurementId: "G-0B4GPSB0HC"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app as firebase };