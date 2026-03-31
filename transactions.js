// =============================
// AUTH
// =============================



if (!window.userEmail) {
  window.location.href = "login.html";
}


let transactionType = "";

// =============================
// SAVE BUTTON HANDLER
// =============================
function handleSave(){
  if (transactionType === "goal") {
    addGoal();
  } else {
    saveTransaction();
  }
}

// =============================
// SAVE TRANSACTION
// =============================
function saveTransaction() {

  let amount = amountInput.value.trim();
  let description = descInput.value.trim();

  if (!amount || !description) {
    alert("Please fill all fields");
    return;
  }

  let transaction = {
    type: transactionType,
    amount: Number(amount),
    description: description,
    category: description,
    date: new Date().toISOString()
  };

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  transactions.push(transaction);

  localStorage.setItem("transactions_" + userEmail,JSON.stringify(transactions)
  );

  modal.style.display = "none";
  amountInput.value = "";
  descInput.value = "";

  loadTransactions();
  updateDashboard();
  updateDashboardInsights();

  if (typeof updateExpenseChart === "function") {
    updateExpenseChart();
    updateHealthChart();
    updateYearlyChart();
  }
}

// =============================
// LOAD RECENT TRANSACTIONS
// =============================
function loadTransactions() {

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let container = document.getElementById("Recent-transactions-list");

  if (!container) return;

  container.innerHTML = "";

transactions.forEach(function (t, index) {
  let currentIndex = index;
    let row = document.createElement("div");
    row.classList.add("transaction");

    let amountColor = t.type === "income" ? "#10b981" : "#f97316";
    let sign = t.type === "income" ? "+" : "-";

    row.innerHTML = `
      <div class="name">${t.description}</div>
      <div class="amount" style="color:${amountColor}">
        ${sign}${formatCurrency(t.amount)}
      </div>
      <button class="delete-btn">❌</button>
    `;

    row.querySelector(".delete-btn").addEventListener("click", function () {

      // transactions.splice(currentIndex, 1);

      // localStorage.setItem("transactions_" + userEmail,JSON.stringify(transactions));

      // loadTransactions();
        // updateDashboard();
        row.querySelector(".delete-btn").addEventListener("click", function () {

  let deleted = transactions[currentIndex];

  // ❌ If system transaction → just remove visually but DO NOT affect balance
  if (deleted.system) {
    transactions.splice(currentIndex, 1);

    localStorage.setItem(
      "transactions_" + userEmail,
      JSON.stringify(transactions)
    );

    loadTransactions();

    // ❌ DO NOT call updateDashboard()
    return;
  }

  // ✅ Normal transactions
  transactions.splice(currentIndex, 1);

  localStorage.setItem(
    "transactions_" + userEmail,
    JSON.stringify(transactions)
  );

  loadTransactions();
  updateDashboard();
});
if (typeof updateExpenseChart === "function") {
        updateExpenseChart();
      }
    });

    container.appendChild(row);
  });
}

// =============================
// DASHBOARD CARDS
// =============================
function updateDashboard() {

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let income = 0;
  let expense = 0;

  transactions.forEach(function (t) {
    if (t.type === "income") income +=t.amount;
    if (t.type === "expense") expense +=t.amount;
  });

  let balance = income - expense;
  document.getElementById("total-balance").innerText =formatCurrency(balance);
  document.getElementById("total-expense").innerText = formatCurrency(expense) ;
  document.getElementById("total-income").innerText =formatCurrency(income) ;
  document.getElementById("budget-left").innerText =formatCurrency(balance) ;
}
// =============================
// Insight BOX
// =============================
function updateDashboardInsights() {
  const transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  const insightBox = document.querySelector(".insight-content");
  if (!insightBox) return;
   console.log(transactions, "transactions for insights");
  if (transactions.length === 0) {
    insightBox.innerHTML = `<p style="color:var(--card-title)">No transactions yet</p>`;
    return;
  }
console.log("Updating insights, transactions:", transactions);
  // 1️⃣ Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach(t => {
    const desc = t.description || "Other";
    if (t.type === "income") {
      totalIncome += Number(t.amount);
    } else if (t.type === "expense") {
      totalExpense += Number(t.amount);
      if (!categoryTotals[desc]) categoryTotals[desc] = 0;
      categoryTotals[desc] += Number(t.amount);
    }
  });

  // 2️⃣ Find top expense category
  let topCategory = "None";
  let topAmount = 0;
  Object.keys(categoryTotals).forEach(cat => {
    if (categoryTotals[cat] > topAmount) {
      topCategory = cat;
      topAmount = categoryTotals[cat];
    }
  });

  // 3️⃣ Percentage of income saved
  const savings = totalIncome - totalExpense;
  const savePercent = totalIncome ? Math.round((savings / totalIncome) * 100) : 0;

  // 4️⃣ Fill the box dynamically
  insightBox.innerHTML = `
    <p style="color:var(--card-title)">
      <i class="fa-solid fa-piggy-bank"></i> Savings: <span style="color:#10b981">${savePercent}%</span>
    </p>
    <p style="color:var(--card-title)">
      <i class="fa-solid fa-wallet"></i> Total Income: <span style="color:#22c55e">Rs ${totalIncome}</span>
    </p>
    <p style="color:var(--card-title)">
      <i class="fa-solid fa-credit-card"></i> Total Expense: <span style="color:#f97316">Rs ${totalExpense}</span>
    </p>
    <p style="color:var(--card-title)">
      <i class="fa-solid fa-fire"></i> Top Spending: <span style="color:#f97316">${topCategory} (Rs ${topAmount})</span>
    </p>
  `;
}



