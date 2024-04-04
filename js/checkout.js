const database = firebase.database();

let products = database.ref("products");

let userID,
   userEmail = null;

firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      userID = user.uid;
      userEmail = user.email;
      document.getElementById("account").style.display = "none";

      // Get all the products in the cart from the database

      let cart = database.ref("cart/" + userID);

      let cartTotalVALUE = document.getElementById("cartTotal");

      cart.on("value", function (snapshot) {
         let cartList = snapshot.val();
         let cartKeys = cartList ? Object.keys(cartList) : [];

         if (cartKeys.length === 0) {
            document.getElementById("cartItems").innerHTML =
               "<h2 style='text-align: center; margin-top: 2rem;'>Shporta juaj është e zbrazët.</h2>";
            cartTotalVALUE.textContent = "0.00 €";

            document.querySelector(".porosit__button").classList.add("hidden");
         }

         cartItems = [];
         cartTotal = 0;

         let mainDiv = document.getElementById("cartItems");

         mainDiv.innerHTML = "";

         for (let i = 0; i < cartKeys.length; i++) {
            let cartKey = cartKeys[i];
            let cartItem = cartList[cartKey];

            cartItems.push(cartItem);

            console.log(cartItem);

            let product = products.child(cartItem.product);

            product.once("value", function (snapshot) {
               let productData = snapshot.val();

               let price = Number(
                  productData.price - (productData.price * productData.discount) / 100
               ).toFixed(2);

               cartTotal += price * cartItem.quantity;

               cartTotalVALUE.textContent = cartTotal.toFixed(2) + " €";

               // Put all the cart items in the cart list

               let cartItemDiv = document.createElement("div");
               cartItemDiv.className = "cart-item";

               let cartItemName = document.createElement("h3");
               cartItemName.textContent = productData.name;
               cartItemName.style.cursor = "pointer";
               cartItemName.addEventListener("click", function (event) {
                  location.href = "product?product=" + cartItem.product;
               });

               let cartItemPrice = document.createElement("span");
               cartItemPrice.textContent = price + " €";

               let cartItemQuantity = document.createElement("span");
               cartItemQuantity.textContent = cartItem.quantity + "x";

               let cartItemRemove = document.createElement("button");
               cartItemRemove.textContent = "Fshij";
               cartItemRemove.addEventListener("click", function (event) {
                  removeFromCart(cartKey);
               });

               let add1More = document.createElement("button");
               add1More.textContent = "+";
               add1More.addEventListener("click", function (event) {
                  cartItem.quantity++;
                  cart.child(cartKey).set(cartItem);
               });

               let remove1 = document.createElement("button");
               remove1.textContent = "-";
               remove1.addEventListener("click", function (event) {
                  if (cartItem.quantity > 1) {
                     cartItem.quantity--;
                     cart.child(cartKey).set(cartItem);
                  }
               });

               cartItemDiv.appendChild(cartItemName);
               cartItemDiv.appendChild(cartItemPrice);
               cartItemDiv.appendChild(cartItemQuantity);
               cartItemDiv.appendChild(add1More);
               cartItemDiv.appendChild(remove1);
               cartItemDiv.appendChild(cartItemRemove);

               mainDiv.appendChild(cartItemDiv);
            });
         }
      });

      // Get the address from the local storage if it exists

      let address = localStorage.getItem("address");
      let city = localStorage.getItem("city");
      let phone = localStorage.getItem("phone");
      let zip = localStorage.getItem("zip");

      if (address && city && phone && zip) {
         document.getElementById("address").value = address;
         document.getElementById("city").value = city;
         document.getElementById("phone").value = phone;
         document.getElementById("zip").value = zip;
      }
   } else {
      let randomIndetifier =
         Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      userID = localStorage.getItem("userID") || randomIndetifier;

      if (!localStorage.getItem("userID")) {
         localStorage.setItem("userID", userID);
      }

      let cartTotalVALUE = document.getElementById("cartTotal");
      let cart = database.ref("cart/" + userID);

      cart.on("value", function (snapshot) {
         let cartList = snapshot.val();
         let cartKeys = cartList ? Object.keys(cartList) : [];

         if (cartKeys.length === 0) {
            document.getElementById("cartItems").innerHTML =
               "<h2 style='text-align: center; margin-top: 2rem;'>Shporta juaj është e zbrazët.</h2>";
            cartTotalVALUE.textContent = "0.00 €";

            document.querySelector(".porosit__button").classList.add("hidden");
         }

         cartItems = [];
         cartTotal = 0;

         let mainDiv = document.getElementById("cartItems");

         mainDiv.innerHTML = "";

         for (let i = 0; i < cartKeys.length; i++) {
            let cartKey = cartKeys[i];
            let cartItem = cartList[cartKey];

            cartItems.push(cartItem);

            let product = products.child(cartItem.product);

            product.once("value", function (snapshot) {
               let productData = snapshot.val();

               let price = Number(
                  productData.price - (productData.price * productData.discount) / 100
               ).toFixed(2);

               cartTotal += price * cartItem.quantity;

               cartTotalVALUE.textContent = cartTotal.toFixed(2) + " €";

               // Put all the cart items in the cart list

               let cartItemDiv = document.createElement("div");
               cartItemDiv.className = "cart-item";

               let cartItemName = document.createElement("h3");
               cartItemName.textContent = productData.name;
               cartItemName.style.cursor = "pointer";
               cartItemName.addEventListener("click", function (event) {
                  location.href = "product?product=" + cartItem.product;
               });

               let cartItemPrice = document.createElement("span");
               cartItemPrice.textContent = price + " €";

               let cartItemQuantity = document.createElement("span");
               cartItemQuantity.textContent = cartItem.quantity + "x";

               let cartItemRemove = document.createElement("button");
               cartItemRemove.textContent = "Fshij";
               cartItemRemove.addEventListener("click", function (event) {
                  removeFromCart(cartKey);
               });

               let add1More = document.createElement("button");
               add1More.textContent = "+";
               add1More.addEventListener("click", function (event) {
                  cartItem.quantity++;
                  cart.child(cartKey).set(cartItem);
               });

               let remove1 = document.createElement("button");
               remove1.textContent = "-";
               remove1.addEventListener("click", function (event) {
                  if (cartItem.quantity > 1) {
                     cartItem.quantity--;
                     cart.child(cartKey).set(cartItem);
                  }
               });

               cartItemDiv.appendChild(cartItemName);
               cartItemDiv.appendChild(cartItemPrice);
               cartItemDiv.appendChild(cartItemQuantity);
               cartItemDiv.appendChild(add1More);
               cartItemDiv.appendChild(remove1);
               cartItemDiv.appendChild(cartItemRemove);

               mainDiv.appendChild(cartItemDiv);
            });
         }
      });

      // Get the address from the local storage if it exists

      let address = localStorage.getItem("address");
      let city = localStorage.getItem("city");
      let phone = localStorage.getItem("phone");
      let zip = localStorage.getItem("zip");

      if (address && city && phone && zip) {
         document.getElementById("address").value = address;
         document.getElementById("city").value = city;
         document.getElementById("phone").value = phone;
         document.getElementById("zip").value = zip;
      }
   }
});

