import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDM3wqYXeBMeKuZNPlE90LELHJhYsQ6BMY",
  authDomain: "fireship-ne.firebaseapp.com",
  projectId: "fireship-ne",
  storageBucket: "fireship-ne.appspot.com",
  messagingSenderId: "1050755449984",
  appId: "1:1050755449984:web:a87e665684a30d0cc49265"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
