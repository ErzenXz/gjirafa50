const database = firebase.database();

let products = database.ref("products");

let urlParams = new URLSearchParams(window.location.search);
let categoryParam = urlParams.get("category");
let searchParam = urlParams.get("search");

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
   searchProducts(searchParam);
}
