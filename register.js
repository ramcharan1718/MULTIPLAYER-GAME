import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBi-TpBbiidZ2SJXEd6AHGQ2RZc-E0rKsM",
  authDomain: "real-6b779.firebaseapp.com",
  projectId: "real-6b779",
  storageBucket: "real-6b779.firebasestorage.app",
  messagingSenderId: "344566980632",
  appId: "1:344566980632:web:56a91e44e3e7784d58a36d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const submit = document.getElementById('submit');
const signupbtn = document.getElementById('signupbtn');

// Sign In Handler
submit.addEventListener("click", function(event) {
  event.preventDefault();

  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Logged in!");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Sign Up Handler (with email verification)
signupbtn.addEventListener("click", function(event) {
  event.preventDefault();

  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  // Create User
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Send email verification only after account creation
      sendEmailVerification(user)
        .then(() => {
          alert("Account created! A verification email has been sent. Please verify your email before logging in.");
          
        })
        .catch((error) => {
          alert("Error sending email verification: " + error.message);
        });

    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');


// Enable buttons only if both fields have values
function updateButtonState() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const filled = email !== '' && password !== '';

  if (submit) submit.disabled = !filled;
  if (signupbtn) signupbtn.disabled = !filled;
}

// Listen for typing in both fields
emailInput.addEventListener('input', updateButtonState);
passwordInput.addEventListener('input', updateButtonState);

// Initial check
updateButtonState();


// Add these imports at the top
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firestore right after auth
const db = getFirestore(app);

// Replace your existing signupbtn event listener with this:
signupbtn.addEventListener("click", function(event) {
  event.preventDefault();

  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      
      // Prepare user data for Firestore
      const userData = {
        email: user.email,
        createdAt: new Date(),
        verified: false,
        lastLogin: null
      };

      // Store in Firestore
      return setDoc(doc(db, "users", user.uid), userData)
        .then(() => {
          // Send verification email after Firestore write
          return sendEmailVerification(user);
        });
    })
    .then(() => {
      alert("Account created and data stored! Verification email sent.");
    })
    .catch((error) => {
      console.error("Full error:", error);
      alert("Error: " + error.message);
    });
});



