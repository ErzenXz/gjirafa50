firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

    } else {
        // No user is signed in.
        window.location.href = "login.html";
    }
});



const db = firebase.firestore();
let firestore = firebase.firestore();
const postsRef = db.collection('posts');

let limit = 10;
let lastVisible = null;

// Fetch and display initial posts
function fetchInitialPosts() {
    postsRef.orderBy('date', "desc").limit(limit).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                post.id = doc.id;
                // Display the post on your webpage
                displayPost(post);
                lastVisible = doc;
            });

            if (querySnapshot.size < limit) {
                // All posts have been loaded
                document.getElementById("loadMoreButton").classList.add("hidden");
            } else {
                document.getElementById("loadMoreButton").classList.remove("hidden");
            }
        })
        .catch((error) => {
            console.log('Error getting initial posts: ', error);
        });
}

// Fetch and display more posts
function fetchMorePosts(lastTimestamp) {
    postsRef.orderBy('date', 'desc').startAfter(lastVisible).limit(limit).get()
        .then((querySnapshot) => {

            querySnapshot.forEach((doc) => {
                const post = doc.data();
                post.id = doc.id;
                // Display the post on your webpage
                displayPost(post);
                lastVisible = doc;
            });

            if (querySnapshot.size < limit) {
                // All posts have been loaded
                document.getElementById("loadMoreButton").classList.add("hidden");
            }
        })
        .catch((error) => {
            console.log('Error getting more posts: ', error);
        });
}

// Display a post
function displayPost(post) {
    // Create HTML elements to represent the post
    const postContainer = document.createElement('div');
    postContainer.classList.add('post');


    let div2 = document.createElement('div');
    div2.classList.add('post-left');

    let div3 = document.createElement('div');
    div3.classList.add('post-right');


    const titleElement = document.createElement('h2');
    titleElement.textContent = post.title;

    const contentElement = document.createElement('p');
    contentElement.textContent = post.titleMINI;

    const imageElement = document.createElement('img');
    imageElement.src = post.image;
    imageElement.alt = 'Post Image';

    const timestampElement = document.createElement('p');
    timestampElement.textContent = `Posted on ${new Date(post.date).toLocaleDateString()}`;

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        editPost(post.id);
    });

    const viewButton = document.createElement('button');
    viewButton.textContent = 'View';
    viewButton.addEventListener('click', () => {
        viewPost(post.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        deletePost(post.id);
    });

    // Add CSS classes to the elements
    postContainer.classList.add('post');
    titleElement.classList.add('post-title');
    contentElement.classList.add('post-content');
    imageElement.classList.add('post-image');
    timestampElement.classList.add('post-timestamp');
    editButton.classList.add('post-button');
    viewButton.classList.add('post-button');
    deleteButton.classList.add('post-button');

    // Append the elements to the post container

    div2.appendChild(imageElement);

    div3.appendChild(titleElement);
    div3.appendChild(contentElement);
    div3.appendChild(timestampElement);
    div3.appendChild(editButton);
    div3.appendChild(viewButton);
    div3.appendChild(deleteButton);


    postContainer.appendChild(div2);
    postContainer.appendChild(div3);


    // Append the post container to your webpage
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.appendChild(postContainer);
}