// =============================
// Filter Transactions
// =============================

function filterTransactions(filterType){

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let now = new Date();

  let filtered = transactions.filter(function(t){
    let tDate = new Date(t.date);
    
    if(filterType === "today"){
      return tDate.toDateString() === now.toDateString();
    }

    if(filterType === "week"){
      let oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return tDate >= oneWeekAgo;
    }

    if(filterType === "month"){
      return (
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear()
      );
    }

    if(filterType === "year"){
      return tDate.getFullYear() === now.getFullYear();
    }

    return true; // ALL
  });

  renderFilteredTransactions(filtered);
}
function renderFilteredTransactions(transactions){

  let container = document.querySelector(".transaction-list");
  if (!container) return;

  container.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach(function (t, index) {

    let row = document.createElement("div");
     row.classList.add("transaction-row");
       row.style.color="var(--card-title)"
    let typeClass = t.type === "income" ? "income" : "expense";

    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;

    row.innerHTML = `
      <div>${new Date(t.date).toLocaleDateString()}</div>
      <div>${t.description}</div>
      <div class="${typeClass}">${t.type}</div>
      <div class="${typeClass}">${formatCurrency(t.amount)}</div>
      <button class="delete-btn" data-index="${index}">❌</button>
    `;

    container.appendChild(row);
  });

  // ✅ UPDATE SUMMARY
  let incomeEl = document.querySelector(".Summary-income");
  let expenseEl = document.querySelector(".Summary-expense");
  let balanceEl = document.querySelector(".Summary-balance");

  if (incomeEl) incomeEl.innerText = "+" + formatCurrency(income);
  if (expenseEl) expenseEl.innerText = "-" + formatCurrency(expense);
  if (balanceEl) balanceEl.innerText = formatCurrency(income-expense);
}


// =============================
// GOALS
// =============================
let currentGoalName="";
function addGoal() {

  let goalName = descInput.value.trim();
  let targetAmount = Number(amountInput.value);

  if (goalName === "" || isNaN(targetAmount) || targetAmount <= 0) {
    alert("Please enter a valid goal name and target amount.");
    return;
  }

  let goal = {
    name: goalName,
    targetAmount: targetAmount,
    saved: 0,
    completed: false,
    halfNotified: false,     
    almostDone: false,       
    date: new Date().toISOString()
  };

  let goals =
    JSON.parse(localStorage.getItem("goals_" + userEmail)) || [];

  if (!Array.isArray(goals)) goals = [];

  goals.push(goal);

  localStorage.setItem("goals_" + userEmail, JSON.stringify(goals));

  modal.style.display = "none";
  descInput.value = "";
  amountInput.value = "";

loadDashboardGoal();
loadGoalsPage();
  
}

// =============================
// LOAD ONLY LATEST GOAL
// =============================
function loadDashboardGoal(){

  let container = document.querySelector(".Saving-goals");
  if (!container) return;

  let goals = JSON.parse(localStorage.getItem("goals_" + userEmail)) || [];

  container.innerHTML = "";

  if (goals.length === 0) return;

  let g = goals[goals.length - 1];

  container.innerHTML = `
    <h2>Saving Goal</h2>
    <div>Goal: ${g.name}</div>
   <div>${formatCurrency(g.saved)} / ${formatCurrency(g.targetAmount)}</div>
  `;
  container.style.color = "var(--card-title)";
  container.style.fontSize = "20px";
}

