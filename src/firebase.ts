// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZa8dKgw38juEq6BwPgmLa3uU9aevkgyo",
  authDomain: "airdrop-85583.firebaseapp.com",
  projectId: "airdrop-85583",
  storageBucket: "airdrop-85583.appspot.com",
  messagingSenderId: "1007856079528",
  appId: "1:1007856079528:web:c6b6cd712ffab3fcd4a89d",
  measurementId: "G-H8V56PSH2G",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
