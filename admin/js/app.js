
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

    } else {
        // No user is signed in.
        window.location.href = "login.html";
    }
});


// Function to get the stats from the database

function getStats() {
    const db = firebase.firestore();

    // Assuming you have a collection called 'stats' and a document with an ID of 'your_document_id'
    const docRef = db.collection('stats').doc('1');

    docRef.get()
        .then((doc) => {
            if (doc.exists) {
                // Access the data within the document
                const data = doc.data();
                document.getElementById('postsN').innerText = data.posts;
                document.getElementById('commentsN').innerText = data.comments;
                document.getElementById('sharesN').innerText = data.shares;
                document.getElementById('visitsN').innerText = data.visits;
                document.getElementById('errors404').innerText = data.errors_404;
            } else {
                console.log('Error: No such document!');
            }
        })
        .catch((error) => {
            console.log('Error getting document:', error);
        });
}



function getPostsAndMakeGraph(n) {
    const db = firebase.firestore();
    const collectionRef = db.collection('posts');

    // Calculate the timestamp for 'n' days ago
    const nDaysAgoTimestamp = Date.now() - (n * 24 * 60 * 60 * 1000);

    // Query the Firestore collection to get posts within the specified timeframe
    const query = collectionRef.where('date', '>', nDaysAgoTimestamp);

    query.get()
        .then((querySnapshot) => {
            const data = [];

            // Iterate through each document in the query snapshot
            querySnapshot.forEach((doc) => {

                const postData = doc.data();
                // Assuming you have a 'publishedData' field in each post document
                const publishedData = postData.date;

                let key = doc.id;

                document.getElementById('postsData').innerHTML += `<li class="list-group-item"><a target="_blank" href="${location.origin}/?/post/${key}">${postData.title}</a></li>`;

                // Convert the UNIX timestamp to JavaScript Date object
                const date = new Date(publishedData);

                // Extract the date part (without time) to group posts per day
                const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                // Add the date to the data array
                data.push(dateWithoutTime);
            });

            // Group the dates and count the number of posts per day
            const counts = {};
            data.forEach((date) => {
                const dateString = date.toISOString().split('T')[0];
                counts[dateString] = (counts[dateString] || 0) + 1;
            });

            // Extract the dates and counts as separate arrays
            const dates = Object.keys(counts);
            const postCounts = Object.values(counts);

            // Create the line graph using Chart.js
            const ctx = document.getElementById('areaChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Posts per Day',
                        data: postCounts,
                        backgroundColor: 'rgba(0, 123, 255, 0.5)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Number of Posts'
                            }
                        }
                    }
                }
            });
        })
        .catch((error) => {
            console.log('Error getting documents:', error);
        });
}



// Calling functions

getStats();
getPostsAndMakeGraph(30);