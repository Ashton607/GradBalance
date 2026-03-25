import { useState, useEffect } from 'react'
import { Plus, X, Pencil, Check } from 'lucide-react'
import './App.css'

const STARTING_BALANCE = 4193;

const initialSections = [
  { id: 1, title: "Clothing & Appearance", items: [] },
  { id: 2, title: "Accommodation Fee", items: [] },
  { id: 3, title: "Traveling Fee", items: [] },
  { id: 4, title: "Living Expenses", items: [] },
];

function Modal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !amount || isNaN(amount) || Number(amount) <= 0) return;
    onAdd(name.trim(), Number(amount));
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Expense</h3>
        <input
          type="text"
          placeholder="Expense name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (R)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Section({ section, onToggle, onAdd, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const subTotal = section.items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="section">
      <h3>{section.title}</h3>
      <hr />
      <div className="checkbox">
        {section.items.map(item => (
          <div key={item.id} className="checkbox-item">
            <label>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggle(section.id, item.id)}
              />
              <span>{item.name}</span>
              <span className="amount">R{item.amount}</span>
            </label>
            <button className="delete-btn" onClick={() => onDelete(section.id, item.id)}>
              <X size={17} />
            </button>
          </div>
        ))}
      </div>
      <div className="footer">
        <button onClick={() => setShowModal(true)}>Add<Plus size={16} /></button>
      </div>
      <div className="sub-total">
        <p>Sub Total: <span>R{subTotal}</span></p>
      </div>
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onAdd={(name, amount) => onAdd(section.id, name, amount)}
        />
      )}
    </div>
  );
}

function App() {
  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('gradbalance-sections');
    return saved ? JSON.parse(saved) : initialSections;
  });

  const [currentBalance, setCurrentBalance] = useState(() => {
    const saved = localStorage.getItem('gradbalance-current-balance');
    return saved ? Number(saved) : STARTING_BALANCE;
  });

  const [editingBalance, setEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('');

  useEffect(() => {
    localStorage.setItem('gradbalance-sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('gradbalance-current-balance', currentBalance);
  }, [currentBalance]);

  const handleEditBalance = () => {
    setTempBalance(currentBalance);
    setEditingBalance(true);
  };

  const handleSaveBalance = () => {
    if (!isNaN(tempBalance) && Number(tempBalance) >= 0) {
      setCurrentBalance(Number(tempBalance));
    }
    setEditingBalance(false);
  };

  const handleToggle = (sectionId, itemId) => {
    setSections(prev => prev.map(sec =>
      sec.id !== sectionId ? sec :
      { ...sec, items: sec.items.map(item =>
        item.id !== itemId ? item : { ...item, checked: !item.checked }
      )}
    ));
  };

  const handleAdd = (sectionId, name, amount) => {
    setSections(prev => prev.map(sec =>
      sec.id !== sectionId ? sec :
      { ...sec, items: [...sec.items, { id: Date.now(), name, amount, checked: false }] }
    ));
  };

  const handleDelete = (sectionId, itemId) => {
    setSections(prev => prev.map(sec =>
      sec.id !== sectionId ? sec :
      { ...sec, items: sec.items.filter(item => item.id !== itemId) }
    ));
  };

  const total = sections
    .flatMap(sec => sec.items)
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = currentBalance - total;

  return (
    <div className='container'>
      <h2>Start Balance: <span>R{STARTING_BALANCE}</span></h2>

      <div className="current-balance-row">
        <h2>Current Balance:&nbsp;
          {editingBalance ? (
            <input
              className="balance-input"
              type="number"
              value={tempBalance}
              onChange={(e) => setTempBalance(e.target.value)}
              autoFocus
            />
          ) : (
            <span>R{currentBalance}</span>
          )}
        </h2>
        {editingBalance ? (
          <button className="icon-btn" onClick={handleSaveBalance}><Check size={15} /></button>
        ) : (
          <button className="icon-btn" onClick={handleEditBalance}><Pencil size={15} /></button>
        )}
      </div>

      <div className="sections">
        {sections.map(section => (
          <Section
            key={section.id}
            section={section}
            onToggle={handleToggle}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        ))}
        <hr />
      </div>
      <div className="total">
        <p>Total Spent: <span>R{total}</span></p>
      </div>
      <div className="balance">
        <p>End Balance: <span>R{balance}</span></p>
      </div>
    </div>
  );
}

export default App