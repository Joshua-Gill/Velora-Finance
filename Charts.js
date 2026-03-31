let expenseChart = null;
let healthChart = null;
let monthlyChartInstance = null;
// =============================
// AUTH CHECK
// =============================
if (window.location.pathname.includes("index.html")) {
  checkAuth();
}

// =============================
// GET DATA
// =============================
function getDynamicExpenseData(){

let transactions =
JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

let categories = {};

transactions.forEach(function(t){

  if(t.type === "expense"){

    let key = t.description.toLowerCase();

    if(!categories[key]){
      categories[key] = 0;
    }

    categories[key] += t.amount;

  }

});

return {
  labels: Object.keys(categories),
  values: Object.values(categories)
};

}

// =============================
// CREATE CHART (ONLY ONCE)
// =============================




const isLight = document.body.classList.contains("light-mode");

function createExpenseChart(isLight){

  let ctx = document.getElementById("expenseChart");
  if (!ctx) return;

  // ✅ DESTROY OLD CHART
  if (expenseChart) {
    expenseChart.destroy();
  }

  let data = getDynamicExpenseData();

  expenseChart = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:data.labels,
      datasets:[{
        data:data.values,
        backgroundColor:[
          "#8b5cf6","#06b6d4","#f472b6",
          "#22c55e","#f59e0b","#3b82f6","#ef4444"
        ],
        borderWidth:0
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{ color: isLight ? "#1e293b" : "#e2e8f0" }
        }
      }
    }
  });
}

// =============================
// UPDATE CHART (REAL FIX)
// =============================
function updateExpenseChart() {
  let ctx = document.getElementById("expenseChart"); 
  if (!ctx) return;

  let data = getDynamicExpenseData();
  expenseChart.data.labels = data.labels;
  expenseChart.data.datasets[0].data = data.values;
  expenseChart.update();
  updateExpenseList();
}

// =============================
// UPDATE EXPENSE LIST
// =============================
function updateExpenseList(){
if (!expenseChart) return; 
let transactions =
JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

let categories = {};
let total = 0;

transactions.forEach(function(t){

  if(t.type === "expense"){

    let key = t.description.toLowerCase();

    if(!categories[key]){
      categories[key] = 0;
    }

    categories[key] += t.amount;
    total += t.amount;

  }

});

let container = document.querySelector(".expense-list");

if(!container) return;

container.innerHTML = "";

if(total === 0){
  container.innerHTML = "<p>No expenses yet</p>";
 
  container.style.fontSize="20px";
  container.style.color="#10b981"

  return;
}

Object.keys(categories).forEach(function(cat){

  let percent = ((categories[cat] / total) * 100).toFixed(1);

  let row = document.createElement("div");
  row.classList.add("expense-item");

  row.innerHTML = `
    <span class="name">${cat}</span>
    <span class="percent">${percent}%</span>
  `;

  container.appendChild(row);

});

}

// =============================
// HEALTH GRAPH 
// =============================
const healthCtx = document.getElementById("healthChart");



function createHealthChart(){
let healthCtx = document.getElementById("healthChart"); // ← get it fresh here
  if (!healthCtx) return;


let data = getHealthTrend();

healthChart = new Chart(healthCtx, {
  type: "line",

  data: {
    labels: data.labels,
    datasets: [{
      data: data.healthData,
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139,92,246,0.2)",
      tension: 0.4,
      fill: true
    }]
  },

  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins:{ legend:{display:false} },
    scales:{
      x:{display:false},
      y:{display:false}
    }
  }

});
}


