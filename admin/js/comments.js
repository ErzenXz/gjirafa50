firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

    } else {
        // No user is signed in.
        window.location.href = "login.html";
    }
});


// Get the modal element
var modal = document.getElementById('editModal');

// Get the close button for the modal
var closeBtn = document.getElementsByClassName('close')[0];

// Get the form for editing comments
var editForm = document.getElementById('editForm');
var editNameInput = document.getElementById('editName');
var editCommentInput = document.getElementById('editComment');
var editImageInput = document.getElementById('editImage');

// Variables to store the postId and commentId for editing
var editPostId = '';
var editCommentId = '';

// Function to open the modal for editing the comment
function openEditModal(postId, commentId, name, comment, image) {
    editPostId = postId;
    editCommentId = commentId;

    editNameInput.value = name;
    editCommentInput.value = comment;
    editImageInput.value = image;

    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Event listener for the close button
closeBtn.addEventListener('click', closeModal);

// Event listener for form submission to update the comment
editForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the updated values from the form inputs
    var updatedName = editNameInput.value;
    var updatedComment = editCommentInput.value;
    var updatedImage = editImageInput.value;

    // Call the updateComment function to update the comment
    updateComment(editPostId, editCommentId, updatedName, updatedComment, updatedImage);

    // Close the modal after updating the comment
    closeModal();
});



function getPostIds() {
    var postIdsRef = firebase.database().ref('comments');

    postIdsRef.on('value', function (snapshot) {
        var postIds = snapshot.val();
        var postIdsList = document.getElementById('post-ids');
        // Clear the existing postIds list
        postIdsList.innerHTML = '';

        if (postIds) {
            // Iterate over each postId and display it
            for (var postId in postIds) {
                var postIdElement = document.createElement('li');
                postIdElement.textContent = postId;

                postIdElement.addEventListener('click', function () {
                    // Retrieve comments for the selected postId
                    var selectedPostId = this.textContent;
                    getCommentsByPostId(selectedPostId);
                });

                // Append the postId element to the list
                postIdsList.appendChild(postIdElement);
            }
        } else {
            console.log('No post IDs found.');
        }
    }, function (error) {
        console.log('Error retrieving post IDs:', error);
    });
}

function getCommentsByPostId(postId) {
    var commentsRef = firebase.database().ref('comments/' + postId);

    commentsRef.on('value', function (snapshot) {
        var comments = snapshot.val();
        var commentsContainer = document.getElementById('comments-container');

        // Clear the existing comments on the page
        commentsContainer.innerHTML = '';

        if (comments) {
            // Iterate over each comment and display it
            for (var commentId in comments) {
                var commentData = comments[commentId];
                var commentElement = document.createElement('div');
                commentElement.classList.add('comment');

                console.log(commentData);
                var commentImage = '';
                if (commentData.image) {
                    commentImage = `<img width="35px" height="35px" src="${commentData.image}" alt="${commentData.image}">`;
                }
                let buttons = document.createElement('div');
                buttons.classList.add('buttons');

                commentElement.innerHTML = `
                    <div class="comment-image">
                        ${commentImage} <strong>${commentData.name}</strong>
                    </div>
                    <div class="comment-content">
                        <p>${commentData.comment}</p>
                    </div>
                `;


                var editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', function (postId, commentId, name, comment, image) {
                    return function () {
                        // Open modal for editing the comment
                        openEditModal(postId, commentId, name, comment, image);
                    };
                }(postId, commentId, commentData.name, commentData.comment, commentData.image));


                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';

                deleteButton.addEventListener('click', function (postId, commentId) {

                    return function () {
                        // Open modal for editing the comment
                        console.log('Deleting comment:', postId + "/" + commentId)
                        if (confirm("Are you sure you want to delete this comment?")) {

                            deleteComment(postId, commentId);
                        }
                    };

                }(postId, commentId, commentData.name, commentData.comment, commentData.image));


                buttons.appendChild(editButton);
                buttons.appendChild(deleteButton);
                commentElement.appendChild(buttons);

                commentsContainer.appendChild(commentElement);
            }
        } else {
            toast('No comments found for the postId:', postId);
        }
    }, function (error) {
        toast('Error retrieving comments:', error);
    });
}

function updateComment(postId, commentId, updatedName, updatedComment, updatedImage) {
    var commentRef = firebase.database().ref('comments/' + postId + '/' + commentId);
    // Update the comment data in the database
    commentRef.update({
        name: updatedName,
        comment: updatedComment,
        image: updatedImage
    })
        .then(function () {
            toast('Comment updated successfully!');
        })
        .catch(function (error) {
            toast('Error updating comment:', error);
        });
}


function deleteComment(postId, commentId) {
    var commentRef = firebase.database().ref('comments/' + postId + '/' + commentId);

    // Remove the comment from the database
    commentRef.remove()
        .then(function () {
            toast('Comment deleted successfully!');
            decreaseComment();
        })
        .catch(function (error) {
            toast('Error deleting comment:', error);
        });
}


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

function decreaseComment() {
    let blogRef = firebase.firestore().collection("stats").doc("1");

    // Use Firestore's FieldValue.increment() with a negative value to decrement the view count
    blogRef.update({
        comments: firebase.firestore.FieldValue.increment(-1)
    })
        .then(function () {
            console.log("View count decremented successfully!");
        })
        .catch(function (error) {
            console.error("Error decrementing view count: ", error);
        });
}



// Calling function

getPostIds();