const database = firebase.database();

let products = database.ref("products");

let urlParams = new URLSearchParams(window.location.search);
let categoryParam = urlParams.get("category");
let searchParam = urlParams.get("search") || urlParams.get("query");

let userID = localStorage.getItem("userID");

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      userID = user.uid;
   }
});

// Get the last 30 products from the database, if user clicks on the "View More" button, get the next 30 products

let lastKey = "";
let lastProduct = "";
let lastProductTime = "";

let items = 12;

products.limitToLast(items).once("value", function (snapshot) {
   if (categoryParam !== null || searchParam !== null) {
      console.log("Category or search parameter detected");
      return;
   }

   let productList = snapshot.val();
   let productKeys = Object.keys(productList);

   let productElement = document.getElementById("productsList");

   productElement.innerHTML = "";

   for (let i = 0; i < productKeys.length; i++) {
      let productKey = productKeys[i];
      let product = productList[productKey];

      let productItem = document.createElement("div");
      productItem.className = "product__item";
      productItem.id = productKey;
      productItem.addEventListener("click", function (event) {
         if (event.target.tagName !== "BUTTON") {
            event.preventDefault();
            location.href = "product.html?product=" + productKey;
         }
      });

      let productImage = document.createElement("img");
      productImage.src = product.image;
      productImage.alt = product.name;

      let productTitle = document.createElement("h3");
      productTitle.textContent = product.name;

      let productPrices = document.createElement("div");
      productPrices.className = "qmimet";

      let price1 = Number(product.price - (product.price * product.discount) / 100).toFixed(2);
      let price2 = product.price;

      let productPrice1 = document.createElement("p");
      productPrice1.textContent = price1 + " €";

      let productPrice2 = document.createElement("p");
      let productPrice22 = document.createElement("span");
      productPrice22.style.textDecoration = "line-through";
      productPrice2.style.color = "red";
      productPrice22.textContent = price2 + " €";
      productPrice22.style.marginLeft = "55px";
      if (product.discount === 0) {
         productPrice2.textContent = "";
      } else {
         productPrice2.innerHTML = "- " + product.discount + "%" + " " + productPrice22.outerHTML;
      }

      let productButtons = document.createElement("div");
      productButtons.className = "buttons";

      let addToCartButton = document.createElement("button");
      addToCartButton.textContent = "Shto në shportë";
      addToCartButton.setAttribute("onclick", `addToCart('${productKey}')`);

      let addToWishlistButton = document.createElement("button");
      let addToWishlistIcon = document.createElement("i");
      addToWishlistIcon.className = "fa-regular fa-heart";
      addToWishlistButton.appendChild(addToWishlistIcon);
      addToWishlistButton.setAttribute("onclick", `addToWishlist('${productKey}')`);

      productItem.appendChild(productImage);
      productItem.appendChild(productTitle);
      productPrices.appendChild(productPrice1);
      productPrices.appendChild(productPrice2);
      productItem.appendChild(productPrices);
      productButtons.appendChild(addToCartButton);
      productButtons.appendChild(addToWishlistButton);
      productItem.appendChild(productButtons);

      productElement.appendChild(productItem);

      lastKey = productKey;
   }

   // Save the products to local storage for 30 minutes

   document.getElementById("loading").style.display = "none";

   localStorage.setItem("products", JSON.stringify(productList));
   localStorage.setItem("productsTime", new Date().getTime());
});

// Function to get the next 30 products from the database

