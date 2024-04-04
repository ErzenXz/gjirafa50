// Check if the user is logged in!

let userID = null;

firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      // User is signed in.
      userID = user.uid;
   } else {
      // No user is signed in.
      window.location.href = "login.html";
   }
});

// Initialize Cloud Firestore
const products = firebase.database().ref("products");

// Adding a post

function addPost() {
   toast("Adding a product...");
   let title = document.getElementById("postTitle").value;
   let post = simplemde.value();
   let tags = document.getElementById("postTags").value;
   let category = document.getElementById("postCategory").value;
   let img = document.getElementById("postImage").value;

   if (title == "" || post == "" || tags == "") {
      toast("Please fill all the fields!");
      return false;
   }

   var words = tags.split(/\s+/).filter(function (word) {
      return word.trim() !== "";
   });

   for (var i = 0; i < words.length; i++) {
      if (words[i] == "") {
         words.splice(i, 1);
      }

      if (words.includes(words[i], i + 1)) {
         words.splice(i, 1);
      }
   }

   post = createVideoTagsFromString(post);

   let otherImages = document.getElementById("otherImages").value;

   if (otherImages == "") {
      otherImages = img;
   }

   let images = otherImages.split(" ");

   images.push(img);

   let date = new Date();
   let tagsA = words;

   if (img == "") {
      img = "./images/placeholder.svg";
   }

   let price = document.getElementById("price").value;
   let discount = document.getElementById("discount").value;

   if (discount == "") {
      discount = 0;
   }

   if (price == "") {
      toast("Please enter a price!");
      return false;
   }

   const searchIndex = tokenizeSearchableText(title);

   let stock = document.getElementById("stock").value;
   let endData = document.getElementById("enddate").value;

   if (endData == "") {
      toast("Please enter a date!");
      return false;
   }

   if (stock == "") {
      toast("Please enter a stock!");
      return false;
   }

   addProduct(
      img,
      images,
      title,
      post,
      price,
      discount,
      category,
      stock,
      "?",
      "?",
      "?",
      endData,
      searchIndex
   );
}

// Function to add a product to the database

function addProduct(
   imageURL,
   images,
   name,
   description,
   price,
   discount,
   category,
   stock,
   color,
   size,
   material,
   endDiscountDate,
   tokenize
) {
   let product = {
      image: imageURL,
      images: images,
      name: name,
      description: description,
      price: price,
      discount: discount,
      category: category,
      stock: stock,
      color: color,
      size: size,
      material: material,
      administrator: userID,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      endDiscountDate: endDiscountDate,
      likes: 0,
      dislikes: 0,
      views: 0,
      reviews: [],
   };

   products.push(product);
   toast("Product added successfully!");
   addProductF("products");
}

function countWords(str) {
   // Remove leading and trailing whitespaces
   str = str.trim();

   // If the string is empty, return 0
   if (str === "") {
      return 0;
   }

   // Split the string into an array of words using whitespace as the delimiter
   const words = str.split(/\s+/);

   // Return the count of words
   return words.length;
}

function formatReadingTime(minutes) {
   if (minutes < 1) {
      return "Less than a minute";
   } else if (minutes === 1) {
      return "1 minute";
   } else if (minutes < 60) {
      return minutes + " minutes";
   } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      let formattedTime = `${hours} hour${hours > 1 ? "s" : ""}`;

      if (remainingMinutes > 0) {
         formattedTime += ` ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
      }

      return formattedTime;
   }
}

function calculateReadingTime(text) {
   // Average reading speed in words per minute
   const readingSpeed = 200;

   // Remove leading and trailing white spaces
   text = text.trim();

   // Split the string into an array of words
   const words = text.split(/\s+/);

   // Calculate the number of words
   const wordCount = words.length;

   // Calculate the reading time in minutes
   const readingTime = Math.ceil(wordCount / readingSpeed);

   // Format the reading time
   const formattedTime = formatReadingTime(readingTime);

   return formattedTime;
}

var simplemde = new SimpleMDE({
   spellChecker: false,
});

// Add an event listener for the 'input' event

simplemde.codemirror.on("change", handleTextareaInput);

// Event handler function
function handleTextareaInput(event) {
   // Get the value of the textarea
   const text = simplemde.value();

   // Perform any desired actions with the text
   document.getElementById("stats").innerHTML = "Time to read: " + calculateReadingTime(text);
}

function toast(message, duration = 4500, delay = 0) {
   // Check for existing toast class elements

   const existingToast = document.querySelector(".toast");

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
   toastContainer.setAttribute("class", "toast");

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

// Function to toggle the visibility of the content container based on the editor's modes
function toggleContentVisibility() {
   if (simplemde.isSideBySideActive() || simplemde.isFullscreenActive()) {
      document.getElementById("nav").classList.add("hidden");
      document.getElementById("others").classList.add("hidden");
   } else {
      document.getElementById("nav").classList.remove("hidden");
      document.getElementById("others").classList.remove("hidden");
   }
}

function tokenizeSearchableText(text) {
   return text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);
}

function createVideoTagsFromString(inputString) {
   // Regular expression to match video links (including YouTube and IPFS)
   const videoRegex =
      /(https?:\/\/[^\s]+?\.(mp4|webm))|(https?:\/\/ipfs\.io\/ipfs\/[^\s]+)|(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^\s&]+))/gi;

   // Find all video links in the input string
   const videoLinks = inputString.match(videoRegex);

   if (!videoLinks) {
      console.log("No video links found.");
      return inputString;
   }

   let outputString = inputString;

   // Iterate through the video links
   videoLinks.forEach((videoLink) => {
      // Check if the link is a YouTube link
      if (videoLink.includes("youtube.com/watch")) {
         // Extract the YouTube video ID from the link
         const videoId = videoLink.match(
            /(?:\?v=|\/embed\/|\/youtu\.be\/|\/v\/|\/e\/|\/watch\?v=)([^#\&\?]*).*/
         )[1];

         // Create a YouTube video embed tag
         const youtubeTag = `<div class="plyr__video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;

         // Replace the YouTube link in the output string with the YouTube video tag
         outputString = outputString.replace(videoLink, youtubeTag);
      } else if (videoLink.startsWith("https://ipfs.io/ipfs/")) {
         // Extract the IPFS hash from the link
         const ipfsHash = videoLink.replace("https://ipfs.io/ipfs/", "");

         // Create an IPFS video tag
         const ipfsTag = `<video class="plyr__video-embed" controls crossorigin="anonymous"><source src="https://ipfs.io/ipfs/${ipfsHash}"></video>`;

         // Replace the IPFS link in the output string with the IPFS video tag
         outputString = outputString.replace(videoLink, ipfsTag);
      } else {
         // Create a video tag for regular video links
         const videoTag = `<video class="plyr__video-embed" controls crossorigin="anonymous"><source src="${videoLink}"></video>`;

         // Replace the video link in the output string with the video tag
         outputString = outputString.replace(videoLink, videoTag);
      }
   });

   return outputString;
}

// Listen for changes in the editor's modes and update the content visibility accordingly
setInterval(toggleContentVisibility, 200);

// Function to add a product
function addProductF(field) {
   const dbRef = firebase.database().ref("stats/1/" + field);
   dbRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
   });
}

// Function to remove a product
function removeProductF(field) {
   const dbRef = firebase.database().ref("stats/1/" + field);
   dbRef.transaction((currentValue) => {
      return (currentValue || 0) - 1;
   });
}