function loadGoalsPage(){
    let goals = JSON.parse(localStorage.getItem("goals_" + userEmail)) || [];
    localStorage.setItem("goals_" + userEmail, JSON.stringify(goals));

  let parent = document.querySelector(".Goals-container");
  if (!parent) return;
  parent.querySelectorAll(".Goal-box").forEach(el => el.remove());

  goals.forEach(g => {
    createGoalBox(g);
    if (g.saved >= g.targetAmount && !g.completed) {
    addNotification(`🎉 Congrats! Goal "${g.name}" completed!`, "goal");
    g.completed = true;
  }
  });
}

function createGoalBox(g){

  let parent = document.querySelector(".Goals-container");
  if (!parent) return;
   let savingbox=document.querySelector(".Saving-goals");
  if(savingbox==""){
  parent.innerHTML="<h2> NO Goals Yet </h2>";
 }
  let percent = g.targetAmount === 0 
    ? 0 
    : ((g.saved / g.targetAmount) * 100).toFixed(1);

   
  let container = document.createElement("div");
  container.classList.add("Goal-box","glass");
  container.style.height="180px";
   container.style.width="280px";
   container.style.color="var(--text-main)";
  container.innerHTML = `
  
   <h2>${g.name}</h2>
    <div class="progress-container" style="background:#334155;height:10px;border-radius:5px;margin:10px 0;">
      <div class="progress-bar" style="width:${percent}%;background:#818cf8;height:100%;border-radius:5px;"></div>
    </div>

    <div style="display:flex;justify-content:space-between;font-size:14px;">
      <span>${percent}% reached</span>
      <span>${g.saved} / ${g.targetAmount} PKR</span>
    </div>
    <div class="Goal-bottom-Btns">
          <button onclick="openAddFund('${g.name}')" class="add-funds-btn">+ Add Funds</button>
          <button onclick="deleteGoal('${g.name}')" class="Delete-Goal-btn">🗑 Delete Goal</button>
    </div>
  `;

  parent.appendChild(container);
}



function openAddFund(name){
  currentGoalName = name;

  let modal = document.getElementById("Goal-modal");
  let heading = document.getElementById("Goal-modal-heading");

  if (heading) {
    heading.innerText = name;   // ✅ SET HERE
  }

  if (modal) {
    modal.style.display = "block";
  }
}

function addMoneyToGoal(){
 let amount=Number(document.getElementById("Goal-modal-input").value);

 if(!amount ||amount<=0){
  alert("Enter valid amount");
  return
 }
  let goals = JSON.parse(localStorage.getItem("goals_" + userEmail)) || [];
  let goal=goals.find(g=>g.name===currentGoalName);
  if(goal){
    goal.saved+=amount;
      let percent = (goal.saved / goal.targetAmount) * 100;

  if (percent >= 50 && !goal.halfNotified) {
    addNotification(`🔥 You're 50% closer to "${goal.name}"!`, "goal");
    goal.halfNotified = true;
  }

  if (percent >= 80 && !goal.almostDone) {
    addNotification(`🚀 Almost there! "${goal.name}" is 80% done!`, "goal");
    goal.almostDone = true;
  }

  // 🎉 Completed
  if (goal.saved >= goal.targetAmount && !goal.completed) {
    addNotification(`🎉 Congrats! Goal "${goal.name}" completed!`, "goal");
    goal.completed = true;
  }
  }
  localStorage.setItem("goals_" + userEmail, JSON.stringify(goals));
   
  // ✅ CLOSE MODAL
  let modal = document.getElementById("Goal-modal");
  modal.style.display = "none";

  // ✅ CLEAR INPUT
  document.getElementById("Goal-modal-input").value = "";
  
let transactions=JSON.parse(localStorage.getItem("transactions_"+userEmail))||[];
 transactions.push({
  type:"expense",
  amount:amount,
  description:"Saved to "+currentGoalName,
  date:new Date().toISOString()
 });
 localStorage.setItem("transactions_"+userEmail,JSON.stringify(transactions));
  loadDashboardGoal();
  loadGoalsPage();
  loadTransactions();
  updateDashboard();
  updateYearlyChart(); 
}
function closeGoalModal(){
  document.getElementById("Goal-modal").style.display = "none";
}

