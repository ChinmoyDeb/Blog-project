import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, deleteDoc, doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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
const auth = getAuth();
const provider = new GoogleAuthProvider();
let currentUser = null;

document.getElementById("signInBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error(error);
    });
});

document.getElementById("signOutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error(error);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("userProfile").innerText = `Logged in as: ${user.displayName}`;
        document.getElementById("signInBtn").style.display = "none";
        document.getElementById("signOutBtn").style.display = "inline-block";
        document.getElementById("newPostBtn").style.display = "block";
        listenForPosts();
    } else {
        document.getElementById("userProfile").innerText = "Not signed in";
        document.getElementById("signInBtn").style.display = "inline-block";
        document.getElementById("signOutBtn").style.display = "none";
        document.getElementById("newPostBtn").style.display = "none";
        listenForPosts();
    }
});

document.getElementById("newPostBtn").addEventListener("click", () => {
    document.getElementById("postModal").classList.remove("hidden");
    document.getElementById("postModal").classList.add("show-modal");
});

document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("postModal").classList.remove("show-modal");
    document.getElementById("postModal").classList.add("hidden");
});

document.getElementById("submitPost").addEventListener("click", async () => {
    if (!currentUser) return;
    const postTitle = document.getElementById("postTitle").value.trim();
    const postContent = document.getElementById("postContent").value.trim();
    const postTags = document.getElementById("postTags").value.trim().split(",").map(tag => tag.trim()).filter(tag => tag !== "");

    if (postTitle === "" || postContent === "") return;

    try {
        await addDoc(collection(db, "posts"), {
            title: postTitle,
            content: postContent,
            tags: postTags,
            timestamp: new Date(),
            uid: currentUser.uid,
            author: currentUser.displayName,
            likes: 0,
            likedBy: []
        });

        document.getElementById("postTitle").value = "";
        document.getElementById("postContent").value = "";
        document.getElementById("postTags").value = "";
        document.getElementById("postModal").classList.remove("show-modal");
        document.getElementById("postModal").classList.add("hidden");
    } catch (error) {
        console.error(error);
    }
});

function listenForPosts(searchQuery = "") {
    const postsList = document.getElementById("posts");
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        postsList.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (
                data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                data.author.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                const post = document.createElement("div");
                post.classList.add("post");
                post.innerHTML = `
                    <h3>${data.title}</h3>
                    <p class="author">By: ${data.author}</p>
                    <p>${data.content.substring(0, 200)}...</p>
                    <p class="tags">Tags: ${(Array.isArray(data.tags) ? data.tags.join(", ") : "No tags")}</p>
                    <p class="timestamp">Posted on: ${new Date(data.timestamp.toDate()).toLocaleString()}</p>
                    <p class="likes">Likes: ${data.likes}</p>
                    <button onclick="viewPost('${doc.id}')">Read More</button>
                    ${currentUser ? `<button onclick="likePost('${doc.id}')">Like</button>` : ""}
                    ${currentUser && currentUser.uid === data.uid ? `<button onclick="deletePost('${doc.id}')">Delete</button>` : ""}
                `;
                postsList.appendChild(post);
            }
        });
    }, (error) => {
        console.error(error);
    });
}

document.getElementById("searchBar").addEventListener("input", (e) => {
    listenForPosts(e.target.value);
});

window.likePost = async function(postId) {
    if (!currentUser) return;
    try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);
        const postData = postDoc.data();

        if (postData.likedBy.includes(currentUser.uid)) {
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: arrayRemove(currentUser.uid)
            });
        } else {
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(currentUser.uid)
            });
        }
    } catch (error) {
        console.error(error);
    }
};

window.deletePost = async function(postId) {
    if (!currentUser) return;
    try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);
        const postData = postDoc.data();
        if (postData.uid === currentUser.uid) {
            await deleteDoc(postRef);
        }
    } catch (error) {
        console.error(error);
    }
};

window.viewPost = async function(postId) {
    try {
        const postPage = `post.html?postId=${postId}`;
        window.open(postPage, '_blank');
    } catch (error) {
        console.error(error);
    }
};
