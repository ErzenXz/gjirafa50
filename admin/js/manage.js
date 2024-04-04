firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      // User is signed in.
   } else {
      // No user is signed in.
      window.location.href = "login.html";
   }
});

const db = firebase.database();

let productsREF = db.ref("products");
let posts = [];
let lastKey = null;

let limit = 8;

// Function to fetch posts from the database
function fetchPosts() {
   productsREF
      .orderByKey()
      .limitToFirst(limit)
      .once("value", (snapshot) => {
         snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            if (!posts.includes(childData)) {
               let key = childSnapshot.key;
               childData.id = key;
               posts.push(childData);
            }
            lastKey = childSnapshot.key;
         });
         renderPosts(posts);
      });
}

// Function to fetch more posts from the database
function fetchMorePosts() {
   productsREF
      .orderByKey()
      .startAfter(lastKey)
      .limitToFirst(limit)
      .once("value", (snapshot) => {
         snapshot.forEach((childSnapshot) => {
            const childData = childSnapshot.val();
            if (!posts.includes(childData)) {
               let key = childSnapshot.key;
               childData.id = key;
               posts.push(childData);
            }
            lastKey = childSnapshot.key;
         });
         renderPosts(posts);
      });
}

// Function to render posts to the DOM

function renderPosts(posts) {
   const postsContainer = document.getElementById("postsContainer");
   postsContainer.innerHTML = "";
   posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post";

      let images = post.images;
      let smallImages = "";
      images.forEach((image) => {
         smallImages += `<img src="${image}" alt="${post.name}" style="width: 50px; height: 50px; object-fit: cover;">`;
      });

      postElement.innerHTML = `
        <h2>${post.name}</h2>
        <small>${new Date(post.time).toLocaleString()}</small>
        <img src="${post.image}" alt="${
         post.name
      }" style="width: 100px; height: 100px; object-fit: cover;">
        <div class="smallImages">
            ${smallImages}
        </div>
        <p>Price: ${calculateDiscountedPrice(post.price, post.discount)}</p>
        <p>Category: ${post.category}</p>
        <p>End Discount Date: ${post.endDiscountDate}</p>
        <button onclick="editPost('${post.id}')">Edit</button>
        <button onclick="deletePost('${post.id}')">Delete</button>
    `;

      function calculateDiscountedPrice(price, discount) {
         if (discount === 0) {
            return price;
         } else {
            const discountedPrice = price - (price * discount) / 100;
            return discountedPrice;
         }
      }
      postsContainer.appendChild(postElement);
   });
}

// Function to delete a post
function deletePost(id) {
   const postRef = db.ref("products/" + id);
   postRef.remove();
   toast("Post deleted successfully");
   fetchPosts();
}

// Function to edit a post
function editPost(id) {
   let postRef = db.ref("products/" + id);

   postRef.once("value", (snapshot) => {
      const post = snapshot.val();

      console.log(post);

      let name = post.name;
      let description = post.description;

      // Replace " with &quot; to avoid breaking the HTML and ' with &apos; to avoid breaking the JavaScript
      name = name.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
      description = description.replace(/"/g, "&quot;").replace(/'/g, "&apos;");

      let modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Post</h2>
                <label for="name">Name:</label>
                <input type="text" id="name" value="${name}">
                <label for="description">Description:</label>
                <textarea id="description">${description}</textarea>
                <label for="price">Price:</label>
                <input type="number" id="price" value="${post.price}">
                <label for="discount">Discount:</label>
                <input type="number" id="discount" value="${post.discount}">
                <label for="category">Category:</label>
                <input type="text" id="category" value="${post.category}">
                <label for="endDiscountDate">End Discount Date:</label>
                <input type="date" id="endDiscountDate" value="${post.endDiscountDate}">
                <button onclick="updatePost('${id}')">Update</button>
            </div>
        `;
      document.body.appendChild(modal);

      let close = modal.querySelector(".close");
      close.onclick = function () {
         modal.remove();
      };
   });
}

// Function to update a post
function updatePost(id) {
   let postRef = db.ref("products/" + id);

   let name = document.getElementById("name").value;
   let price = document.getElementById("price").value;
   let discount = document.getElementById("discount").value;
   let category = document.getElementById("category").value;
   let endDiscountDate = document.getElementById("endDiscountDate").value;

   postRef.update({
      name: name,
      price: price,
      discount: discount,
      category: category,
      endDiscountDate: endDiscountDate,
   });

   toast("Post updated successfully");
   fetchPosts();
   document.querySelector(".modal").remove();
}

// Button event listener to load more posts
const loadMoreButton = document.getElementById("loadMoreButton");
loadMoreButton.addEventListener("click", fetchMorePosts);

function toast(message, duration = 4500, delay = 0) {
   // Check for existing toast class elements

   const existingToast = document.querySelector(".toast5");

   if (existingToast) {
      existingToast.remove();
   }

   const toastContainer = document.createElement("div");
   toastContainer.style.position = "fixed";
   toastContainer.style.top = "1rem";
   toastContainer.style.right = "1rem";
   toastContainer.style.display = "flex";
   toastContainer.style.alignItems = "center";
   toastContainer.style.justifyContent = "center";
   toastContainer.style.width = "16rem";
   toastContainer.style.padding = "1rem";
   toastContainer.style.backgroundColor = "#1F2937";
   toastContainer.style.color = "#FFF";
   toastContainer.style.borderRadius = "0.25rem";
   toastContainer.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.25)";
   toastContainer.style.overflow = "auto";
   toastContainer.style.maxHeight = "500px";
   toastContainer.style.minWidth = "200px";
   toastContainer.style.width = "fit-content";
   toastContainer.style.zIndex = "9999";
   toastContainer.setAttribute("class", "toast5");

   const toastText = document.createElement("span");
   toastText.style.whiteSpace = "nowrap";
   toastText.style.overflow = "hidden";
   toastText.style.textOverflow = "ellipsis";
   toastText.textContent = message;
   toastContainer.appendChild(toastText);

   document.body.appendChild(toastContainer);

   setTimeout(() => {
      toastContainer.style.opacity = "0";
      setTimeout(() => {
         toastContainer.remove();
      }, 300);
   }, duration + delay);

   toast.dismiss = function () {
      toastContainer.style.opacity = "0";
      setTimeout(() => {
         toastContainer.remove();
      }, 300);
   };
}

fetchPosts();
