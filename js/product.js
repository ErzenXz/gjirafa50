const database = firebase.database();

let products = database.ref("products");

let userID,
   userEmail = null;

firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      userID = user.uid;
      userEmail = user.email;
      document.getElementById("account").style.display = "none";

      let cartTotalElement = document.getElementById("numberCart");

      // Get all the products in the cart from the database

      let cart = database.ref("cart/" + userID);

      cart.on("value", function (snapshot) {
         let cartList = snapshot.val();
         let cartKeys = cartList ? Object.keys(cartList) : [];

         cartItems = [];
         cartTotal = 0;

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

               cartTotalElement.textContent = cartTotal.toFixed(2) + " €";
            });
         }
      });

      // Get the product key from the URL
      let url = new URL(window.location.href);
      let productKey = url.searchParams.get("product");

      if (!productKey) {
         location.href = "index";
      }

      let product = products.child(productKey);
      let productData;

      product.once("value", function (snapshot) {
         productData = snapshot.val();

         if (!productData) {
            location.href = "index";
         }

         let productElement = document.getElementById("product");

         let productImageDiv = document.createElement("div");
         productImageDiv.className = "product__image";

         let bigImageDiv = document.createElement("div");
         bigImageDiv.className = "bigImage";
         let productImage = document.createElement("img");
         productImage.src = productData.image;
         productImage.alt = productData.name;

         bigImageDiv.appendChild(productImage);

         let smallImagesDiv = document.createElement("div");
         smallImagesDiv.className = "smallImages";

         for (let i = 0; i < productData.images.length; i++) {
            let smallImage = document.createElement("img");
            smallImage.src = productData.images[i];
            smallImage.alt = "Product Image " + i;
            smallImage.addEventListener("click", function (event) {
               productImage.src = productData.images[i];
            });

            smallImagesDiv.appendChild(smallImage);
         }

         productImageDiv.appendChild(bigImageDiv);
         productImageDiv.appendChild(smallImagesDiv);

         let productInfoDiv = document.createElement("div");
         productInfoDiv.className = "product__info";

         let productMiniInfoDiv = document.createElement("div");
         productMiniInfoDiv.className = "product__mini__info";

         let tags = productData?.tags?.split(",").map((tag) => tag.trim()) || ["", ""];

         let category = String(tags[0]);
         category = category.charAt(0).toUpperCase() + category.slice(1);
         let brand = String(tags[1]);
         brand = brand.charAt(0).toUpperCase() + brand.slice(1);

         let productCategoryDiv = document.createElement("div");
         productCategoryDiv.className = "product__category";
         let productCategory = document.createElement("p");
         productCategory.textContent = category;
         productCategoryDiv.appendChild(productCategory);

         let productBrandDiv = document.createElement("div");
         productBrandDiv.className = "product__brand";
         let productBrand = document.createElement("p");
         productBrand.textContent = brand;
         productBrandDiv.appendChild(productBrand);

         let productRatingDiv = document.createElement("div");
         productRatingDiv.className = "product__rating";

         let likes = productData.likes || 0;
         let dislikes = productData.dislikes || 0;
         let stars = 0;

         let rating = (likes / (likes + dislikes)) * 100 || 0;

         if (rating >= 0 && rating < 25) {
            stars = 1;
         } else if (rating >= 25 && rating < 45) {
            stars = 2;
         } else if (rating >= 45 && rating < 68) {
            stars = 3;
         } else if (rating >= 68 && rating < 85) {
            stars = 4;
         } else if (rating == 100) {
            stars = 5;
         }

         for (let i = 0; i < stars; i++) {
            let starIcon = document.createElement("i");
            starIcon.className = "fa-solid fa-star";
            productRatingDiv.appendChild(starIcon);
         }

         productMiniInfoDiv.appendChild(productCategoryDiv);
         productMiniInfoDiv.appendChild(productBrandDiv);
         productMiniInfoDiv.appendChild(productRatingDiv);

         let productInfoTopDiv = document.createElement("div");
         productInfoTopDiv.className = "product__info__top";

         let productTitle = document.createElement("h1");
         productTitle.className = "product__title";
         productTitle.textContent = productData.name;

         productInfoTopDiv.appendChild(productTitle);

         let priceOld = productData.price;
         let discount = productData.discount;
         let price = Number(priceOld - (priceOld * discount) / 100).toFixed(2);

         let productPriceOld = document.createElement("p");
         productPriceOld.className = "product__price_old";
         productPriceOld.textContent = priceOld + " €";

         let productPrice = document.createElement("p");
         productPrice.className = "product__price";
         productPrice.textContent = price + " €";

         let productDescription = document.createElement("p");
         productDescription.className = "product__description";
         productDescription.textContent = productData.description;
         productDescription.style.whiteSpace = "pre-line";

         let addToCartButton = document.createElement("button");
         addToCartButton.className = "product__button";
         addToCartButton.textContent = "Add to Cart";

         let addToWishlistButton = document.createElement("button");
         addToWishlistButton.className = "product__button";
         addToWishlistButton.textContent = "Add to Wishlist";

         addToWishlistButton.addEventListener("click", function (event) {
            // Add the product to the cart
            addToWishlist(productKey);
         });

         addToCartButton.addEventListener("click", function (event) {
            // Add the product to the cart
            addToCart(productKey);
         });

         productInfoDiv.appendChild(productMiniInfoDiv);
         productInfoDiv.appendChild(productInfoTopDiv);

         if (discount > 0) {
            productPriceOld.style.textDecoration = "line-through";
            productInfoDiv.appendChild(productPriceOld);
         }

         productInfoDiv.appendChild(productPrice);
         productInfoDiv.appendChild(productDescription);
         productInfoDiv.appendChild(addToCartButton);
         productInfoDiv.appendChild(addToWishlistButton);

         productElement.appendChild(productImageDiv);
         productElement.appendChild(productInfoDiv);
      });
   } else {
      userID = null;
      userEmail = null;
      document.getElementById("account").style.display = "block";
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

function checkoutCart() {
   location.href = "checkout";
}
