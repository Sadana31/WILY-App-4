import * as firebase from 'firebase';
require("@firebase/firestore");

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDhDmKwWEGnFJ0ykGkTiex4C0Oxtj2TEyA",
    authDomain: "wily-38271.firebaseapp.com",
    databaseURL: "https://wily-38271.firebaseio.com",
    projectId: "wily-38271",
    storageBucket: "wily-38271.appspot.com",
    messagingSenderId: "493108099360",
    appId: "1:493108099360:web:4fe20ce2e360fdc80bff45"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();