function doDynamic() {
   items = Math.max(0, Math.min(items + 2 * Math.floor(items / 2), 100));
   let addedItems = 0;
   document.getElementById("loading").style.display = "flex";
   products
      .orderByChild("price")
      .limitToLast(items)
      .once("value", (snapshot) => {
         snapshot.forEach((childSnapshot) => {
            document.getElementById("loading").style.display = "none";
            if (addedItems < items) {
               let product = childSnapshot.val();
               let productKey = childSnapshot.key;

               // Check if the product is already displayed
               if (document.getElementById(productKey)) {
                  return;
               }

               let productElement = document.createElement("div");
               productElement.className = "product__item";
               productElement.id = productKey;
               productElement.addEventListener("click", function (event) {
                  if (event.target.tagName !== "BUTTON") {
                     event.preventDefault();
                     location.href = "product?product=" + productKey;
                  }
               });

               let productImage = document.createElement("img");
               productImage.src = product.image;
               productImage.alt = product.name;

               let productTitle = document.createElement("h3");
               productTitle.textContent = product.name;

               let productPrices = document.createElement("div");
               productPrices.className = "qmimet";

               let price1 = Number(
                  product.price - (product.price * product.discount) / 100
               ).toFixed(2);
               let price2 = product.price;

               let productPrice1 = document.createElement("p");
               productPrice1.textContent = price1 + " €";

               let productPrice2 = document.createElement("p");
               let productPrice22 = document.createElement("span");
               productPrice22.style.textDecoration = "line-through";
               productPrice2.style.color = "red";
               productPrice22.textContent = price2 + " €";
               productPrice22.style.marginLeft = "55px";
               if (product.discount === 0) {
                  productPrice2.textContent = "";
               } else {
                  productPrice2.innerHTML =
                     "- " + product.discount + "%" + " " + productPrice22.outerHTML;
               }

               let productButtons = document.createElement("div");
               productButtons.className = "buttons";

               let addToCartButton = document.createElement("button");
               addToCartButton.textContent = "Shto në shportë";
               addToCartButton.setAttribute("onclick", `addToCart('${productKey}')`);

               let addToWishlistButton = document.createElement("button");
               let addToWishlistIcon = document.createElement("i");
               addToWishlistIcon.className = "fa-regular fa-heart";
               addToWishlistButton.appendChild(addToWishlistIcon);
               addToWishlistButton.setAttribute("onclick", `addToWishlist('${productKey}')`);

               productElement.appendChild(productImage);
               productElement.appendChild(productTitle);
               productPrices.appendChild(productPrice1);
               productPrices.appendChild(productPrice2);
               productElement.appendChild(productPrices);
               productButtons.appendChild(addToCartButton);
               productButtons.appendChild(addToWishlistButton);
               productElement.appendChild(productButtons);

               document.getElementById("productsList").appendChild(productElement);

               lastKey = productKey;
               addedItems++;

               document.getElementById("loading").style.display = "none";

               if (addedItems === 0) {
                  document.getElementById("loadMore").style.display = "none";
                  document.getElementById("loading").style.display = "none";
                  return false;
               }
            }
         });
      });
}

let loadMore = document.getElementById("loadMore");

loadMore.addEventListener("click", function (event) {
   doDynamic();
});

// Function to filter products by category

function filterProducts(category) {
   let pr = products.orderByChild("category").equalTo(category).limitToLast(items);
   let npr = products.limitToLast(items);

   let products2 = category === "all" ? npr : pr;

   document.getElementById("loading").style.display = "flex";

   products2.once("value", function (snapshot) {
      let productList = snapshot.val();
      let productKeys = productList ? Object.keys(productList) : [];

      let productElement = document.getElementById("productsList");

      productElement.innerHTML = "";

      for (let i = 0; i < productKeys.length; i++) {
         let productKey = productKeys[i];
         let product = productList[productKey];

         let productItem = document.createElement("div");
         productItem.className = "product__item";
         productItem.id = productKey;
         productItem.addEventListener("click", function (event) {
            if (event.target.tagName !== "BUTTON") {
               event.preventDefault();
               location.href = "product.html?product=" + productKey;
            }
         });

         let productImage = document.createElement("img");
         productImage.src = product.image;
         productImage.alt = product.name;

         let productTitle = document.createElement("h3");
         productTitle.textContent = product.name;

         let productPrices = document.createElement("div");
         productPrices.className = "qmimet";

         let price1 = Number(product.price - (product.price * product.discount) / 100).toFixed(2);
         let price2 = product.price;

         let productPrice1 = document.createElement("p");
         productPrice1.textContent = price1 + " €";

         let productPrice2 = document.createElement("p");
         let productPrice22 = document.createElement("span");
         productPrice22.style.textDecoration = "line-through";
         productPrice2.style.color = "red";
         productPrice22.textContent = price2 + " €";
         productPrice22.style.marginLeft = "55px";
         if (product.discount === 0) {
            productPrice2.textContent = "";
         } else {
            productPrice2.innerHTML =
               "- " + product.discount + "%" + " " + productPrice22.outerHTML;
         }

         let productButtons = document.createElement("div");
         productButtons.className = "buttons";

         let addToCartButton = document.createElement("button");
         addToCartButton.textContent = "Shto në shportë";
         addToCartButton.setAttribute("onclick", `addToCart('${productKey}')`);

         let addToWishlistButton = document.createElement("button");
         let addToWishlistIcon = document.createElement("i");
         addToWishlistIcon.className = "fa-regular fa-heart";
         addToWishlistButton.appendChild(addToWishlistIcon);
         addToWishlistButton.setAttribute("onclick", `addToWishlist('${productKey}')`);

         productItem.appendChild(productImage);
         productItem.appendChild(productTitle);
         productPrices.appendChild(productPrice1);
         productPrices.appendChild(productPrice2);
         productItem.appendChild(productPrices);
         productButtons.appendChild(addToCartButton);
         productButtons.appendChild(addToWishlistButton);
         productItem.appendChild(productButtons);

         productElement.appendChild(productItem);

         lastKey = productKey;
      }

      document.getElementById("loading").style.display = "none";
   });
}

