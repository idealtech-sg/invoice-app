import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyC4W-MeS0Qg8nd09hSo1KDIzgel9wwnzig",
    authDomain: "idealtech-reminder-app.firebaseapp.com",
    projectId: "idealtech-reminder-app",
    storageBucket: "idealtech-reminder-app.appspot.com",
    messagingSenderId: "707633480338",
    appId: "1:707633480338:web:837e3e46fbe0cc8d52dc4b"
};
  

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore();