firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      console.log("User is logged in!");
   } else {
      console.log("User is not logged in!");

      document.getElementById(
         "account"
      ).innerHTML = `<i class="fa-solid fa-right-to-bracket" onclick="goLogin()"></i>`;
   }
});

function logOut() {
   let conf = confirm("Are you sure you want to log out?");

   if (!conf) {
      return;
   }

   location.href = "./account/index.html";
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

function goLogin() {
   location.href = "./account/index.html";
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

addProductF("visits");