let category = document.getElementById("category");

category.addEventListener("change", function (event) {
   filterProducts(event.target.value);
});

let allProducts = database.ref("products");

let allProductsList = [];

let doneGettingProducts = false;

allProducts
   .once("value", function (snapshot) {
      let productList = snapshot.val();
      let productKeys = productList ? Object.keys(productList) : [];

      for (let i = 0; i < productKeys.length; i++) {
         let productKey = productKeys[i];
         let product = productList[productKey];

         allProductsList.push(product);
      }
   })
   .then((result) => {
      doneGettingProducts = true;
   })
   .catch((err) => {});

// Function to search for products by name

function searchProducts(query) {
   document.getElementById("loading").style.display = "flex";

   let searchV = query.toLowerCase();

   let searchResults = allProductsList.filter((product) => {
      return product.name.toLowerCase().includes(searchV);
   });

   let productElement = document.getElementById("productsList");

   productElement.innerHTML = "";

   for (let i = 0; i < searchResults.length; i++) {
      let product = searchResults[i];

      let productItem = document.createElement("div");
      productItem.className = "product__item";
      productItem.id = product.key;
      productItem.addEventListener("click", function (event) {
         if (event.target.tagName !== "BUTTON") {
            event.preventDefault();
            location.href = "product.html?product=" + product.key;
         }
      });

      let productImage = document.createElement("img");
      productImage.src = product.image;
      productImage.alt = product.name;

      let productTitle = document.createElement("h3");
      productTitle.textContent = product.name;

      let productPrices = document.createElement("div");
      productPrices.className = "qmimet";

      let price1 = Number(product.price - (product.price * product.discount) / 100).toFixed(2);
      let price2 = product.price;

      let productPrice1 = document.createElement("p");
      productPrice1.textContent = price1 + " €";

      let productPrice2 = document.createElement("p");
      let productPrice22 = document.createElement("span");
      productPrice22.style.textDecoration = "line-through";
      productPrice2.style.color = "red";
      productPrice22.textContent = price2 + " €";
      productPrice22.style.marginLeft = "55px";
      if (product.discount === 0) {
         productPrice2.textContent = "";
      } else {
         productPrice2.innerHTML = "- " + product.discount + "%" + " " + productPrice22.outerHTML;
      }

      let productButtons = document.createElement("div");
      productButtons.className = "buttons";

      let addToCartButton = document.createElement("button");
      addToCartButton.textContent = "Shto në shportë";
      addToCartButton.setAttribute("onclick", `addToCart('${product.key}')`);

      let addToWishlistButton = document.createElement("button");
      let addToWishlistIcon = document.createElement("i");
      addToWishlistIcon.className = "fa-regular fa-heart";
      addToWishlistButton.appendChild(addToWishlistIcon);
      addToWishlistButton.setAttribute("onclick", `addToWishlist('${product.key}')`);

      productItem.appendChild(productImage);
      productItem.appendChild(productTitle);
      productPrices.appendChild(productPrice1);
      productPrices.appendChild(productPrice2);
      productItem.appendChild(productPrices);
      productButtons.appendChild(addToCartButton);
      productButtons.appendChild(addToWishlistButton);
      productItem.appendChild(productButtons);

      productElement.appendChild(productItem);

      lastKey = product.key;

      document.getElementById("loading").style.display = "none";

      if (searchResults.length === 0) {
         document.getElementById("loading").style.display = "none";
         return false;
      }
   }
}

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
   searchProducts(query);
}

// Function to order products by price (ascending or descending)