let search = document.getElementById("search");
let oldSearch = `<i class="fa-solid fa-search"></i>`;
let oldSearchBar = `<input type="text" id="searchBar" placeholder="Search..." class="searchBar">`;

search.addEventListener("click", function (event) {
   // Make the search button a search bar when clicked
   search.innerHTML = oldSearchBar;
   let searchBar = document.getElementById("searchBar");
   searchBar.focus();
   searchBar.addEventListener("focusout", function (event) {
      search.innerHTML = oldSearch;
   });

   searchBar.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
         // Do something with the search query
         let query = searchBar.value;
         searchResults(query);

         search.innerHTML = oldSearch;
      }
   });

   searchBar.addEventListener("blur", function (event) {
      // Check if the user is clicking outside the search bar

      if (event.relatedTarget === null) {
         search.innerHTML = oldSearch;
      }
   });

   event.preventDefault();
});

function searchResults(query) {
   location.href = "browse?query=" + query;
}

function toast(message, duration = 4500, delay = 0) {
   const existingToast = document.querySelector(".toast");
   if (existingToast) {
      existingToast.remove();
   }
   const toastContainer = document.createElement("div");
   toastContainer.style.position = "fixed";
   toastContainer.style.top = "1.5rem";
   toastContainer.style.right = "1rem";
   toastContainer.style.display = "flex";
   toastContainer.style.alignItems = "center";
   toastContainer.style.justifyContent = "center";
   toastContainer.style.width = "16rem";
   toastContainer.style.padding = "1rem";
   toastContainer.style.backgroundColor = "rgba(243, 247, 253, 0.5)";
   toastContainer.style.color = "#041e49";
   toastContainer.style.borderRadius = "30px";
   toastContainer.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.25)";
   toastContainer.style.overflow = "auto";
   toastContainer.style.maxHeight = "500px";
   toastContainer.style.minWidth = "200px";
   toastContainer.style.width = "fit-content";
   toastContainer.style.zIndex = "9999";
   toastContainer.style.transition = "opacity 0.3s ease-out";
   toastContainer.style.backdropFilter = "blur(10px)";
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

