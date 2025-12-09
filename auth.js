import { auth, googleProvider, database } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    onAuthStateChanged,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { showToast, debounce } from './utils.js';

// DOM Elements
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const googleBtn = document.getElementById('google-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const resetModal = document.getElementById('reset-modal');
const closeModalBtn = document.querySelector('.close-modal');
const sendResetBtn = document.getElementById('send-reset-btn');
const resetEmailInput = document.getElementById('reset-email');
const rememberMeCheckbox = document.getElementById('remember-me');

// Validation Feedback Elements
const emailFeedback = document.getElementById('email-feedback');
const passwordFeedback = document.getElementById('password-feedback');

let isLoginMode = true;

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'chat.html';
    }
});

// Toggle Login/Signup
toggleAuthModeBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    submitBtn.textContent = isLoginMode ? 'Sign In' : 'Sign Up';
    toggleAuthModeBtn.textContent = isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Sign in';

    // Clear validation
    clearValidation(emailInput, emailFeedback);
    clearValidation(passwordInput, passwordFeedback);
});

// Input Validation Logic
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
};

const setValidationStatus = (input, feedback, isValid, message = '') => {
    input.classList.remove('valid', 'invalid');
    input.classList.add(isValid ? 'valid' : 'invalid');
    feedback.textContent = message;
    feedback.style.color = isValid ? '#00b894' : '#ff7675';
};

const clearValidation = (input, feedback) => {
    input.classList.remove('valid', 'invalid');
    feedback.textContent = '';
};

// Real-time Validation
emailInput.addEventListener('input', debounce(() => {
    const email = emailInput.value;
    if (!email) {
        clearValidation(emailInput, emailFeedback);
        return;
    }

    if (validateEmail(email)) {
        setValidationStatus(emailInput, emailFeedback, true, "Valid email");
    } else {
        setValidationStatus(emailInput, emailFeedback, false, "Invalid email format");
    }
}, 500));

passwordInput.addEventListener('input', debounce(() => {
    const password = passwordInput.value;
    if (!password) {
        clearValidation(passwordInput, passwordFeedback);
        return;
    }

    const error = validatePassword(password);
    if (!error) {
        setValidationStatus(passwordInput, passwordFeedback, true, "SECURE");
    } else {
        setValidationStatus(passwordInput, passwordFeedback, false, error.toUpperCase());
    }
}, 500));

// Email/Password Auth
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Final Validation Check
    if (!validateEmail(email) || validatePassword(password)) {
        showToast('INVALID INPUT DETECTED', 'error');
        return;
    }

    try {
        // Set Persistence
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        let userCredential;
        if (isLoginMode) {
            userCredential = await signInWithEmailAndPassword(auth, email, password);
            showToast('ACCESS GRANTED. WELCOME BACK.', 'success');
        } else {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await createUserProfile(userCredential.user);
            showToast('IDENTITY CREATED. ACCESS GRANTED.', 'success');
        }
    } catch (error) {
        console.error(error);
        let msg = error.message;
        if (error.code === 'auth/invalid-credential') msg = "INVALID CREDENTIALS";
        if (error.code === 'auth/email-already-in-use') msg = "IDENTITY ALREADY EXISTS";
        if (error.code === 'auth/weak-password') msg = "PASSWORD TOO WEAK";
        showToast(`ACCESS DENIED: ${msg}`, 'error');
    }
});

// Google Auth
googleBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserProfile(result.user);
        showToast('GOOGLE IDENTITY VERIFIED.', 'success');
    } catch (error) {
        console.error(error);
        showToast(`GOOGLE AUTH ERROR: ${error.message}`, 'error');
    }
});

// Password Reset Logic
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    resetModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    resetModal.classList.add('hidden');
});

sendResetBtn.addEventListener('click', async () => {
    const email = resetEmailInput.value;
    if (!validateEmail(email)) {
        showToast('INVALID EMAIL ADDRESS', 'error');
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showToast('RESET LINK TRANSMITTED. CHECK INBOX.', 'success');
        resetModal.classList.add('hidden');
    } catch (error) {
        console.error(error);
        showToast(`RESET ERROR: ${error.message}`, 'error');
    }
});

// Helper to create user profile in Realtime Database
async function createUserProfile(user) {
    const userRef = ref(database, 'users/' + user.uid);
    await set(userRef, {
        username: user.displayName || user.email?.split('@')[0] || user.phoneNumber || "ANONYMOUS",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLogin: Date.now()
    });
}
