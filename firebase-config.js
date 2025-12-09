// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrqpTQFQcQqWgAWKzsQYyWowLlur0v_Dc",
    authDomain: "chat-application-b5e52.firebaseapp.com",
    databaseURL: "https://chat-application-b5e52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chat-application-b5e52",
    storageBucket: "chat-application-b5e52.firebasestorage.app",
    messagingSenderId: "771673551972",
    appId: "1:771673551972:web:cf77b3c18623c19bdb5b71",
    measurementId: "G-3CSGHVCH9J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, database, storage, googleProvider };
