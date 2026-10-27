
import { useEffect, useState } from "react";
import axios from "axios";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/expenses";

const emptyForm = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  
async function loadExpenses() {
  try {
    const response = await axios.get(API);
    setExpenses(response.data);
  } catch (error) {
    console.error("Load expenses error:", error);
    setMessage(
      error.response?.data?.message ||
      error.message ||
      "Unable to load expenses. Check the backend."
    );
  }
}


  useEffect(() => {
    loadExpenses();
  }, []);

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (
      !form.title.trim() ||
      !form.category ||
      !form.date ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setMessage("Enter valid details and an amount greater than zero.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(`${API}/${editingId}`, {
          ...form,
          amount: Number(form.amount),
        });
        setMessage("Expense updated successfully!");
      } else {
        await axios.post(API, {
          ...form,
          amount: Number(form.amount),
        });
        setMessage("Expense added successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadExpenses();
    } catch (error) {
  console.error("Save expense error:", error);
  setMessage(
    error.response?.data?.message ||
    error.message ||
    "Operation failed."
  );
}
     finally {
      setLoading(false);
    }
  }

  function handleEdit(expense) {
    setEditingId(expense._id);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: new Date(expense.date).toISOString().slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      setMessage("Expense deleted successfully!");
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadExpenses();
    } catch {
      setMessage("Unable to delete expense.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon"><Wallet size={25} /></span>
          <div>
            <h1>Expense Tracker</h1>
            <p>Personal finance dashboard</p>
          </div>
        </div>
        <span className="date-chip">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR MONEY, YOUR CONTROL</p>
          <h2>Track your spending.</h2>
          <p>Keep your daily expenses organized in one place.</p>
        </div>
        <div className="total-card">
          <span>Total Amount Spent</span>
          <strong>
            {total.toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            })}
          </strong>
          <small>{expenses.length} expense(s) recorded</small>
        </div>
      </section>

      {message && (
        <div className="message" role="status">{message}</div>
      )}

      <section className="content-grid">
        <form className="panel expense-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <span className="panel-icon"><Plus size={20} /></span>
            <div>
              <h3>{editingId ? "Edit Expense" : "Add New Expense"}</h3>
              <p>Enter your expense details below.</p>
            </div>
          </div>

          <label>
            Expense Title
            <input
              name="title"
              placeholder="e.g. Grocery shopping"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </label>

          <label>
            Amount (₹)
            <input
              name="amount"
              type="number"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Category
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Bills</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Date
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-button" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Save Changes" : "Add Expense"}
          </button>

          {editingId && (
            <button
              className="secondary-button"
              type="button"
              onClick={cancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </form>

        <section className="panel expenses-panel">
          <div className="panel-heading list-heading">
            <div>
              <h3>Recent Expenses</h3>
              <p>Your saved transactions</p>
            </div>
            <span className="count-badge">{expenses.length}</span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <Wallet size={35} />
              <h4>No expenses yet</h4>
              <p>Add your first expense using the form.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td className="expense-title">{expense.title}</td>
                      <td><span className="category-tag">{expense.category}</span></td>
                      <td>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                      <td className="amount">
                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            className="icon-button edit-button"
                            type="button"
                            title="Edit expense"
                            aria-label={`Edit ${expense.title}`}
                            onClick={() => handleEdit(expense)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-button delete-button"
                            type="button"
                            title="Delete expense"
                            aria-label={`Delete ${expense.title}`}
                            onClick={() => handleDelete(expense._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <footer>Personal Expense Tracker · Manage your money wisely</footer>
    </main>
  );
}

export default App;
