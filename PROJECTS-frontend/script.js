const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// Initialize empty transactions array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Chart.js setup
const spendingTrendChart = new Chart(document.getElementById('spendingTrend'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Spending Over Time',
      data: [],
      borderColor: 'blue',
      fill: false
    }]
  }
});

const categoryBreakdownChart = new Chart(document.getElementById('categoryBreakdown'), {
  type: 'pie',
  data: {
    labels: ['Food', 'Transport', 'Entertainment', 'Others'],
    datasets: [{
      label: 'Spending by Category',
      data: [0, 0, 0, 0], // Will update dynamically
      backgroundColor: ['red', 'green', 'blue', 'gray']
    }]
  }
});

const expenseVsBudgetChart = new Chart(document.getElementById('expenseVsBudget'), {
  type: 'bar',
  data: {
    labels: ['Food', 'Transport', 'Entertainment'],
    datasets: [{
      label: 'Budgeted Amount',
      data: [100, 50, 80], // Example budget values
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 1
    },
    {
      label: 'Actual Spending',
      data: [0, 0, 0], // Will update dynamically
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  }
});

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a description and amount');
    return;
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: 'Food' // For simplicity, assuming 'Food' as category
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateCharts();
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `${transaction.text} <span>${sign}₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>`;
  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const incomeTotal = amounts.filter(a => a > 0).reduce((acc, val) => acc + val, 0).toFixed(2);
  const expenseTotal = (
    amounts.filter(a => a < 0).reduce((acc, val) => acc + val, 0) * -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  income.innerText = `₹${incomeTotal}`;
  expense.innerText = `₹${expenseTotal}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateCharts() {
  // Update spending trend chart
  const labels = transactions.map(t => new Date(t.id).toLocaleDateString());
  const spendingAmounts = transactions.map(t => t.amount);
  spendingTrendChart.data.labels = labels;
  spendingTrendChart.data.datasets[0].data = spendingAmounts;
  spendingTrendChart.update();

  // Update category breakdown chart
  const categoryCounts = {
    'Food': 0,
    'Transport': 0,
    'Entertainment': 0,
    'Others': 0
  };

  transactions.forEach(t => {
    categoryCounts[t.category] += t.amount;
  });

  categoryBreakdownChart.data.datasets[0].data = [
    categoryCounts['Food'],
    categoryCounts['Transport'],
    categoryCounts['Entertainment'],
    categoryCounts['Others']
  ];
  categoryBreakdownChart.update();

  // Update expense vs budget chart (only showing actual spending)
  const budgetValues = {
    'Food': 100,
    'Transport': 50,
    'Entertainment': 80
  };
  const actualSpending = {
    'Food': categoryCounts['Food'],
    'Transport': categoryCounts['Transport'],
    'Entertainment': categoryCounts['Entertainment']
  };

  expenseVsBudgetChart.data.datasets[1].data = [
    actualSpending['Food'],
    actualSpending['Transport'],
    actualSpending['Entertainment']
  ];
  expenseVsBudgetChart.update();
}

function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateCharts();
}

form.addEventListener('submit', addTransaction);
init();