function orderProducts(min, max) {
   document.getElementById("loading").style.display = "flex";

   products
      .orderByChild("price")
      .startAt(min)
      .endAt(max)
      .limitToLast(items)
      .once("value", function (snapshot) {
         let productList = snapshot.val();
         let productKeys = productList ? Object.keys(productList) : [];

         let productElement = document.getElementById("productsList");

         productElement.innerHTML = "";

         for (let i = 0; i < productKeys.length; i++) {
            let productKey = productKeys[i];
            let product = productList[productKey];

            let productItem = document.createElement("div");
            productItem.className = "product__item";
            productItem.id = productKey;
            productItem.addEventListener("click", function (event) {
               if (event.target.tagName !== "BUTTON") {
                  event.preventDefault();
                  location.href = "product.html?product=" + productKey;
               }
            });

            let productImage = document.createElement("img");
            productImage.src = product.image;
            productImage.alt = product.name;

            let productTitle = document.createElement("h3");
            productTitle.textContent = product.name;

            let productPrices = document.createElement("div");
            productPrices.className = "qmimet";

            let price1 = Number(product.price - (product.price * product.discount) / 100).toFixed(
               2
            );
            let price2 = product.price;

            let productPrice1 = document.createElement("p");
            productPrice1.textContent = price1 + " €";

            let productPrice2 = document.createElement("p");
            let productPrice22 = document.createElement("span");
            productPrice22.style.textDecoration = "line-through";
            productPrice2.style.color = "red";
            productPrice22.textContent = price2 + " €";
            productPrice22.style.marginLeft = "55px";
            if (product.discount === 0) {
               productPrice2.textContent = "";
            } else {
               productPrice2.innerHTML =
                  "- " + product.discount + "%" + " " + productPrice22.outerHTML;
            }

            let productButtons = document.createElement("div");
            productButtons.className = "buttons";

            let addToCartButton = document.createElement("button");
            addToCartButton.textContent = "Shto në shportë";
            addToCartButton.setAttribute("onclick", `addToCart('${productKey}')`);

            let addToWishlistButton = document.createElement("button");
            let addToWishlistIcon = document.createElement("i");
            addToWishlistIcon.className = "fa-regular fa-heart";
            addToWishlistButton.appendChild(addToWishlistIcon);
            addToWishlistButton.setAttribute("onclick", `addToWishlist('${productKey}')`);

            productItem.appendChild(productImage);
            productItem.appendChild(productTitle);
            productPrices.appendChild(productPrice1);
            productPrices.appendChild(productPrice2);
            productItem.appendChild(productPrices);
            productButtons.appendChild(addToCartButton);
            productButtons.appendChild(addToWishlistButton);
            productItem.appendChild(productButtons);

            productElement.appendChild(productItem);

            lastKey = productKey;
         }

         document.getElementById("loading").style.display = "none";
      });
}

let minPrice = document.getElementById("minPrice");
let maxPrice = document.getElementById("maxPrice");

minPrice.addEventListener("change", function (event) {
   orderProducts(Number(event.target.value), Number(maxPrice.value));
});

maxPrice.addEventListener("change", function (event) {
   orderProducts(Number(minPrice.value), Number(event.target.value));
});

// Get the category from the URL and filter the products by category

if (categoryParam) {
   document.getElementById("category").value = categoryParam;
   filterProducts(categoryParam);
}

// Get the search query from the URL and search for products by name

if (searchParam) {
   document.getElementById("loading").classList.remove("hidden");
   let allSearchDone = doneGettingProducts;

   let checkSearchDone = setInterval(() => {
      if (doneGettingProducts) {
         clearInterval(checkSearchDone);
         allSearchDone = true;
         console.log("Search index is ready!");
         searchProducts(searchParam);
         document.getElementById("loading").classList.add("hidden");
      }
   }, 100);

   setTimeout(() => {
      if (!allSearchDone) {
         console.log("Search index is still being prepared...");
      }
   }, 5000);
}

// Function to add a product to the cart

function addToCart(productKey) {
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

// Function to add a product to the wishlist

function addToWishlist(productKey) {
   let wishlistItem = {
      product: productKey,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
   };

   // Check if the product is already in the wishlist
   let wishlist = database.ref("wishlist/" + userID + "/" + productKey + "/");

   wishlist.once("value", function (snapshot) {
      let existingWishlistItem = snapshot.val();

      if (existingWishlistItem) {
         toast("Produkti është tashmë në listën e dëshirave.");
      } else {
         wishlist.set(wishlistItem).then(() => {
            toast("Produkti u shtua në listën e dëshirave.");
         });
      }
   });
}

// Function to remove a product from the cart

function removeFromCart(cartKey) {
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

function checkoutCart() {
   location.href = "checkout";
}
