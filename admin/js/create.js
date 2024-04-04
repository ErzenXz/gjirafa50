
// Check if the user is logged in!

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

    } else {
        // No user is signed in.
        window.location.href = "login.html";
    }
});



// Initialize Cloud Firestore
const db = firebase.firestore();

// Adding a post

function addPost() {
    toast("Adding a post");
    let title = document.getElementById("postTitle").value;
    let titleMINI = document.getElementById("postSlug").value;
    let post = simplemde.value();
    let tags = document.getElementById("postTags").value;
    let img = document.getElementById("postImage").value;

    if (title == "" || post == "" || tags == "") {
        toast("Please fill all the fields!");
        return false
    };


    var words = tags.split(/\s+/).filter(function (word) {
        return word.trim() !== '';
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


    let date = new Date();
    let tagsA = words;

    if (img == "") {
        img = "./images/placeholder.svg";
    }

    const searchIndex = tokenizeSearchableText(title);


    db.collection("posts").add({
        title,
        titleMINI,
        description: post,
        tags: tagsA,
        dateF: date,
        date: date.getTime(),
        image: img,
        likes: 0,
        views: 0,
        shares: 0,
        searchIndex
    })
        .then((docRef) => {

            toast("Post written with ID: ", docRef.id);

            document.getElementById("postTitle").value = "";
            document.getElementById("postSlug").value = "";
            document.getElementById("postTags").value = "";
            document.getElementById("postImage").value = "";
            simplemde.value("");

            document.getElementById("url").innerHTML = `<a href="${location.origin}?/post/${docRef.id}" target="_blank">View Post</a>`;

            let blogRef = firebase.firestore().collection("stats").doc("1");
            blogRef.get().then(function (doc) {
                if (doc.exists) {
                    let posts = doc.data().posts;
                    posts++;
                    blogRef.update({
                        posts: posts
                    })
                }
            });


        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            toast("An error has happend!  : " + error);
        });

}



function countWords(str) {
    // Remove leading and trailing whitespaces
    str = str.trim();

    // If the string is empty, return 0
    if (str === '') {
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
    spellChecker: false
});


// Add an event listener for the 'input' event

simplemde.codemirror.on('change', handleTextareaInput);


// Event handler function
function handleTextareaInput(event) {
    // Get the value of the textarea
    const text = simplemde.value();

    // Perform any desired actions with the text
    document.getElementById("stats").innerHTML = "Time to read: " + calculateReadingTime(text);
}

function toast(message, duration = 4500, delay = 0) {

    // Check for existing toast class elements

    const existingToast = document.querySelector('.toast');

    if (existingToast) {
        existingToast.remove();
    }


    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '1rem';
    toastContainer.style.right = '1rem';
    toastContainer.style.display = 'flex';
    toastContainer.style.alignItems = 'center';
    toastContainer.style.justifyContent = 'center';
    toastContainer.style.width = '16rem';
    toastContainer.style.padding = '1rem';
    toastContainer.style.backgroundColor = '#1F2937';
    toastContainer.style.color = '#FFF';
    toastContainer.style.borderRadius = '0.25rem';
    toastContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
    toastContainer.style.overflow = 'auto';
    toastContainer.style.maxHeight = '500px';
    toastContainer.style.minWidth = '200px';
    toastContainer.style.width = 'fit-content';
    toastContainer.style.zIndex = '9999';
    toastContainer.setAttribute('class', 'toast');

    const toastText = document.createElement('span');
    toastText.style.whiteSpace = 'nowrap';
    toastText.style.overflow = 'hidden';
    toastText.style.textOverflow = 'ellipsis';
    toastText.textContent = message;
    toastContainer.appendChild(toastText);

    document.body.appendChild(toastContainer);

    setTimeout(() => {
        toastContainer.style.opacity = '0';
        setTimeout(() => {
            toastContainer.remove();
        }, 300);
    }, duration + delay);

    toast.dismiss = function () {
        toastContainer.style.opacity = '0';
        setTimeout(() => {
            toastContainer.remove();
        }, 300);
    };
}



// Function to toggle the visibility of the content container based on the editor's modes
function toggleContentVisibility() {
    if (simplemde.isSideBySideActive() || simplemde.isFullscreenActive()) {
        document.getElementById("sidebar").classList.add('hidden');
        document.getElementById("nav").classList.add('hidden');
        document.getElementById("others").classList.add('hidden');
    } else {
        document.getElementById("sidebar").classList.remove('hidden');
        document.getElementById("nav").classList.remove('hidden');
        document.getElementById("others").classList.remove('hidden');
    }
}

function tokenizeSearchableText(text) {
    return text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
}

// function createVideoTagsFromString(inputString) {
//     // Regular expression to match video links
//     const videoRegex = /(https?:\/\/[^\s]+?\.(mp4|webm))|ipfs:\/\/[^\s]+/gi;

//     // Find all video links in the input string
//     const videoLinks = inputString.match(videoRegex);

//     if (!videoLinks) {
//         console.log('No video links found.');
//         return inputString;
//     }

//     let outputString = inputString;

//     // Iterate through the video links
//     videoLinks.forEach((videoLink) => {
//         // Create a video tag for each video link
//         const videoTag = `<video class="plyr__video-embed" controls crossorigin="anonymous"><source src="${videoLink}"></video>`;

//         // Replace the video link in the output string with the video tag
//         outputString = outputString.replace(videoLink, videoTag);
//     });

//     return outputString;
// }

// function createVideoTagsFromString(inputString) {
//     // Regular expression to match video links (including IPFS)
//     const videoRegex = /(https?:\/\/[^\s]+?\.(mp4|webm))|(https?:\/\/ipfs\.io\/ipfs\/[^\s]+)/gi;

//     // Find all video links in the input string
//     const videoLinks = inputString.match(videoRegex);

//     if (!videoLinks) {
//         console.log('No video links found.');
//         return inputString;
//     }

//     let outputString = inputString;

//     // Iterate through the video links
//     videoLinks.forEach((videoLink) => {
//         // Check if the link is an IPFS link
//         if (videoLink.startsWith('https://ipfs.io/ipfs/')) {
//             // Extract the IPFS hash from the link
//             const ipfsHash = videoLink.replace('https://ipfs.io/ipfs/', '');

//             // Create an IPFS video tag
//             const ipfsTag = `<video class="plyr__video-embed" controls crossorigin="anonymous"><source src="https://ipfs.io/ipfs/${ipfsHash}"></video>`;

//             // Replace the IPFS link in the output string with the IPFS video tag
//             outputString = outputString.replace(videoLink, ipfsTag);
//         } else {
//             // Create a video tag for regular video links
//             const videoTag = `<video class="plyr__video-embed" controls crossorigin="anonymous"><source src="${videoLink}"></video>`;

//             // Replace the video link in the output string with the video tag
//             outputString = outputString.replace(videoLink, videoTag);
//         }
//     });

//     return outputString;
// }

function createVideoTagsFromString(inputString) {
    // Regular expression to match video links (including YouTube and IPFS)
    const videoRegex = /(https?:\/\/[^\s]+?\.(mp4|webm))|(https?:\/\/ipfs\.io\/ipfs\/[^\s]+)|(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^\s&]+))/gi;

    // Find all video links in the input string
    const videoLinks = inputString.match(videoRegex);

    if (!videoLinks) {
        console.log('No video links found.');
        return inputString;
    }

    let outputString = inputString;

    // Iterate through the video links
    videoLinks.forEach((videoLink) => {
        // Check if the link is a YouTube link
        if (videoLink.includes('youtube.com/watch')) {
            // Extract the YouTube video ID from the link
            const videoId = videoLink.match(/(?:\?v=|\/embed\/|\/youtu\.be\/|\/v\/|\/e\/|\/watch\?v=)([^#\&\?]*).*/)[1];

            // Create a YouTube video embed tag
            const youtubeTag = `<div class="plyr__video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;

            // Replace the YouTube link in the output string with the YouTube video tag
            outputString = outputString.replace(videoLink, youtubeTag);
        } else if (videoLink.startsWith('https://ipfs.io/ipfs/')) {
            // Extract the IPFS hash from the link
            const ipfsHash = videoLink.replace('https://ipfs.io/ipfs/', '');

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