// Edit a post
function editPost(postId) {
    const postRef = firestore.collection('posts').doc(postId);

    // Retrieve the post from Firestore
    postRef.get()
        .then((doc) => {
            if (doc.exists) {
                const post = doc.data();
                // Create a popup/modal to edit the post
                const popup = document.createElement('div');
                popup.classList.add('popup');

                const titleLabel = document.createElement('label');
                titleLabel.textContent = 'Title:';
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.value = post.title;

                const dateLabel = document.createElement('label');
                dateLabel.textContent = 'Date:';
                const dateInput = document.createElement('input');
                dateInput.type = 'datetime-local';
                dateInput.valueAsNumber = post.date;

                const descriptionLabel = document.createElement('label');
                descriptionLabel.textContent = 'Description:';
                const descriptionTextarea = document.createElement('textarea');
                descriptionTextarea.value = post.description;
                descriptionTextarea.rows = 10;


                const imageLabel = document.createElement('label');
                imageLabel.textContent = 'Image URL:';
                const imageInput = document.createElement('input');
                imageInput.type = 'text';
                imageInput.value = post.image;

                const likesLabel = document.createElement('label');
                likesLabel.textContent = 'Likes:';
                const likesInput = document.createElement('input');
                likesInput.type = 'number';
                likesInput.value = post.likes;

                const sharesLabel = document.createElement('label');
                sharesLabel.textContent = 'Shares:';
                const sharesInput = document.createElement('input');
                sharesInput.type = 'number';
                sharesInput.value = post.shares;

                const tagsLabel = document.createElement('label');
                tagsLabel.textContent = 'Tags:';
                const tagsInput = document.createElement('input');
                tagsInput.type = 'text';
                tagsInput.value = post.tags.join(', ');

                const viewsLabel = document.createElement('label');
                viewsLabel.textContent = 'Views:';
                const viewsInput = document.createElement('input');
                viewsInput.type = 'number';
                viewsInput.value = post.views;

                const saveButton = document.createElement('button');
                saveButton.textContent = 'Save';

                saveButton.addEventListener('click', () => {
                    const updatedPost = {
                        title: titleInput.value,
                        date: dateInput.valueAsNumber,
                        description: descriptionTextarea.value,
                        image: imageInput.value,
                        likes: parseInt(likesInput.value),
                        shares: parseInt(sharesInput.value),
                        tags: tagsInput.value.split(',').map((tag) => tag.trim()),
                        views: parseInt(viewsInput.value),
                    };

                    postRef.update(updatedPost)
                        .then(() => {
                            toast(`Post (${postId}) was updated successfully`);
                            // Close the popup/modal
                            document.body.removeChild(popup);
                            // Update the webpage to reflect the changes
                            // Example: Reload the posts or update the specific post element
                        })
                        .catch((error) => {
                            toast('Error updating post: ', error);
                        });
                });

                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close';
                closeButton.addEventListener('click', () => {
                    // Close the popup/modal
                    document.body.removeChild(popup);
                });

                popup.appendChild(titleLabel);
                popup.appendChild(titleInput);
                popup.appendChild(dateLabel);
                popup.appendChild(dateInput);
                popup.appendChild(descriptionLabel);
                popup.appendChild(descriptionTextarea);
                popup.appendChild(imageLabel);
                popup.appendChild(imageInput);
                popup.appendChild(likesLabel);
                popup.appendChild(likesInput);
                popup.appendChild(sharesLabel);
                popup.appendChild(sharesInput);
                popup.appendChild(tagsLabel);
                popup.appendChild(tagsInput);
                popup.appendChild(viewsLabel);
                popup.appendChild(viewsInput);
                popup.appendChild(saveButton);
                popup.appendChild(closeButton);


                document.body.appendChild(popup);
            } else {
                toast('Post was not found, please try again');
            }
        })
        .catch((error) => {
            toast('Error retrieving post: ', error);
        });
}



// View a post
function viewPost(postId) {
    // Redirect the user to the post page
    toast(`Redirecting to ${postId} post...`);
    let a = document.createElement('a');
    a.href = location.origin + '?/post/' + postId;
    a.target = '_blank';
    a.click();
}

// Delete a post
function deletePost(postId) {
    toast(`Deleting ${postId} post...`);
    const postRef = firestore.collection('posts').doc(postId);
    // Delete the post from Firestore
    postRef.delete()
        .then(() => {
            toast('Post deleted successfully');
            // Update the webpage to remove the deleted post
            // Example: Remove the specific post element from the DOM
            decreasePosts();
        })
        .catch((error) => {
            toast('Error deleting post: ', error);
        });
}

function decreasePosts() {
    let blogRef = firebase.firestore().collection("stats").doc("1");

    // Use Firestore's FieldValue.increment() with a negative value to decrement the view count
    blogRef.update({
        posts: firebase.firestore.FieldValue.increment(-1)
    })
        .then(function () {
            console.log("View count decremented successfully!");
        })
        .catch(function (error) {
            console.error("Error decrementing view count: ", error);
        });
}

// Real-time listener for new posts
// postsRef.orderBy('date').limit(1).onSnapshot((snapshot) => {
//     snapshot.docChanges().forEach((change) => {
//         if (change.type === 'added') {
//             const post = change.doc.data();
//             // Display the new post on your webpage in real-time
//             displayPost(post);
//         }
//     });
// });

// Fetch initial posts when the page loads
fetchInitialPosts();




// Button event listener to load more posts
const loadMoreButton = document.getElementById('loadMoreButton');
loadMoreButton.addEventListener('click', fetchMorePosts);


function toast(message, duration = 4500, delay = 0) {

    // Check for existing toast class elements

    const existingToast = document.querySelector('.toast5');

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
    toastContainer.setAttribute('class', 'toast5');

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