function deleteGoal(name){
let goals=JSON.parse(localStorage.getItem("goals_"+userEmail))||[];
let goal=goals.find(g=>g.name==name);

  if(goal &&goal.saved>0){
    let transactions=JSON.parse(localStorage.getItem("transactions_"+userEmail));
    transactions.push({
      type:"income",
      amount:goal.saved,
      description:"Returned from "+name,
      date:new Date().toISOString(),
      System:true,
    });
    localStorage.setItem("transactions_"+userEmail,JSON.stringify(transactions));
    }
  // remove goal
  goals = goals.filter(g => g.name !== name);

  localStorage.setItem("goals_" + userEmail, JSON.stringify(goals));

  // refresh
  loadGoalsPage();
  loadDashboardGoal();
  loadTransactions();
  updateDashboard();
  updateYearlyChart();
}

// =============================
// TRANSACTION PAGE
// =============================
function loadAllTransactions() {

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let container = document.querySelector(".transaction-list");
  if (!container) return;

  container.innerHTML = "";

  transactions.forEach(function (t, index) {

    let row = document.createElement("div");
    row.classList.add("transaction-row");

    let typeClass = t.type === "income" ? "income" : "expense";

    row.innerHTML = `
      <div>${t.date}</div>
      <div>${t.description}</div>
      <div class="${typeClass}">${t.type}</div>
      <div class="${typeClass}">${formatCurrency(t.amount)}</div>
      <button class="delete-btn" data-index="${index}">❌</button>
    `;

    container.appendChild(row);
  });
}

// =============================
// DELETE TRANSACTION (PAGE)
// =============================
let translist = document.querySelector(".transaction-list");

if (translist) {
  translist.addEventListener("click", function (e) {

    if (e.target.classList.contains("delete-btn")) {

      let index = e.target.dataset.index;

      let transactions =
        JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

      transactions.splice(index, 1);

      localStorage.setItem(
        "transactions_" + userEmail,
        JSON.stringify(transactions)
      );

      loadAllTransactions();
      updateSummary();
    }
  });
}

// =============================
// SUMMARY
// =============================
function updateSummary(){

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let income = 0;
  let expense = 0;

  transactions.forEach(function (t) {
    if (t.type === "income") {
      income += t.amount;
     }
    if (t.type === "expense"){
      expense += t.amount;
    }

  });

let incomeEl = document.querySelector(".Summary-income");
let expenseEl = document.querySelector(".Summary-expense");
let balanceEl = document.querySelector(".Summary-balance");

if (incomeEl) {
 incomeEl.innerText = "+" +formatCurrency(income);
}

if (expenseEl){
expenseEl.innerText = "-" +formatCurrency(expense);
} 

if (balanceEl) {
   balanceEl.innerText = formatCurrency(income-expense );
}
};

// Budget PAge
 function displayBugetModal(){
  let modal=document.querySelector(".Budget-Modal");
   modal.style.display="block";
 }
 function calculateBudgetSpent(name) {
    let transactions = JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

    return transactions.reduce((total, t) => {
        if (t.description.toLowerCase().trim() === name.toLowerCase().trim() && t.type === "expense") {
            return total + Number(t.amount);
        }
        return total;
    }, 0);
}
 function SaveBudget(){
  
     let name= document.getElementById("BudgetName").value;
     let Maxamount=document.getElementById("BudgetAmount").value;
     
     let budgets=JSON.parse(localStorage.getItem("budgets_"+userEmail))||[];
     
   budgets.push({
   name: name,
   max: Number(Maxamount),
     });
    localStorage.setItem("budgets_"+userEmail,JSON.stringify(budgets));
    renderBudget();
   
     let modal=document.querySelector(".Budget-Modal");
      modal.style.display="none";
      document.getElementById("BudgetName").value = "";
      document.getElementById("BudgetAmount").value = "";
    }

//     function renderBudget(){
//       let parent=document.querySelector(".Budget-container");
//        if(!parent) return;
//        parent.innerHTML = "";
//         let budgets = JSON.parse(localStorage.getItem("budgets_" + userEmail)) || [];
//        if (!Array.isArray(budgets)) {
//         budgets = [];
//         }
//          budgets.forEach(b=>{ 
//           let saved=calculateBudgetSpent(b.name);
//         let percent=b.max>0 ?(saved/b.max)*100:0;
//         let leftAmount=b.max-saved;
//           if (percent >= 80 && percent < 100 && !b.warned80) {
//          addNotification(`⚠️ Budget "${b.name}" reached ${percent.toFixed(0)}%`, "budget");
//          b.warned80 = true;
//          }

