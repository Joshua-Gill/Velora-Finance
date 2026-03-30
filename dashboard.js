// buttons to open transaction modal
let amountInput = document.getElementById("amount");
let descInput = document.getElementById("description");
let modal = document.getElementById("transaction-modal");
let title = document.querySelector(".modal-title");

let addExpenseBtn = document.querySelector(".add-Expense");
if (addExpenseBtn) {
    addExpenseBtn.addEventListener("click", function() {
      let transactions = JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];
      let balance = transactions.reduce((total, t) => {
         return t.type === "income" ? total + t.amount : total - t.amount;
      }, 0);
 localStorage.setItem("transactions_" + userEmail,JSON.stringify(transactions));
if (balance <= 0) {
    alert("You don't have enough balance to add expense");
    return;
}
    document.getElementById("transaction-modal").style.display = "block";
   title.innerText="Add Expense";
    // modal.style.left="29%";
    amountInput.placeholder="Enter Expense Amount";
    descInput.placeholder="Description of Expense";
    transactionType="expense";
    }
)};
let addIncomeBtn=document.querySelector(".add-Income");
if(addIncomeBtn){
  addIncomeBtn.addEventListener("click", function(){
  document.getElementById("transaction-modal").style.display = "block";
    title.innerText="Add Income";
    amountInput.placeholder="Enter Income Amount";
    descInput.placeholder="Description of Income";
    // modal.style.left="47%";
    transactionType="income";
    }
)};
 let transferBtn=document.querySelector(".add-Transfer")


if (transferBtn) {
  transferBtn.addEventListener("click", function(){
  document.getElementById("transaction-modal").style.display = "block";
    title.style.color="red"; 
    title.innerText="Add Transfer is curently disabled";
    amountInput.style.display="none",
    descInput.style.display="none",
    // modal.style.left="67%";
    transactionType="transfer";
    document.querySelector(".save-btn").style.display="none";
    }
)};
let addGoalBtn = document.querySelector(".add-goal-btn");

if (addGoalBtn) {
  addGoalBtn.addEventListener("click", function(){
    modal.style.display = "block";
      // modal.style.left="85%";
    title.innerText = "Add Goal";
    amountInput.placeholder = "Target Amount";
    descInput.placeholder = "Goal Name";
    transactionType = "goal";
  });
}
let GoalBtn = document.getElementById("Goal-Btn");

if (GoalBtn) {
  GoalBtn.addEventListener("click", function(){

    modal.style.display = "block";
    title.innerText = "Add Goal";

    amountInput.placeholder = "Target Amount";
    descInput.placeholder = "Goal Name";

    transactionType = "goal";
  });
}
// Hiding Transaction modal 
window.addEventListener("click", function(e){
  if(e.target === modal){
    modal.style.display = "none";
  }
});
// Hiding switch modal
window.addEventListener("click", function(e) {
  let modal = document.querySelector(".switch-modal");
  let content = document.querySelector(".Modal-Content");

  if (e.target === modal) {
    modal.style.display = "none";
  }
}); 

document.addEventListener("DOMContentLoaded",() => {
   updateDashboard();
  loadTransactions();
  loadDashboardGoal();

  if (typeof updateExpenseChart === "function") {
    updateExpenseChart();
  }
});


