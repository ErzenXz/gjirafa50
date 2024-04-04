let userID = "";

firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      // User is signed in.
      userID = user.uid;
   } else {
      // No user is signed in.
      window.location.href = "login.html";
   }
});

// Get all orders from Realtime Database

let db = firebase.database();
let ref = db.ref("orders");

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

function displayOrders(orders) {
   let ordersTable = document.getElementById("ordersTable");
   ordersTable.innerHTML = "";

   orders.forEach(function (order) {
      let tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${order.status}</td>
            <td>${order.id}</td>
            <td>${order.address}</td>
            <td>${order.phone}</td>
            <td>
                <button onclick="viewOrder('${order.id}')" class="btn btn-primary">View</button>
                <button onclick="deleteOrder('${order.id}')" class="btn btn-danger">Delete</button>
            </td>
        `;
      ordersTable.appendChild(tr);
   });
}

function viewOrder(orderID) {
   let modal = document.createElement("div");
   modal.className = "modal";
   modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
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
                    </tr>
                </thead>
                <tbody id="orderItemsTable"></tbody>
            </table>

            <div class="actions">
            <button class="btn btn-primary" onclick="approveOrder('${orderID}')">Approve</button>
            <button class="btn btn-danger" onclick="rejectOrder('${orderID}')">Reject</button>
            <button class="btn btn-secondary" onclick="refundOrder('${orderID}')">Refund</button>
            <button class="btn btn-secondary" onclick="completeOrder('${orderID}')">Order Completed</button>
            </div>
        </div>
    `;

   document.body.appendChild(modal);

   // Get order from orders collection
   let orderRef = db.ref("orders/" + orderID);
   orderRef.once("value", function (snapshot) {
      let order = snapshot.val();
      document.getElementById("orderID").textContent = orderID;
      document.getElementById("orderStatus").textContent = order.status;
      document.getElementById("orderAddress").textContent = order.address;
      document.getElementById("orderPhone").textContent = order.phone;
   });

   // Get order items from orderItems collection
   let orderItemsRef = db.ref("orderItems/" + orderID);
   orderItemsRef.once("value", function (snapshot) {
      let orderItems = snapshot.val();
      let orderItemsTable = document.getElementById("orderItemsTable");
      orderItemsTable.innerHTML = "";
      orderItems.forEach(function (item) {
         let tr = document.createElement("tr");
         tr.innerHTML = `
                <td><a target="_blank" href="${location.origin}/product.html?product=${
            item.product
         }">View ${item.product}</a></td>
                <td>${item.price}</td>
                <td>${item.quantity}</td>
                <td>${item.price * item.quantity}</td>
                `;
         orderItemsTable.appendChild(tr);
      });
   });
}

function deleteOrder(orderID) {
   if (confirm("Are you sure you want to delete this order?")) {
      db.ref("orders/" + orderID).remove();
      db.ref("orderItems/" + orderID).remove();
      toast("Order deleted successfully");
   }
}

function approveOrder(orderID) {
   db.ref("orders/" + orderID).update({ status: "Approved" });
   toast("Order approved successfully");
   removeProductF("activeOrders");
}

function rejectOrder(orderID) {
   db.ref("orders/" + orderID).update({ status: "Rejected" });
   toast("Order rejected successfully");
   removeProductF("activeOrders");
}

function refundOrder(orderID) {
   db.ref("orders/" + orderID).update({ status: "Refunded" });
   toast("Order refunded successfully");
   removeProductF("activeOrders");
}

function completeOrder(orderID) {
   db.ref("orders/" + orderID).update({ status: "Completed" });
   toast("Order completed successfully");
   removeProductF("activeOrders");
}

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