//         if (percent >= 100 && !b.warned100) {
//         addNotification(`🚨 Budget "${b.name}" exceeded!`);
//         b.warned100 = true;
//         }
//         localStorage.setItem("budgets_" + userEmail, JSON.stringify(budgets));
//       let container=document.createElement("div");
//      container.classList.add("Budget-box","glass");
    
//      container.innerHTML=`
//         <div class="Budget-head">
//             <h2>${b.name}</h2>
//              <button class="budget-delete-btn" title="Delete Budget">🗑️ Delete Budget </button>
//         </div>
  
//         <div class="budget-card-inner">
    
//             <!-- LEFT SECTION -->
//     <div class="budget-left">
//       <div class="budget-icon">
//         <span class="budget-icon-emoji">${b.icon || "💰"}</span>
//       </div>
//       <div class="budget-info">
//         <div class="budget-bar-track">
//           <div class="budget-bar-fill" style="width:${Math.min(percent,100)}%"></div>
//         </div>
//         <span class="budget-left-text">${leftAmount.toLocaleString()} PKR left &nbsp; ${percent.toFixed(0)}%</span>
//       </div>
//     </div>

//     <!-- RIGHT SECTION -->
//     <div class="budget-right">
//       <span class="budget-Max-amount">${formatCurrency(saved)} / <strong>${formatCurrency(b.max)}</strong></span>
//       <div class="circle-progress" data-percent="${Math.min(percent,100).toFixed(0)}">
//         <span class="circle-text">${Math.min(percent,100).toFixed(0)}%</span>
//       </div>
//       <span class="budget-status"></span>
//     </div>

//   </div>

    
         
        
//      `
//      // Color the bar based on percent
// const barFill = container.querySelector(".budget-bar-fill");
// const statusEl = container.querySelector(".budget-status");
// const leftText = container.querySelector(".budget-left-text");
// const circle = container.querySelector(".circle-progress");

// let barColor, circleColor;

// if (percent > 100) {
//   barColor = "#ef4444";
//   circleColor = "#ef4444, #f97316";
//   statusEl.innerHTML = `⚠️ <span style="color:#ef4444">Over budget by ${Math.abs(leftAmount).toLocaleString()} PKR</span>`;
//   leftText.style.color = "#ef4444";
// } else if (percent >= 80) {
//   barColor = "#f97316";
//   circleColor = "#f97316, #ef4444";
//   statusEl.innerHTML = `↑ <span style="color:#f97316">${leftAmount.toLocaleString()} PKR left</span>`;
//   leftText.style.color = "#f97316";
// } else {
//   barColor = "#818cf8";
//   circleColor = "#818cf8, #a78bfa";
//   statusEl.innerHTML = `↑ <span style="color:#10b981">${leftAmount.toLocaleString()} PKR left</span>`;
//   leftText.style.color = "#10b981";
// }

// barFill.style.background = barColor;

// const displayPercent = Math.min(percent, 100);
// circle.style.background = `conic-gradient(${circleColor} ${displayPercent}%, #1e293b ${displayPercent}%)`;

// // // Delete button
// // const deleteBtn = container.querySelector(".budget-delete-btn");
// // deleteBtn.addEventListener("click", () => {
// //   let budgets = JSON.parse(localStorage.getItem("budgets_" + userEmail)) || [];
// //   budgets = budgets.filter(item => item.name !== b.name);
// //   localStorage.setItem("budgets_" + userEmail, JSON.stringify(budgets));
// //   renderBudget();
// // });
      
// //   parent.appendChild(container); 
// //         });
//     // ✅ Attach delete event directly using captured `b`
//     container.querySelector(".budget-delete-btn").addEventListener("click", () => {
//       let budgets = JSON.parse(localStorage.getItem("budgets_" + userEmail)) || [];
//       budgets = budgets.filter(item => item.name !== b.name); // remove only THIS budget
//       localStorage.setItem("budgets_" + userEmail, JSON.stringify(budgets));
//       renderBudget(); // re-render
//     });

//     parent.appendChild(container);
//   });
// }

