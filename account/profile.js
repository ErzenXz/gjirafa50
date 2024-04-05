// Get the user's profile data from the database

const db = firebase.firestore();
let dbf = firebase.database();
let UID = null;
firebase.auth().useDeviceLanguage();
let orders = [];
let ordersData = [];
firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      async function getProfileData() {
         return db.collection("users").doc(user.uid).get();
      }

      UID = user.uid;

      // Put the user's profile data in the form

      function putProfileDataInForm() {
         getProfileData().then(function (doc) {
            const data = doc.data();

            document.getElementById("username").innerText = data.username;
            document.getElementById("email").innerText = data.email;
            document.getElementById("fullname").innerText = data.fullName;
            const lastLoginTimestamp = data.lastSignInTime;
            const lastLoginDate = undefined;
            try {
               if (lastLoginTimestamp instanceof Date) {
                  lastLoginDate = lastLoginTimestamp;
               } else {
                  lastLoginDate = new Date(lastLoginTimestamp);
               }
               const dd = Intl.DateTimeFormat().format(lastLoginDate);

               document.getElementById("lastLogin").innerText = dd;
            } catch (error) {
               document.getElementById("lastLogin").innerText = "Unknown";
            }

            // Format the date to be more readable and in the user's local time

            const uid = data.uid;

            const userImage = data.photoURL;

            if (userImage) {
               document.getElementById("profileImage").src = userImage;
            } else {
               document.getElementById("profileImage").src = "../images/image1S.jpg";
            }

            document.getElementById("uid").innerText = uid;
            document.getElementById("loading").style.display = "none";
         });

         // Get the user's profile data and put it in the form
      }
      putProfileDataInForm();

      let dbf = firebase.database();
      let ref = dbf.ref("orders").orderByChild("user").equalTo(UID);

      ref.on("value", function (snapshot) {
         let data = snapshot.val();
         let orders = [];
         for (let key in data) {
            let order = data[key];
            order.id = key;
            orders.push(order);
         }

         // Display orders
         displayOrders(orders);
      });
   } else {
      console.log("User is not logged in!");
      location.href = "/account/index.html";
   }
});

async function changeUsername() {
   const user = firebase.auth().currentUser;
   const username = document.getElementById("username").innerText;
   let newUsername = prompt("Enter your new username", username);
   if (newUsername) {
      // Check if the username is already taken

      // Make sure the username is not taken
      let usernameTaken = false;
      await firebase
         .firestore()
         .collection("users")
         .where("username", "==", newUsername)
         .get()
         .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
               usernameTaken = true;
            });
         });

      if (usernameTaken) {
         toast("Username already taken!");
         return;
      }

      // Make sure the username is formatted correctly
      if (newUsername.length < 3) {
         toast("Username must be at least 3 characters long!");
         return;
      }

      if (newUsername.length > 20) {
         toast("Username must be less than 20 characters long!");
         return;
      }

      if (newUsername.includes(" ")) {
         toast("Username cannot contain spaces!");
         return;
      }

      if (newUsername.includes(".")) {
         toast("Username cannot contain periods!");
         return;
      }

      if (
         newUsername.includes("#") ||
         newUsername.includes("$") ||
         newUsername.includes("[") ||
         newUsername.includes("]")
      ) {
         toast("Username cannot contain the characters #, $, [, or ]!");
         return;
      }

      if (newUsername.includes("@")) {
         toast("Username cannot contain the @ symbol!");
         return;
      }

      // Remove all special characters from the username

      newUsername = newUsername.replace(/[^a-zA-Z0-9]/g, "");

      db.collection("users")
         .doc(user.uid)
         .update({
            username: newUsername,
         })
         .then(function () {
            toast("Username changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Username not changed");
   }
}

