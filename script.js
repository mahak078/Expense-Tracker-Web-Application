const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');
const dateInput = document.getElementById('date');

const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');

const exportBtn = document.getElementById('exportCSV');
const clearAllBtn = document.getElementById('clearAll');

const themeToggle = document.getElementById('themeToggle');
const monthIncomeEl = document.getElementById('monthIncome');
const monthExpenseEl = document.getElementById('monthExpense');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

/* 🌙 Load saved theme */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️ Light Mode';
}

/* Toggle theme */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/* Init */
init();

/* Events */
form.addEventListener('submit', addTransaction);
searchInput.addEventListener('input', init);
filterCategory.addEventListener('change', init);
fromDate.addEventListener('change', init);
toDate.addEventListener('change', init);
exportBtn.addEventListener('click', exportCSV);
clearAllBtn.addEventListener('click', clearAll);

/* Initialize UI */
function init() {
  list.innerHTML = '';
  const filtered = getFilteredTransactions();
  filtered.forEach(addTransactionDOM);
  updateValues(filtered);
  updateMonthSummary();
  updateLocalStorage();
}

/* ➕ Add transaction */
function addTransaction(e) {
  e.preventDefault();

  if (
    text.value.trim() === '' ||
    amount.value === '' ||
    dateInput.value === ''
  ) return;

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    date: dateInput.value
  };

  transactions.push(transaction);
  form.reset();
  init();
}

/* 🔍 Filter logic */
function getFilteredTransactions() {
  return transactions.filter(t => {
    const matchText = t.text.toLowerCase().includes(searchInput.value.toLowerCase());
    const matchCat = filterCategory.value === 'All' || t.category === filterCategory.value;
    const matchFrom = !fromDate.value || t.date >= fromDate.value;
    const matchTo = !toDate.value || t.date <= toDate.value;
    return matchText && matchCat && matchFrom && matchTo;
  });
}

/* 🧾 Add to DOM */
function addTransactionDOM(t) {
  const sign = t.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  item.classList.add(t.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    <span>
      ${t.text}<br>
      <small>${t.category} | ${t.date}</small>
    </span>
    <span>${sign}₹${Math.abs(t.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
  `;
  list.appendChild(item);
}

/* 💰 Update totals */
function updateValues(data) {
  const amounts = data.map(t => t.amount);

  const total = amounts.reduce((a, v) => a + v, 0).toFixed(2);
  const income = amounts.filter(v => v > 0).reduce((a, v) => a + v, 0).toFixed(2);
  const expense = (
    amounts.filter(v => v < 0).reduce((a, v) => a + v, 0) * -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  moneyPlus.innerText = `₹${income}`;
  moneyMinus.innerText = `₹${expense}`;
}

/* 📊 Monthly summary */
function updateMonthSummary() {
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // YYYY-MM

  const monthData = transactions.filter(t => t.date.startsWith(month));
  const income = monthData
    .filter(t => t.amount > 0)
    .reduce((a, v) => a + v.amount, 0);
  const expense = monthData
    .filter(t => t.amount < 0)
    .reduce((a, v) => a + v.amount, 0) * -1;

  monthIncomeEl.innerText = `₹${income.toFixed(2)}`;
  monthExpenseEl.innerText = `₹${expense.toFixed(2)}`;
}

/* ❌ Remove one */
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  init();
}

/* 🧹 Clear all */
function clearAll() {
  if (confirm('Are you sure you want to clear all transactions?')) {
    transactions = [];
    init();
  }
}

/* 💾 Export CSV */
function exportCSV() {
  if (transactions.length === 0) return;

  let csv = "Description,Amount,Category,Date\n";
  transactions.forEach(t => {
    csv += `${t.text},${t.amount},${t.category},${t.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
}

/* 💾 LocalStorage */
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}
