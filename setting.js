 settings = JSON.parse(localStorage.getItem("notificationSettings"));

if (!settings) {
  settings = {
    budget: false,
    goal: false,
    summary: false
  };
  localStorage.setItem("notificationSettings", JSON.stringify(settings));
}
document.addEventListener("DOMContentLoaded", async () => {
  await initCurrency();
   let bellIcon = document.querySelector(".bell-icon");
  let notificationBox = document.querySelector(".notification-container");

  if (bellIcon && notificationBox) {

    bellIcon.addEventListener("mouseenter", () => {
      notificationBox.style.display = "block";
    });

    bellIcon.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!notificationBox.matches(":hover")) {
          notificationBox.style.display = "none";
        }
      }, 100);
    });
   }
    notificationBox.addEventListener("mouseenter", () => {
      notificationBox.style.display = "block";
    });

  let settings = JSON.parse(localStorage.getItem("notificationSettings")) || {};

  let budgetToggle = document.getElementById("budgetToggle");
  let goalToggle = document.getElementById("goalToggle");
   let summaryToggle = document.getElementById("summaryToggle");

  if (budgetToggle) {
    toggleSwitchUI(budgetToggle, settings.budget);

    budgetToggle.addEventListener("click", () => {
      let newValue = !settings.budget;
      settings.budget = newValue;

      localStorage.setItem("notificationSettings", JSON.stringify(settings));
      toggleSwitchUI(budgetToggle, newValue);
    });
  }
  if (goalToggle) {
    toggleSwitchUI(goalToggle, settings.goal);

    goalToggle.addEventListener("click", () => {
      let newValue = !settings.goal;
      settings.goal = newValue;

      localStorage.setItem("notificationSettings", JSON.stringify(settings));
      toggleSwitchUI(goalToggle, newValue);
    });
  }
 if (summaryToggle) {
  toggleSwitchUI(summaryToggle, settings.summary);

  summaryToggle.addEventListener("click", () => {
    let newValue = !settings.summary;
    settings.summary = newValue;

    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    toggleSwitchUI(summaryToggle, newValue);
  });
}
  try {
    let currencyDropdown = document.getElementById("currencySelect");

    if (currencyDropdown) {
       let saved = localStorage.getItem("currency") || "PKR";
        currencyDropdown.value = saved;
    
       currencyDropdown.addEventListener("change", function(e) {
       localStorage.setItem("currency", e.target.value);
       location.reload(); 
});
    }
  } catch (err) {
    console.error("Currency error:", err);
  }
  loadNotifications();
  updateNotificationBadge();
});
// Profile box
if(currentUser.email){
    let name=currentUser.email.split("@")[0];
    let initial=name.charAt(0).toUpperCase();
 document.querySelector(".Profile-icon").textContent=initial;
document.getElementById("userName").innerText=name;
document.getElementById("userEmail").innerText=currentUser.email;
    
}
const editBtn = document.getElementById("editProfile");
const ProfileModal = document.getElementById("editModal");
const closeBtn = document.getElementById("closeModal");
const saveBtn = document.getElementById("saveProfile");

editBtn.addEventListener("click", () => {
  let currentUser = getCurrentUser();

  
    document.getElementById("editPassword").value=currentUser.password || "";
    ProfileModal.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
  ProfileModal.style.display = "none";
});

saveBtn.addEventListener("click", () => {
  let currentUser =getCurrentUser();


  let newPass=document.getElementById("editPassword").value;
  currentUser.password=newPass;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

 ProfileModal.style.display = "none";
  location.reload(); // refresh UI
});

//Changing Currencuy
async function getRates(){
 let res=await fetch("https://api.exchangerate-api.com/v4/latest/PKR");
 let data= await res.json();
  localStorage.setItem("rates",JSON.stringify(data.rates));
}
function convert(amount, currency) {
  let rates = JSON.parse(localStorage.getItem("rates"));

  return (amount * rates[currency]).toFixed(2);
}
async function initCurrency() {
  let lastFetch = localStorage.getItem("ratesTime");

  if (!lastFetch || Date.now() - lastFetch > 86400000) {
    await getRates(); 
    localStorage.setItem("ratesTime", Date.now());
  }
}
function getSelectedCurrency() {
  let stored = localStorage.getItem("currency");

  if (!stored) {
    return "PKR";
  }

  return stored;
}
function getRatesFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("rates")) || {};
  } catch {
    return {};
  }
}
function formatCurrency(amount) {
  let selectedCurrency = getSelectedCurrency();
  let rates = getRatesFromStorage();

  if (!rates || Object.keys(rates).length === 0) {
    return amount.toFixed(2) + " PKR";
  }

  if (!rates[selectedCurrency]) {
    return amount.toFixed(2) + " PKR";
  }

  let converted = amount * rates[selectedCurrency];
  return converted.toFixed(2) + " " + selectedCurrency;
}
console.log("Currency in storage:", localStorage.getItem("currency"));


function addNotification(message, type) {
  let settings = JSON.parse(localStorage.getItem("notificationSettings")) || {};

  
  if (settings[type] === false) return;

  let notifications = JSON.parse(localStorage.getItem("notifications_" + userEmail)) || [];

  notifications.unshift({
    message,
    type,
    date: new Date().toISOString()
  });

  localStorage.setItem("notifications_" + userEmail, JSON.stringify(notifications));

  updateNotificationBadge(); 
}
function loadNotifications() {
  let container = document.querySelector(".notification-container");
  if (!container) return;

  let notifications = JSON.parse(localStorage.getItem("notifications_"+userEmail)) || [];

  container.innerHTML = "<h2>Notifications</h2>";

  if (notifications.length === 0) {
    container.innerHTML += "<p>No Notifications</p>";
    return;
  }

  notifications.forEach(n => {
    let div = document.createElement("div");
    div.classList.add("notification-item");

    div.innerHTML = `
      <p>${n.message}</p>`;

    container.appendChild(div);
  });
}

// badge 
function updateNotificationBadge() {
  let badge = document.querySelector(".notification-badge");

  let notifications = JSON.parse(localStorage.getItem("notifications_" + userEmail)) || [];

  if (!badge) return;

  if (notifications.length === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "block";
    badge.innerText = notifications.length;
  }
}

function saveNotificationSetting(type, value) {
  let settings = JSON.parse(localStorage.getItem("notificationSettings")) || {};

  settings[type] = value;

  localStorage.setItem("notificationSettings", JSON.stringify(settings));
}

// hiding notification on mouse leave
let bellIcon = document.querySelector(".bell-icon");
let notificationBox = document.querySelector(".notification-container");

if (bellIcon && notificationBox) {

  bellIcon.addEventListener("mouseenter", () => {
    notificationBox.style.display = "block";
  });

  bellIcon.addEventListener("mouseleave", () => {
    setTimeout(() => {
      if (!notificationBox.matches(":hover")) {
        notificationBox.style.display = "none";
      }
    }, 200);
  });

  notificationBox.addEventListener("mouseleave", () => {
    notificationBox.style.display = "none";
  });

  notificationBox.addEventListener("mouseenter", () => {
    notificationBox.style.display = "block";
  });
}
// toggel UI change
function toggleSwitchUI(element, isOn) {
  if (isOn) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}
  //Clear Data
  function clearAllData(){
   let currentUser=JSON.parse(localStorage.getItem("currentUser"))||[];
   let email=currentUser.email;
   let useremail=email;
     localStorage.removeItem("transactions_"+useremail);
     location.reload();
  }