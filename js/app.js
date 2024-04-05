const prevSlideButton = document.getElementById("prevSlide");
const nextSlideButton = document.getElementById("nextSlide");
const slidesContainer = document.querySelector(".imageSlider__slides");
let slides = document.querySelectorAll(".imageSlider__slide");
let currentSlideIndex = 0;
let isDragging = false;
let startPosX = 0;
let currentTranslateX = 0;
let prevTranslateX = 0;

prevSlideButton.addEventListener("click", () => {
   currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
   updateSlide();
});

nextSlideButton.addEventListener("click", () => {
   currentSlideIndex = (currentSlideIndex + 1) % slides.length;
   updateSlide();
});

window.addEventListener("resize", updateSlide);

function updateSlide() {
   slidesContainer.style.transition = "transform 0.3s ease-out";
   slidesContainer.style.transform = `translateX(-${currentSlideIndex * slides[0].offsetWidth}px)`;
   const currentSlideElement = document.getElementById("currentSlide");
   const totalSlidesElement = document.getElementById("totalSlides");
   currentSlideElement.textContent = currentSlideIndex + 1;
   totalSlidesElement.textContent = slides.length;
}

// slidesContainer.addEventListener("mousedown", (event) => {
//    isDragging = true;
//    startPosX = event.clientX;
//    prevTranslateX = currentTranslateX;
//    slidesContainer.style.transition = "none";
// });

// slidesContainer.addEventListener("mousemove", (event) => {
//    if (isDragging) {
//       const currentPositionX = event.clientX;
//       currentTranslateX = prevTranslateX + currentPositionX - startPosX;
//       slidesContainer.style.transform = `translateX(${currentTranslateX}px)`;
//    }
// });

// slidesContainer.addEventListener("mouseup", () => {
//    isDragging = false;
//    const movedBy = currentTranslateX - prevTranslateX;
//    if (movedBy < -100 && currentSlideIndex < slides.length - 1) {
//       currentSlideIndex += 1;
//    }
//    if (movedBy > 100 && currentSlideIndex > 0) {
//       currentSlideIndex -= 1;
//    }
//    slidesContainer.style.transition = "transform 0.3s ease-out";
//    slidesContainer.style.transform = `translateX(-${currentSlideIndex * slides[0].offsetWidth}px)`;
// });

// slidesContainer.addEventListener("transitionend", () => {
//    updateSlide();
// });

// slidesContainer.addEventListener("mouseleave", () => {
//    isDragging = false;
//    const movedBy = currentTranslateX - prevTranslateX;
//    if (movedBy < -100 && currentSlideIndex < slides.length - 1) {
//       currentSlideIndex += 1;
//    }
//    if (movedBy > 100 && currentSlideIndex > 0) {
//       currentSlideIndex -= 1;
//    }
//    slidesContainer.style.transition = "transform 0.3s ease-out";
//    slidesContainer.style.transform = `translateX(-${currentSlideIndex * slides[0].offsetWidth}px)`;
// });

// Auto slide

let autoSlide = setInterval(() => {
   currentSlideIndex = (currentSlideIndex + 1) % slides.length;
   updateSlide();
}, 5000);

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

const database = firebase.database();

let categories = database.ref("categories");
let products = database.ref("products");
let specialImages = database.ref("specialImages");

let userID, userEmail, userDisplayName;

firebase.auth().onAuthStateChanged(function (user) {
   if (user) {
      // User is signed in.
      userID = user.uid;
      userEmail = user.email;

      let cart = database.ref("cart/" + userID);
      let favorites = database.ref("favorites/" + userID);

      let cartItems = [];
      let favoriteItems = [];

      let cartTotal = 0;
      let favoriteTotal = 0;

      let cartTotalElement = document.getElementById("numberCart");

      // Get all the products in the cart from the database

      cart.on("value", function (snapshot) {
         let cartList = snapshot.val();
         let cartKeys = cartList ? Object.keys(cartList) : [];

         cartItems = [];
         cartTotal = 0;

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

               cartTotalElement.textContent = cartTotal.toFixed(2) + " €";
            });
         }
      });
   } else {
      let randomIndetifier =
         Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      userID = localStorage.getItem("userID") || randomIndetifier;

      if (!localStorage.getItem("userID")) {
         localStorage.setItem("userID", userID);
      }

      // No user is signed in.
      console.log("No user is signed in. " + userID);

      let cart = database.ref("cart/" + userID);
      let cartTotalElement = document.getElementById("numberCart");

      // Get all the products in the cart from the database

      cart.on("value", function (snapshot) {
         let cartList = snapshot.val();
         let cartKeys = cartList ? Object.keys(cartList) : [];

         cartItems = [];
         cartTotal = 0;

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

               cartTotalElement.textContent = cartTotal.toFixed(2) + " €";
            });
         }
      });
   }
});

