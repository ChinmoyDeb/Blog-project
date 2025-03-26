import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDQUT_j9h_8kohWhkpsmw__bwqTKziZ09w",
    authDomain: "blog-1efe6.firebaseapp.com",
    projectId: "blog-1efe6",
    storageBucket: "blog-1efe6.appspot.com",
    messagingSenderId: "1000612071217",
    appId: "1:1000612071217:web:49a320a2237a2728de9210"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('postId');

const postRef = doc(db, "posts", postId);

getDoc(postRef).then((doc) => {
    if (doc.exists()) {
        const data = doc.data();
        const fullPost = document.getElementById("fullPost");
        fullPost.innerHTML = `
            <h2>${data.title}</h2>
            <p>By: ${data.author}</p>
            <p>${data.content.replace(/\n/g, '<br>')}</p> <!-- Replace newlines with <br> -->
            <p class="tags">Tags: ${(Array.isArray(data.tags) ? data.tags.join(", ") : "No tags")}</p>
            <p class="timestamp">Posted on: ${new Date(data.timestamp.toDate()).toLocaleString()}</p>
            <p class="likes">Likes: ${data.likes}</p>
        `;
    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.error("Error fetching post:", error);
});
