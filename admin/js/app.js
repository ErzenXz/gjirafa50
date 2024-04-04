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
   const dbRef = firebase.database().ref("stats/1");

   dbRef.on(
      "value",
      (snapshot) => {
         const data = snapshot.val();
         if (data) {
            document.getElementById("postsN").innerText = data.products;
            document.getElementById("commentsN").innerText = data.activeOrders;
            document.getElementById("sharesN").innerText = data.totalOrders;
            document.getElementById("visitsN").innerText = data.visits;
         } else {
            console.log("Error: No such document!");
         }
      },
      (error) => {
         console.log("Error getting data:", error);
      }
   );
}

// Function to add a product
function addProduct(field) {
   const dbRef = firebase.database().ref("stats/1/" + field);
   dbRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
   });
}

// Function to remove a product
function removeProduct(field) {
   const dbRef = firebase.database().ref("stats/1/" + field);
   dbRef.transaction((currentValue) => {
      return (currentValue || 0) - 1;
   });
}

function getPostsAndMakeGraph(n) {
   const db = firebase.database();
   const ref = db.ref("products");

   // Calculate the timestamp for 'n' days ago
   const nDaysAgoTimestamp = Date.now() - n * 24 * 60 * 60 * 1000;

   // Query the Realtime Database to get posts within the specified timeframe
   ref.orderByChild("time")
      .startAt(nDaysAgoTimestamp)
      .once("value")
      .then((snapshot) => {
         const data = [];

         snapshot.forEach((childSnapshot) => {
            const postData = childSnapshot.val();
            const key = childSnapshot.key;

            document.getElementById(
               "postsData"
            ).innerHTML += `<li class="list-group-item"><a target="_blank" href="${location.origin}/product.html?product=${key}">${postData.name}</a></li>`;

            const date = new Date(postData.time);
            const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            data.push(dateWithoutTime);
         });

         const counts = {};
         data.forEach((date) => {
            const dateString = date.toISOString().split("T")[0];
            counts[dateString] = (counts[dateString] || 0) + 1;
         });

         const dates = Object.keys(counts);
         const postCounts = Object.values(counts);

         const ctx = document.getElementById("areaChart").getContext("2d");
         new Chart(ctx, {
            type: "line",
            data: {
               labels: dates,
               datasets: [
                  {
                     label: "Posts per Day",
                     data: postCounts,
                     backgroundColor: "rgba(0, 123, 255, 0.5)",
                     borderColor: "rgba(0, 123, 255, 1)",
                     borderWidth: 1,
                  },
               ],
            },
            options: {
               responsive: true,
               scales: {
                  x: {
                     display: true,
                     title: {
                        display: true,
                        text: "Date",
                     },
                  },
                  y: {
                     display: true,
                     title: {
                        display: true,
                        text: "Number of Posts",
                     },
                  },
               },
            },
         });
      })
      .catch((error) => {
         console.log("Error getting posts:", error);
      });
}

// Calling functions

getStats();
getPostsAndMakeGraph(30);