function openCart() {
   let cartDiv = document.createElement("div");
   cartDiv.className = "cart";
   let cartContent = document.createElement("div");
   cartContent.className = "cart-content";
   let cartHeader = document.createElement("div");
   cartHeader.className = "cart-header";
   let cartTitle = document.createElement("h2");
   cartTitle.textContent = "Shporta";
   let closeCart = document.createElement("button");
   closeCart.className = "close-cart";
   closeCart.textContent = "Mbyll";
   closeCart.addEventListener("click", function (event) {
      document.getElementById("cart").classList.remove("hidden");
      cartDiv.style.transform = "translateX(100%)";
      setTimeout(() => {
         cartDiv.remove();
      }, 300);
   });
   cartHeader.appendChild(cartTitle);
   cartHeader.appendChild(closeCart);
   cartContent.appendChild(cartHeader);
   let cartList = document.createElement("div");
   cartList.className = "cart-list";
   let cartFooter = document.createElement("div");
   cartFooter.className = "cart-footer";
   let cartTotalElement = document.createElement("h3");
   cartTotalElement.textContent = "Totali: ";
   let cartTotalPrice = document.createElement("span");
   cartTotalPrice.id = "cartTotalPrice";
   cartTotalPrice.textContent = "0.00 €";
   cartTotalElement.appendChild(cartTotalPrice);
   let checkoutButton = document.createElement("button");
   checkoutButton.className = "checkout-button";
   checkoutButton.textContent = "Blej";
   checkoutButton.addEventListener("click", function (event) {
      checkoutCart();
   });
   cartFooter.appendChild(cartTotalElement);
   cartFooter.appendChild(checkoutButton);
   cartContent.appendChild(cartList);
   cartContent.appendChild(cartFooter);
   cartDiv.appendChild(cartContent);
   document.body.appendChild(cartDiv);

   document.getElementById("cart").classList.add("hidden");
   fillCart();
}