function changeFullName() {
   const user = firebase.auth().currentUser;
   const fullName = document.getElementById("fullname").innerText;
   const newFullName = prompt("Enter your new full name", fullName);
   if (newFullName) {
      db.collection("users")
         .doc(user.uid)
         .update({
            fullName: newFullName,
         })
         .then(function () {
            toast("Full name changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Full name not changed");
   }
}

function changePassword() {
   const user = firebase.auth().currentUser;
   const newPassword = prompt("Enter your new password");
   if (newPassword) {
      user
         .updatePassword(newPassword)
         .then(function () {
            toast("Password changed successfully!");
         })
         .catch(function (error) {
            toast(error.message);
         });
   } else {
      toast("Password not changed");
   }
}

function changeImage() {
   const user = firebase.auth().currentUser;
   const newImage = prompt("Enter the URL of your new profile image");
   if (newImage) {
      db.collection("users")
         .doc(user.uid)
         .update({
            photoURL: newImage,
         })
         .then(function () {
            toast("Profile image changed successfully!");
            putProfileDataInForm();
         });
   } else {
      toast("Image not changed");
   }
}

function deleteAccount() {
   const user = firebase.auth().currentUser;
   if (confirm("Are you sure you want to delete your account? :(")) {
      if (
         confirm("Are you sure you want to delete your account? This action cannot be undone. :(")
      ) {
         user
            .delete()
            .then(function () {
               toast("Account deleted successfully! :(", 10000);
               window.location.href = "index.html";
            })
            .catch(function (error) {
               alert(error.message);
            });
      } else {
         toast("Account not deleted :)");
      }
   } else {
      toast("Account not deleted :)");
   }
}

async function getProfileData() {
   return db.collection("users").doc(UID).get();
}

// Put the user's profile data in the form

function putProfileDataInForm() {
   getProfileData().then(function (doc) {
      const data = doc.data();

      document.getElementById("username").innerText = data.username;
      document.getElementById("email").innerText = data.email;
      document.getElementById("fullname").innerText = data.fullName;
      const lastLoginTimestamp = data.lastSignInTime;
      const lastLoginDate = undefined;
      try {
         if (lastLoginTimestamp instanceof Date) {
            lastLoginDate = lastLoginTimestamp;
         } else {
            lastLoginDate = new Date(lastLoginTimestamp);
         }
         const dd = Intl.DateTimeFormat().format(lastLoginDate);

         document.getElementById("lastLogin").innerText = dd;
      } catch (error) {
         document.getElementById("lastLogin").innerText = "Unknown";
      }

      // Format the date to be more readable and in the user's local time

      const uid = data.uid;

      const userImage = data.photoURL;

      if (userImage) {
         document.getElementById("profileImage").src = userImage;
      } else {
         document.getElementById("profileImage").src = "../images/image1S.jpg";
      }

      document.getElementById("uid").innerText = uid;
   });

   // Get the user's profile data and put it in the form
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

function logOut() {
   let conf = confirm("Are you sure you want to log out?");

   if (!conf) {
      return;
   }

   toast("Logging out...");
   firebase
      .auth()
      .signOut()
      .then(() => {
         window.location.href = "./account/index.html";
      })
      .catch((error) => {
         toast(error.message);
      });
}

function displayOrders(orders) {
   let ordersTable = document.getElementById("ordersTable");
   ordersTable.innerHTML = "";

   orders.forEach(function (order) {
      let tr = document.createElement("tr");

      let orderDate = new Date(order.time);
      let dd = Intl.DateTimeFormat(undefined).format(orderDate);

      tr.innerHTML = `
        <td>${order.status}</td>
            <td>${order.id}</td>
            <td>${order.address} ${order.city}</td>
            <td>${dd}</td>
            <td>
                <button onclick="viewOrder('${order.id}','${order.status}')" class="btn btn-primary">View</button>
                <button onclick="printOrder('${order.id}')" class="btn btn-danger">Print</button>
            </td>
        `;
      ordersTable.appendChild(tr);
   });
}

function viewOrder(orderID, status) {
   let modal = document.createElement("div");

   let cancelOrderBTN = `<button class="btn btn-primary" onclick="cancelOrder('${orderID}')">Cancel</button>`;

   let refundOrderBTN = `<button class="btn btn-secondary" onclick="refundOrder('${orderID}')">Refund</button>`;

   if (
      status === "Cancelled" ||
      status === "Refunded" ||
      status === "Requesting Refund" ||
      status === "Completed"
   ) {
      cancelOrderBTN = "";
   }

   if (
      status === "Requesting Refund" ||
      status === "Refunded" ||
      status === "review" ||
      status === "Cancelled"
   ) {
      refundOrderBTN = "";
   }

   let th = `<th>Actions</th>`;

   if (cancelOrderBTN === "" && refundOrderBTN === "") {
      th = "";
   }

   modal.className = "modal2";
   modal.innerHTML = `
        <div class="modal-content2">
            <p class="closeB" onclick="closeModal()">&times;</p>
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> <span id="orderID"></span></p>
            <p><strong>Status:</strong> <span id="orderStatus"></span></p>
            <p><strong>Address:</strong> <span id="orderAddress"></span></p>
            <p><strong>Phone:</strong> <span id="orderPhone"></span></p>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        ${th}
                    </tr>
                </thead>
                <tbody id="orderItemsTable"></tbody>
            </table>

            <div class="actions">
                  ${cancelOrderBTN}
                  ${refundOrderBTN}
            </div>
        </div>
    `;

   document.body.appendChild(modal);

   // Get order from orders collection
   let orderRef = dbf.ref("orders/" + orderID);
   orderRef.once("value", function (snapshot) {
      let order = snapshot.val();
      document.getElementById("orderID").textContent = orderID;
      document.getElementById("orderStatus").textContent = order.status;
      document.getElementById("orderAddress").textContent = order.address;
      document.getElementById("orderPhone").textContent = order.phone;
   });

   // Get order items from orderItems collection
   let orderItemsRef = dbf.ref("orderItems/" + orderID);
   orderItemsRef.once("value", function (snapshot) {
      let orderItems = snapshot.val();
      let orderItemsTable = document.getElementById("orderItemsTable");

      orderItemsTable.innerHTML = "";
      orderItems.forEach(function (item) {
         let likeProductButton = `<button class="btn btn-primary" onclick="likeProduct('${item.product}')">Like Product</button>`;
         let dislikeProductButton = `<button class="btn btn-danger" onclick="dislikeProduct('${item.product}')">Dislike Product</button>`;
         let combined = `<td>
         ${likeProductButton}
         ${dislikeProductButton}
         </td>`;

         if (status !== "Completed") {
            likeProductButton = "";
            dislikeProductButton = "";
            combined = "";
         }
         let tr = document.createElement("tr");
         tr.innerHTML = `
                <td><a target="_blank" href="${location.origin}/product.html?product=${
            item.product
         }">View ${item.product}</a></td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td>${item.price * item.quantity}</td>
                  ${combined}
                `;
         orderItemsTable.appendChild(tr);
      });
   });
}

function cancelOrder(orderID) {
   let orderRef = dbf.ref("orders/" + orderID);
   orderRef.update({
      status: "Cancelled",
   });
   toast("Porosia u anulua me sukses!");
}

function refundOrder(orderID) {
   let orderRef = dbf.ref("orders/" + orderID);
   orderRef.update({
      status: "Requesting Refund",
   });
   toast("Porosia u dergua per rimbursim!");
}

function closeModal() {
   document.querySelector(".modal2").remove();
}

function likeProduct(productID) {
   let productRef = dbf.ref("products/" + productID);
   productRef.once("value", function (snapshot) {
      let product = snapshot.val();
      let likes = product?.likes ?? 0;
      likes++;
      productRef.update({
         likes: likes,
      });
      toast("Produkti u pelqye me sukses!");
   });
}

function dislikeProduct(productID) {
   let productRef = dbf.ref("products/" + productID);
   productRef.once("value", function (snapshot) {
      let product = snapshot.val();
      let likes = product?.dislikes ?? 0;
      likes++;
      productRef.update({
         dislikes: likes,
      });
      toast("Produkti u shenua me sukses!");
   });
}

function printOrder(orderID) {
   let orderRef = dbf.ref("orders/" + orderID);
   orderRef.once("value", function (snapshot) {
      let order = snapshot.val();
      let orderItemsRef = dbf.ref("orderItems/" + orderID);
      let totalPrice = 0;
      orderItemsRef.once("value", function (snapshot) {
         let orderItems = snapshot.val();
         let orderItemsTable = "";
         orderItems.forEach(function (item) {
            orderItemsTable += `
                <tr>
                    <td>${item.product}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price * item.quantity}</td>
                </tr>
            `;
            totalPrice += item.price * item.quantity;
         });

         let printWindow = window.open("", "Print", "height=600,width=800");
         printWindow.document.write(`
            <html>
                <head>
                    <title>Order ${orderID}</title>
                    <style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            border: 1px solid black;
                            padding: 0.5rem;
                        }
                    </style>
                </head>
                <body>
                    <h1>Order ${orderID}</h1>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Address:</strong> ${order.address} ${order.city} ,${order.zip}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItemsTable}
                        </tbody>
                    </table>
                     <p><strong>Total Price:</strong> ${totalPrice}</p>

                     <p><strong>Order Date:</strong> ${order.time}</p>

                     <p>Faleminderit qe zgjodhet te blini nga ne!</p>

                     <p>Per cdo pyetje ose problem, na kontaktoni ne numrin +383 44 960 266</p>

                     <h1>Trendy Online Shop</h1>

                </body>
            </html>
        `);
         printWindow.document.close();
         printWindow.print();
         printWindow.close();

         // // Download the order as a PDF
         // let pdf = new jsPDF();
         // pdf.text(`Order ${orderID}`, 10, 10);
         // pdf.text(`Status: ${order.status}`, 10, 20);
         // pdf.text(`Address: ${order.address} ${order.city} ,${order.zip}`, 10, 30);
         // pdf.text(`Phone: ${order.phone}`, 10, 40);
         // pdf.autoTable({
         //    head: [["Name", "Price", "Quantity", "Total"]],
         //    body: orderItems.map((item) => [
         //       item.product,
         //       item.price,
         //       item.quantity,
         //       item.price * item.quantity,
         //    ]),
         // });
         // pdf.text(`Total Price: ${totalPrice}`, 10, 50);
         // pdf.text(
         //    `Order Date: ${Intl.DateTimeFormat(undefined).format(
         //       new Date(order.date).toLocaleDateString()
         //    )}`,
         //    10,
         //    60
         // );
         // pdf.text("Faleminderit qe zgjodhet te blini nga ne!", 10, 70);
         // pdf.text("Per cdo pyetje ose problem, na kontaktoni ne numrin +383 44 960 266", 10, 80);
         // pdf.text("Adresa jone:", 10, 90);
         // pdf.text("Str. 'Rexhep Luci' nr. 2, Prishtine", 10, 100);
         // pdf.text("Prishtine, Kosove", 10, 110);
         // pdf.text("10000", 10, 120);

         // pdf.save(`Order-${orderID}.pdf`);
      });
   });
}