function calculateHealth(){
  transactions=JSON.parse(localStorage.getItem("transactions_"+ userEmail)) || [];
  let income=0;
  let expense=0;

  transactions.forEach(function(t){
    if(t.type==="income"){
      income+=t.amount;
    }
    if(t.type==="expense"){
      expense+=t.amount;
    }
  });
  let savings=income - expense;
   if(income===0){
    return 0;
   }
   let health=(savings/income)*100;
   return health.toFixed(1);
  }
  
 function updateFinancialHealth(){

let healthData = getHealthTrend().healthData;

if(healthData.length === 0) return;
let latest = Number(healthData[healthData.length - 1]);;

let element = document.getElementById("health-text");

if(!element) return;

if(latest > 50){
  element.innerText = "Excellent 🟢";
}
else if(latest > 20){
  element.innerText = "Good 🟡";
}
else{
  element.innerText = "Poor 🔴";
}

}
function getHealthTrend(){

let transactions =
JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

let income = 0;
let expense = 0;

let healthData = [];
let labels = [];

transactions.forEach((t, index) => {

  if(t.type === "income") income += t.amount;
  if(t.type === "expense") expense += t.amount;

  let savings = income - expense;

  let health = income === 0 ? 0 : (savings / income) * 100;

  healthData.push(health.toFixed(1));
  labels.push("T" + (index + 1)); // Transaction 1,2,3...

});

return {labels, healthData};

}
function updateHealthChart(){

if(!healthChart){
  createHealthChart();
  return;
}

let data = getHealthTrend();

healthChart.data.labels = data.labels;
healthChart.data.datasets[0].data = data.healthData;

let healthScore = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
let circle = document.querySelector(".circle span");
if(circle) {
    circle.innerText = healthScore;
    circle.parentElement.style.borderColor = healthScore > 20 ? "#10b981" : "#f97316";
}

healthChart.update();
updateFinancialHealth();

}
function loadAnalyticsSummary() {
   
   
    let incomeEl = document.getElementById("totalIncome");
    let expenseEl = document.getElementById("totalExpense");
    if (!incomeEl || !expenseEl) return;

     let transactions = JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];
    let income = 0;
    let expense = 0;
 
    transactions.forEach(t => {
        if (t.type === "income") {
            income += Number(t.amount);
        } else {
            expense += Number(t.amount);
        }
    });

    document.getElementById("totalIncome").innerText = "Rs. " + income;
    document.getElementById("totalExpense").innerText = "Rs. " + expense;
}
function getCategoryData() {
    let transactions = JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

    let categories = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            let cat = t.description || "Other";

            if (!categories[cat]) {
                categories[cat] = 0;
            }

            categories[cat] += Number(t.amount);
        }
    });

    return categories;
}
function loadExpenseDonut() {

  let canvas = document.getElementById("expenseDonut");

    if (!canvas) return;
    let data = getCategoryData();

    let labels = Object.keys(data);
    let values = Object.values(data);

    new Chart(document.getElementById("expenseDonut"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ["#22c55e", "#a855f7", "#ec4899", "#38bdf8"]
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            }
        }
    });
}
function getMonthlyData() {
    let transactions = JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

    let months = [0,0,0,0,0,0,0,0,0,0,0,0];
     if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    transactions.forEach(t => {
        if (t.type === "expense") {
            let date = new Date(t.date);
            let month = date.getMonth();

            months[month] += Number(t.amount);
        }
    });

    return months;
}
function loadMonthlyChart() {
   let canvas = document.getElementById("monthlyChart");

    if (!canvas) return;
    let data = getMonthlyData();

    new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                data: data,
                backgroundColor: "#8b5cf6"
            }]
        }
    });
}
function updateAnalytics() {

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let income = 0;
  let expense = 0;

  transactions.forEach(function (t) {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;
  });

  let balance = income - expense;

 let Expenses=document.getElementById("Analytics-Expense");
  let total=document.getElementById("Analytics-Total");
  Expenses.style.color="#f97316"
  total.style.color="#10b981"
  Expenses.innerText = expense + " PKR";
  total.innerText = income + " PKR";
  
}
// =============================
// YEARLY GRAPH (DYNAMIC)
// =============================

let yearlyChartInstance;

// 🔹 Get real monthly data
function getYearlyData() {

  let transactions =
    JSON.parse(localStorage.getItem("transactions_" + userEmail)) || [];

  let now = new Date();
  let currentYear = now.getFullYear();

  let monthlyData = new Array(12).fill(0);

  transactions.forEach(t => {
    let date = new Date(t.date);

    if (date.getFullYear() === currentYear) {
      let month = date.getMonth(); // 0–11

      if (t.type === "income") {
        monthlyData[month] += Number(t.amount);
      }

      if (t.type === "expense") {
        monthlyData[month] -= Number(t.amount);
      }
    }
  });

  return monthlyData;
}

// 🔹 Create / Update chart
function updateYearlyChart() {

  let ctx = document.getElementById("yearlyChart");
  if (!ctx) return;

  let monthlyData = getYearlyData();

  // destroy old chart if exists
  if (yearlyChartInstance) {
    yearlyChartInstance.destroy();
  }

  yearlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
      ],
      datasets: [{
        label: "Balance Flow",
        data: monthlyData,
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#8b5cf6"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
}

// =============================
// INIT (RUN WHEN PAGE LOADS)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  updateYearlyChart();
});
// =============================
// INITIAL LOAD
// =============================
document.addEventListener("DOMContentLoaded", () => {

  // Dashboard chart
  let expenseCanvas = document.getElementById("expenseChart");
  if (expenseCanvas) {
    const isLight = document.body.classList.contains("light-mode");
    createExpenseChart(isLight);
    updateExpenseList();
  }

  // Health chart
  let healthCanvas = document.getElementById("healthChart");
  if (healthCanvas) {
    createHealthChart();
    updateFinancialHealth();
  }

    if (document.getElementById("yearlyChart")) {
        updateYearlyChart();
}

  // Analytics page
  if (document.getElementById("expenseDonut")) {
    loadAnalyticsSummary();
    loadExpenseDonut();
    loadMonthlyChart();
    updateAnalytics();
  }

});

  