function fillCart() {
   document.getElementsByClassName("cart")[0].style.transform = "translateX(0)";

   let userCart = database.ref("cart/" + userID);
   let cartItems = [];
   let cartTotal = 0;
   let cartList = document.querySelector(".cart-list");
   let cartTotalPrice = document.getElementById("cartTotalPrice");
   cartTotalPrice.textContent = "0.00 €";

   userCart.on("value", function (snapshot) {
      cartItems = [];
      cartTotal = 0;
      cartList.innerHTML = "";

      snapshot.forEach(function (childSnapshot) {
         let cartKey = childSnapshot.key;
         let cartItem = childSnapshot.val();
         cartItems.push(cartItem);
         let product = products.child(cartItem.product);
         product.once("value", function (snapshot) {
            let productData = snapshot.val();
            let price = Number(
               productData.price - (productData.price * productData.discount) / 100
            ).toFixed(2);
            cartTotal += price * cartItem.quantity;
            cartTotalPrice.textContent = cartTotal.toFixed(2) + " €";

            document.getElementById("numberCart").textContent = cartTotal.toFixed(2) + " €";

            let cartItemElement = document.createElement("div");
            cartItemElement.className = "cart-item";
            let cartItemName = document.createElement("h3");
            cartItemName.textContent = productData.name;
            cartItemName.style.cursor = "pointer";

            cartItemName.addEventListener("click", function (event) {
               location.href = "product?product=" + cartItem.product;
            });

            let actions = document.createElement("div");
            actions.className = "actions";

            let add1More = document.createElement("button");
            add1More.textContent = "+";

            add1More.addEventListener("click", function (event) {
               cartItem.quantity++;
               userCart.child(cartKey).set(cartItem);
            });

            let remove1 = document.createElement("button");
            remove1.textContent = "-";
            remove1.addEventListener("click", function (event) {
               if (cartItem.quantity > 1) {
                  cartItem.quantity--;
                  userCart.child(cartKey).set(cartItem);
               }
            });

            let cartItemPrice = document.createElement("span");
            cartItemPrice.textContent = price + " €";
            let cartItemQuantity = document.createElement("span");
            cartItemQuantity.textContent = cartItem.quantity + "x";
            let cartItemRemove = document.createElement("button");
            cartItemRemove.textContent = "Fshij";
            cartItemRemove.addEventListener("click", function (event) {
               removeFromCart(cartKey);
            });

            actions.appendChild(cartItemPrice);
            actions.appendChild(cartItemQuantity);
            actions.appendChild(add1More);
            actions.appendChild(remove1);
            actions.appendChild(cartItemRemove);

            cartItemElement.appendChild(cartItemName);
            cartItemElement.appendChild(actions);
            cartList.appendChild(cartItemElement);
         });
      });
   });
}

// Function to add a product to the cart

function addToCart(productKey) {
   if (!userID) {
      toast("Ju lutem kyçuni ose regjistrohuni për të shtuar produktet në shportë.");
      return;
   }

   let cartItem = {
      product: productKey,
      quantity: 1,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
   };

   // Check if the product is already in the cart
   let cart = database.ref("cart/" + userID + "/" + productKey + "/");

   cart.once("value", function (snapshot) {
      let existingCartItem = snapshot.val();

      if (existingCartItem) {
         cartItem.quantity = existingCartItem.quantity + 1;
         cartItem.time = new Date().getTime();
         cartItem.timestamp = firebase.database.ServerValue.TIMESTAMP;

         cart.set(cartItem).then(() => {
            toast("Kuantitei i produktit u rrit me 1.");
         });
      } else {
         cart.set(cartItem).then(() => {
            toast("Produkti u shtua në shportë.");

            document.getElementById("numberCart").textContent =
               parseInt(document.getElementById("numberCart").textContent) + 1;
         });
      }
   });
}

// Function to remove a product from the cart

function removeFromCart(cartKey) {
   if (!userID) {
      toast("Ju lutem kyçuni ose regjistrohuni për të fshirë produktet nga shporta.");
      return;
   }

   let cart = database.ref("cart/" + userID + "/" + cartKey);

   cart
      .remove()
      .then(() => {
         toast("Produkti u hoq nga shporta.");
      })
      .catch((error) => {
         console.error("Error removing product from cart: ", error);
      });
}

let cashSelect = document.getElementById("cash");
let cardSelect = document.getElementById("card");

cashSelect.addEventListener("click", function (event) {
   cardSelect.classList.remove("selected");
   cashSelect.classList.add("selected");
   document.getElementById("paymentCard").classList.add("hidden");
   console.log("Cash selected");
});

cardSelect.addEventListener("click", function (event) {
   cashSelect.classList.remove("selected");
   cardSelect.classList.add("selected");
   document.getElementById("paymentCard").classList.remove("hidden");
   console.log("Card selected");
});

