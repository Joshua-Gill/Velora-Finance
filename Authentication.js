function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || {};
}

function toggleTheme() {
  let toggleBtn=document.querySelector(".dark-mode-toggle");
  document.body.classList.toggle("light-mode");
   
  // Save user preference
  if (document.body.classList.contains("light-mode")) {
        toggleBtn.innerText=" 🌙 Dark Mode";
        localStorage.setItem("theme", "light");
  } else {
    toggleBtn.innerText=" 🌙 Light Mode";
    localStorage.setItem("theme", "dark");

  }
}

let savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

let currentUser=getCurrentUser();
let SwitchBtn=document.getElementById("switch-account-btn");
let SwitchModal=document.getElementById("switch-modal");
const user = getCurrentUser();
window.userEmail = user ? user.email : "";

// User Authentication
function signup(){

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let emailExists = users.find(user => user.email === email);

  if(emailExists){
    alert("Email already exists. Please login.");
    window.location.href="login.html";
    return;
  }

  users.push({
    email: email,
    password: password
  });

  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful! Please login.");
  window.location.href = "login.html";
}
function login(){

  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let currentUser = getCurrentUser();

   if(currentUser && currentUser.email){
     window.location.href = "dashboard.html";
};


  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = users.find(
    u => u.email === email && u.password === password
  );

  if(user){

    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Login Successful!");
    window.location.href = "dashboard.html";

  }else{
    alert("Invalid email or password");
  }  
}
// signout 
function signout(){
  let currentUser = getCurrentUser();
  localStorage.removeItem("currentUser");
  alert("Signed out successfully!");
  window.location.href="login.html";
}
// switch account
function switchAccount(){
  document.getElementById("switch-modal").style.display = "block";
  loadAccounts();
}
function loadAccounts(){

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = getCurrentUser();

  let container = document.getElementById("account-list");

  container.innerHTML = "";

  users.forEach(function(user){

    // skip currently logged-in account
    if(currentUser && user.email === currentUser.email){
      return;
    }

    let div = document.createElement("div");

    div.classList.add("account-item");

    div.innerText = user.email;

    div.onclick = function(){
      loginWithAccount(user.email);
    };

    container.appendChild(div);

  });
}
// hides the switch modal 
if (SwitchBtn && SwitchModal) {
    SwitchBtn.addEventListener("mouseenter", function(){
        SwitchModal.classList.add("show");
    });

    SwitchModal.addEventListener("mouseleave", function(){
        SwitchModal.classList.remove("show");
    });
}

 function loginWithAccount(email){
  let password=prompt("Enter password for " + email);
  let users=JSON.parse(localStorage.getItem("users")) || [];
  let user=users.find(u => u.email === email && u.password === password);
  if(user){
    localStorage.setItem("currentUser", JSON.stringify(user));
    alert("Switched to " + email);
     location.reload();
  }
  else{
    alert("Incorrect password");
  }
}
function addAccount(){
  window.location.href="Signup.html";
}

if(currentUser){

  let username = currentUser.email.split("@")[0];

  document.getElementById("welcome-user").innerText = "👤 " + username;
 
   let displayEmail=document.getElementById("account-email");
     displayEmail.style.color="white";
     displayEmail.innerText =`Email: ${currentUser.email}`;
}

document.querySelector(".dashboard-email")
        .addEventListener("mouseover", function(){
              let menu=document.getElementById("dropdown");
              menu.classList.toggle("show");
         })
// checking user sign in or not 
function checkAuth(){

  

  if(!currentUser){
    alert("Please sign in first");
    window.location.href = "Signup.html";
  }

}
let dashEmail = document.querySelector(".dashboard-email");

if(dashEmail){
  dashEmail.addEventListener("mouseover", function(){
    let menu=document.getElementById("dropdown");
    menu.classList.toggle("show");
  });
}