// Get all special images from the database

let savedSpecialImages = localStorage.getItem("specialImages");
let savedSpecialImagesTime = localStorage.getItem("specialImagesTime");

if (
   savedSpecialImages &&
   savedSpecialImagesTime &&
   new Date().getTime() - savedSpecialImagesTime < 1800000
) {
   let specialImagesList = Object.values(JSON.parse(savedSpecialImages));

   let specialImagesElement = document.getElementById("slides");

   specialImagesElement.innerHTML = "";

   let added = 0;

   for (let i = 0; i < specialImagesList.length; i++) {
      let specialImage = specialImagesList[i];

      let html = `
      <div class="imageSlider__slide">
         <img
            src="${specialImage.image}"
            alt="Slider Image ${i + 1}"
         />
      </div>`;

      let startDate = new Date(specialImage.startDate);
      let endDate = new Date(specialImage.endDate);

      let currentDate = new Date().getTime();

      if (currentDate >= startDate && currentDate <= endDate) {
         specialImagesElement.innerHTML += html;
         added++;
      } else {
         //
      }

      if (added === 0) {
         let html = `
         <div class="imageSlider__slide">
            <img
               src="https://iqq6kf0xmf.gjirafa.net/images/1a590909-12b8-4f44-b8d5-379ea21b4aff/1a590909-12b8-4f44-b8d5-379ea21b4aff.jpeg?w=1920"
               alt="Slider Image ${i + 1}"
            />
         </div>`;
         specialImagesElement.innerHTML += html;
         added++;
      }
   }
   document.getElementById("totalSlides").textContent = added;

   console.log(
      "Loaded special images from local storage. Will update in " +
         (1800000 - (new Date().getTime() - savedSpecialImagesTime)) +
         " milliseconds."
   );

   slides = document.querySelectorAll(".imageSlider__slide"); // Update the slides array with current slide elements
} else {
   specialImages.on("value", function (snapshot) {
      let specialImagesList = snapshot.val();
      let specialImagesKeys = Object.keys(specialImagesList) || [];

      let specialImagesElement = document.getElementById("slides");

      specialImagesElement.innerHTML = "";

      for (let i = 0; i < specialImagesKeys.length; i++) {
         let specialImageKey = specialImagesKeys[i];
         let specialImage = specialImagesList[specialImageKey];

         let html = `
      <div class="imageSlider__slide">
      <img
            src="${specialImage.image}"
            alt="Slider Image ${i + 1}"
         />
         </div>`;

         specialImagesElement.innerHTML += html;
         document.getElementById("totalSlides").textContent = specialImagesKeys.length;
      }

      slides = document.querySelectorAll(".imageSlider__slide"); // Update the slides array with current slide elements

      // Save the special images to local storage for 30 minutes

      localStorage.setItem("specialImages", JSON.stringify(specialImagesList));
      localStorage.setItem("specialImagesTime", new Date().getTime());
   });
}
// Get all the categories from the database

let savedCategories = localStorage.getItem("categories");
let savedCategoriesTime = localStorage.getItem("categoriesTime");

if (
   savedCategories &&
   savedCategoriesTime &&
   new Date().getTime() - savedCategoriesTime < 1800000
) {
   let categoryList = Object.values(JSON.parse(savedCategories));

   let categoryElement = document.getElementById("categories");

   categoryElement.innerHTML = "";

   for (let i = 0; i < categoryList.length; i++) {
      let category = categoryList[i];

      let categoryItem = document.createElement("div");
      categoryItem.className = "item";
      categoryItem.addEventListener("click", function (event) {
         event.preventDefault();
         location.href = "browse?category=" + category.url;
      });

      let categoryImage = document.createElement("img");
      categoryImage.src = category.image;
      categoryImage.alt = category.name;

      let categoryTitle = document.createElement("h3");
      categoryTitle.textContent = category.name;

      categoryItem.appendChild(categoryImage);
      categoryItem.appendChild(categoryTitle);

      categoryElement.appendChild(categoryItem);
   }

   console.log(
      "Loaded categories from local storage. Will update in " +
         (1800000 - (new Date().getTime() - savedCategoriesTime)) +
         " milliseconds."
   );
} else {
   categories.on("value", function (snapshot) {
      let categoryList = snapshot.val();
      let categoryKeys = Object.keys(categoryList);

      console.log(categoryList);

      let categoryElement = document.getElementById("categories");

      categoryElement.innerHTML = "";

      for (let i = 0; i < categoryKeys.length; i++) {
         let categoryKey = categoryKeys[i];
         let category = categoryList[categoryKey];

         let categoryItem = document.createElement("div");
         categoryItem.className = "item";
         categoryItem.addEventListener("click", function (event) {
            event.preventDefault();
            location.href = "browse?category=" + category.url;
         });

         let categoryImage = document.createElement("img");
         categoryImage.src = category.image;
         categoryImage.alt = category.name;

         let categoryTitle = document.createElement("h3");
         categoryTitle.textContent = category.name;

         categoryItem.appendChild(categoryImage);
         categoryItem.appendChild(categoryTitle);

         categoryElement.appendChild(categoryItem);
      }

      // Save the categories to local storage for 30 minutes

      localStorage.setItem("categories", JSON.stringify(categoryList));
      localStorage.setItem("categoriesTime", new Date().getTime());
   });
}