function saveAddress() {
   let address = document.getElementById("address").value;
   let city = document.getElementById("city").value;
   let phone = document.getElementById("phone").value;
   let zip = document.getElementById("zip").value;

   if (!address || !city || !phone || !zip) {
      toast("Ju lutem plotësoni të gjitha fushat për të vazhduar.");
      return;
   }

   localStorage.setItem("address", address);
   localStorage.setItem("city", city);
   localStorage.setItem("phone", phone);
   localStorage.setItem("zip", zip);

   toast("Adresa u ruajt me sukses.");
}

let ALL_PRODUCTS = [];

function checkoutCart() {
   if (!userID) {
      toast("Ju lutem kyçuni ose regjistrohuni për të bërë blerjen.");
      return;
   }

   // Check if there are any items in the cart

   let cartTotal = document.getElementById("cartTotal").textContent;
   cartTotal = parseFloat(cartTotal);

   if (cartTotal === 0) {
      toast("Ju lutem shtoni produkte në shportë për të vazhduar.");
      return;
   }

   let cart = database.ref("cart/" + userID);

   let giftCard = document.getElementById("giftCard").value;

   let giftCards = database.ref("giftCodes/" + giftCard);

   giftCards.once("value", function (snapshot) {
      let giftCardData = snapshot.val();

      if (giftCardData) {
         // Proceed with the checkout
         let address = document.getElementById("address").value;
         let city = document.getElementById("city").value;
         let phone = document.getElementById("phone").value;
         let zip = document.getElementById("zip").value;

         if (!address || !city || !phone || !zip) {
            toast("Ju lutem plotësoni të gjitha fushat për të vazhduar.");
            return;
         }

         let order = {
            address: address,
            city: city,
            phone: phone,
            zip: zip,
            user: userID,
            status: "review",
            time: new Date().getTime(),
            timestamp: firebase.database.ServerValue.TIMESTAMP,
         };

         let orders = database.ref("orders");

         orders.push(order).then((snapshot) => {
            let orderKey = snapshot.key;

            cart.once("value", function (snapshot) {
               let cartList = snapshot.val();
               let cartKeys = Object.keys(cartList);

               let orderItems = [];

               for (let i = 0; i < cartKeys.length; i++) {
                  let cartKey = cartKeys[i];
                  let cartItem = cartList[cartKey];

                  let product = products.child(cartItem.product);

                  product.once("value", function (snapshot) {
                     let productData = snapshot.val();

                     let superDiscount = Math.max(
                        productData.discount || 0,
                        giftCardData.percent || 0
                     );

                     let price = Number(
                        productData.price - (productData.price * superDiscount) / 100
                     ).toFixed(2);

                     let orderItem = {
                        product: cartItem.product,
                        quantity: cartItem.quantity,
                        price: price,
                     };

                     let orderID = orderKey;
                     orderItems.push(orderItem);

                     ALL_PRODUCTS.push(productData);

                     if (orderItems.length === cartKeys.length) {
                        let orderItemsRef = database.ref("orderItems/" + orderKey);

                        orderItemsRef.set(orderItems).then(() => {
                           cart.remove().then(() => {
                              toast("Porosia u pranua me sukses.");

                              let textDocument = `POSHTE DETAJET E POROSISE:
                              Adresa: ${address}
                              Qyteti: ${city}
                              Numri i telefonit: ${phone}
                              Kodi postar: ${zip}
                              Totali: ${cartTotal} €
                              Orari i porosise: ${new Date().toLocaleString()}
                              Order ID: ${orderID}
                              Produktet: `;
                              let productNames = [];
                              let productPrices = [];
                              let productQuantities = [];
                              let productTotal = [];
                              let productTotalPrice = 0;
                              for (let i = 0; i < ALL_PRODUCTS.length; i++) {
                                 productNames.push(ALL_PRODUCTS[i].name);
                                 productPrices.push(ALL_PRODUCTS[i].price);
                                 productQuantities.push(orderItems[i].quantity);
                                 productTotal.push(
                                    Number(
                                       ALL_PRODUCTS[i].price -
                                          (ALL_PRODUCTS[i].price * ALL_PRODUCTS[i].discount) / 100
                                    ).toFixed(2)
                                 );
                                 productTotalPrice += productTotal[i] * productQuantities[i];
                              }

                              for (let i = 0; i < productNames.length; i++) {
                                 textDocument += `
                                 Produkti: ${productNames[i]}
                                 Sasia: ${productQuantities[i]}
                                 Cmimi: ${productTotal[i]} €
                                 `;
                              }

                              textDocument += `
                              Totali i porosise: ${productTotalPrice} €
                              Kodin e dhurates: ${giftCard}
                              `;
                              let orderDetails = database.ref("orderDetails/" + orderKey);
                              orderDetails.set(textDocument);

                              // Download the order details as a text file
                              let downloadLink = document.createElement("a");
                              downloadLink.href =
                                 "data:text/plain;charset=utf-8," +
                                 encodeURIComponent(textDocument);
                              downloadLink.download = `order-${orderID}.txt`;
                              downloadLink.click();

                              // Clear the gift card input
                              document.getElementById("giftCard").value = "";
                           });
                        });
                     }
                  });
               }
            });
         });
      } else {
         let address = document.getElementById("address").value;
         let city = document.getElementById("city").value;
         let phone = document.getElementById("phone").value;
         let zip = document.getElementById("zip").value;

         if (!address || !city || !phone || !zip) {
            toast("Ju lutem plotësoni të gjitha fushat për të vazhduar.");
            return;
         }

         let order = {
            address: address,
            city: city,
            phone: phone,
            zip: zip,
            user: userID,
            status: "pending",
            time: new Date().getTime(),
            timestamp: firebase.database.ServerValue.TIMESTAMP,
         };

         let orders = database.ref("orders");

         orders.push(order).then((snapshot) => {
            let orderKey = snapshot.key;

            cart.once("value", function (snapshot) {
               let cartList = snapshot.val();
               let cartKeys = Object.keys(cartList);

               let orderItems = [];

               for (let i = 0; i < cartKeys.length; i++) {
                  let cartKey = cartKeys[i];
                  let cartItem = cartList[cartKey];

                  let product = products.child(cartItem.product);

                  product.once("value", function (snapshot) {
                     let productData = snapshot.val();

                     let price = Number(
                        productData.price - (productData.price * (productData.discount || 0)) / 100
                     ).toFixed(2);

                     let orderItem = {
                        product: cartItem.product,
                        quantity: cartItem.quantity,
                        price: price,
                     };

                     orderItems.push(orderItem);

                     if (orderItems.length === cartKeys.length) {
                        let orderItemsRef = database.ref("orderItems/" + orderKey);

                        orderItemsRef.set(orderItems).then(() => {
                           cart.remove().then(() => {
                              toast("Porosia u pranua me sukses.");
                              addProductF("activeOrders");
                              addProductF("totalOrders");
                              document.getElementById("numberCart").textContent = "0.00 €";
                              document.getElementById("cartTotalPrice").textContent = "0.00 €";
                              document.getElementById("cartItems").innerHTML = "";
                           });
                        });
                     }
                  });
               }
            });
         });
      }
   });
}

function giftCard() {
   let giftCard = document.getElementById("giftCard").value;

   let giftCards = database.ref("giftCodes/" + giftCard);

   giftCards.once("value", function (snapshot) {
      let giftCardData = snapshot.val();

      if (giftCardData) {
         let percent = giftCardData.percent;
         let cartTotal = document.getElementById("cartTotal").textContent;
         cartTotal = parseFloat(cartTotal);
         let discount = (cartTotal * percent) / 100;

         let total = cartTotal - discount;
         let totalElement = document.getElementById("cartTotal");
         totalElement.textContent = total.toFixed(2) + " €";
         toast("Kodi i dhurates u pranua me sukses.");
      } else {
         toast("Kodi i dhurates nuk eshte valid.");
      }
   });
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
