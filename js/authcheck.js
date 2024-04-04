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