function renderBudget() {
  let parent = document.querySelector(".Budget-container");
  if (!parent) return;

  parent.innerHTML = ""; // clear old

  let budgets = JSON.parse(localStorage.getItem("budgets_" + userEmail)) || [];
  if (!Array.isArray(budgets)) budgets = [];

  budgets.forEach(b => {
    let saved = calculateBudgetSpent(b.name);
    let percent = b.max > 0 ? (saved / b.max) * 100 : 0;
    let leftAmount = b.max - saved;

    if (percent >= 80 && percent < 100 && !b.warned80) {
      addNotification(`⚠️ Budget "${b.name}" reached ${percent.toFixed(0)}%`, "budget");
      b.warned80 = true;
    }

    if (percent >= 100 && !b.warned100) {
      addNotification(`🚨 Budget "${b.name}" exceeded!`);
      b.warned100 = true;
    }

    localStorage.setItem("budgets_" + userEmail, JSON.stringify(budgets));

    // Create container
    let container = document.createElement("div");
    container.classList.add("Budget-box", "glass");

    container.innerHTML = `
      <div class="Budget-head" style="display:flex;justify-content:space-between;align-items:center;">
          <h2>${b.name}</h2>
          <button class="budget-delete-btn" style="margin-left:10px;">🗑️ Delete</button>
      </div>
      <div class="budget-card-inner">
          <div class="budget-left">
              <div class="budget-icon">
                  <span class="budget-icon-emoji">${b.icon || "💰"}</span>
              </div>
              <div class="budget-info">
                  <div class="budget-bar-track">
                      <div class="budget-bar-fill" style="width:${Math.min(percent,100)}%"></div>
                  </div>
                  <span class="budget-left-text">${leftAmount.toLocaleString()} PKR left &nbsp; ${percent.toFixed(0)}%</span>
              </div>
          </div>
          <div class="budget-right">
              <span class="budget-Max-amount">${formatCurrency(saved)} / <strong>${formatCurrency(b.max)}</strong></span>
              <div class="circle-progress" data-percent="${Math.min(percent,100).toFixed(0)}">
                  <span class="circle-text">${Math.min(percent,100).toFixed(0)}%</span>
              </div>
              <span class="budget-status"></span>
          </div>
      </div>
    `;

    // Style the bar and circle
    const barFill = container.querySelector(".budget-bar-fill");
    const statusEl = container.querySelector(".budget-status");
    const leftText = container.querySelector(".budget-left-text");
    const circle = container.querySelector(".circle-progress");

    let barColor, circleColor;

    if (percent > 100) {
      barColor = "#ef4444";
      circleColor = "#ef4444, #f97316";
      statusEl.innerHTML = `⚠️ <span style="color:#ef4444">Over budget by ${Math.abs(leftAmount).toLocaleString()} PKR</span>`;
      leftText.style.color = "#ef4444";
    } else if (percent >= 80) {
      barColor = "#f97316";
      circleColor = "#f97316, #ef4444";
      statusEl.innerHTML = `↑ <span style="color:#f97316">${leftAmount.toLocaleString()} PKR left</span>`;
      leftText.style.color = "#f97316";
    } else {
      barColor = "#818cf8";
      circleColor = "#818cf8, #a78bfa";
      statusEl.innerHTML = `↑ <span style="color:#10b981">${leftAmount.toLocaleString()} PKR left</span>`;
      leftText.style.color = "#10b981";
    }

    barFill.style.background = barColor;
    const displayPercent = Math.min(percent, 100);
    circle.style.background = `conic-gradient(${circleColor} ${displayPercent}%, #1e293b ${displayPercent}%)`;

    // ✅ Attach delete to THIS box only
    container.querySelector(".budget-delete-btn").addEventListener("click", () => {
      let budgets = JSON.parse(localStorage.getItem("budgets_" + userEmail)) || [];
      budgets = budgets.filter(item => item.name !== b.name);
      localStorage.setItem("budgets_" + userEmail, JSON.stringify(budgets));
      renderBudget(); // re-render
    });

    parent.appendChild(container);
  });
}

// --- INITIALIZATION LOGIC ---
// This waits for the HTML to be fully loaded before running any JS
document.addEventListener("DOMContentLoaded", () => {

  // Dashboard
  if (document.getElementById("total-balance")) {
    updateDashboard();
    loadTransactions();
    loadDashboardGoal();
    updateDashboardInsights(); 
  }

  // Transactions page
  if (document.querySelector(".transaction-list")) {
    filterTransactions('all');
    loadAllTransactions();
    updateSummary();
  }

  // Budget page
  if (document.querySelector(".Budget-container")) {
    renderBudget();
  }

  // Goals page
  if (document.querySelector(".Goals-container")) {
    loadGoalsPage();
  }

  // Dashboard charts
  if (typeof updateExpenseChart === "function") {
    updateExpenseChart();
  }
  if (typeof updateHealthChart === "function") {
    updateHealthChart();
  }

  // Analytics page ← THIS WAS MISSING
  if (typeof initAnalytics === "function") {
    initAnalytics();
  }
  

});