// Get the last 30 products from the database, if user clicks on the "View More" button, get the next 30 products

let lastKey = "";
let lastProduct = "";
let lastProductTime = "";

let items = 12;

products.limitToLast(items).on("value", function (snapshot) {
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
   products.limitToLast(items).once("value", (snapshot) => {
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

// Function to add a special image to the database

function addSpecialImage(imageURL, title, description, startDate, endDate, category) {
   let specialImage = {
      image: imageURL,
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      category: category,
      administrator: userID,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
   };

   specialImages.push(specialImage);
}

// Function to add a category to the database

function addCategory(imageURL, name, description, url) {
   let category = {
      image: imageURL,
      name: name,
      description: description,
      url: url,
      administrator: userID,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
   };

   categories.push(category);
}

// Function to add a product to the database

function addProduct(
   imageURL,
   images,
   name,
   description,
   price,
   discount,
   category,
   stock,
   color,
   size,
   material,
   endDiscountDate
) {
   let product = {
      image: imageURL,
      images: images,
      name: name,
      description: description,
      price: price,
      discount: discount,
      category: category,
      stock: stock,
      color: color,
      size: size,
      material: material,
      administrator: userID,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      endDiscountDate: endDiscountDate,
      likes: 0,
      dislikes: 0,
      views: 0,
      reviews: [],
   };

   products.push(product);
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

// Function to remove a product from the wishlist

function removeFromWishlist(wishlistKey) {
   let wishlist = database.ref("wishlist/" + userID + "/" + wishlistKey);

   wishlist
      .remove()
      .then(() => {
         toast("Produkti u hoq nga lista e dëshirave.");
      })
      .catch((error) => {
         console.error("Error removing product from wishlist: ", error);
      });
}

// Function to empty the cart

function emptyCart() {
   let cart = database.ref("cart/" + userID);

   cart
      .remove()
      .then(() => {
         toast("Shporta u zbraz.");
      })
      .catch((error) => {
         console.error("Error emptying cart: ", error);
      });
}

// Function to empty the wishlist

function emptyWishlist() {
   let wishlist = database.ref("wishlist/" + userID);

   wishlist
      .remove()
      .then(() => {
         toast("Lista e dëshirave u zbraz.");
      })
      .catch((error) => {
         console.error("Error emptying wishlist: ", error);
      });
}

// Function to checkout the cart

function checkoutCart() {
   location.href = "checkout";
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
   let userCart = database.ref("cart/" + userID);
   let cartItems = [];
   let cartTotal = 0;
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
      }, 300); // Adjust the duration (in milliseconds) of the animation as needed
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
            let cartItemElement = document.createElement("div");
            cartItemElement.className = "cart-item";
            let cartItemName = document.createElement("h3");
            cartItemName.textContent = productData.name;

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

function createUniqueGiftCode(percent) {
   let code = "";
   let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for (let i = 0; i < 32; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   let giftCode = {
      code: code,
      percent: percent,
      time: new Date().getTime(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      expiry: new Date().getTime() + 2592000000,
   };
   let giftCodes = database.ref("giftCodes");
   giftCodes
      .orderByChild("code")
      .equalTo(code)
      .once("value", function (snapshot) {
         if (!snapshot.exists()) {
            giftCodes
               .child(code)
               .set(giftCode)
               .then(() => {
                  toast("Kodi i dhuratës u krijua me sukses." + " Kodi: " + code);
               });
         }
      });
}
