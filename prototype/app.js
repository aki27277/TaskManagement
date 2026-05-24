'use strict';

/* ===== State ===== */
let nextId = 1;
let tasks = [];
let dragSrcId = null;
let editingId = null;
let deletingId = null;
let currentAddStatus = null;

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };
const STATUS_LABEL   = { todo: '未着手', in_progress: '作業中', done: '完了' };

/* ===== Initial sample data ===== */
function seedData() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  tasks = [
    { id: nextId++, title: 'デザインカンプ確認', description: 'Figmaのデザインをチームで確認する', status: 'todo', priority: 'high', due_date: tomorrow, position: 0 },
    { id: nextId++, title: 'APIエンドポイント設計', description: '', status: 'todo', priority: 'medium', due_date: '', position: 1 },
    { id: nextId++, title: 'DB スキーマ作成', description: 'tasksテーブルのマイグレーションを書く', status: 'in_progress', priority: 'high', due_date: today, position: 0 },
    { id: nextId++, title: '要件定義書レビュー', description: '', status: 'done', priority: 'low', due_date: yesterday, position: 0 },
  ];
}

/* ===== Render ===== */
function render() {
  ['todo', 'in_progress', 'done'].forEach(status => {
    const columnTasks = tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position);

    const container = document.querySelector(`.column__cards[data-status="${status}"]`);
    container.innerHTML = '';
    columnTasks.forEach(task => {
      container.appendChild(createCardEl(task));
    });

    document.querySelector(`.column__count[data-status-badge="${status}"] , .column[data-status="${status}"] .column__count`).textContent = columnTasks.length;
  });
}

function createCardEl(task) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = task.id;
  card.draggable = true;

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.due_date && task.due_date < today && task.status !== 'done';

  card.innerHTML = `
    <div class="card__actions">
      <button class="card__action-btn" data-action="edit" title="編集">✏️</button>
      <button class="card__action-btn card__action-btn--delete" data-action="delete" title="削除">🗑️</button>
    </div>
    <div class="card__title">${escHtml(task.title)}</div>
    ${task.description ? `<div class="card__desc">${escHtml(task.description)}</div>` : ''}
    <div class="card__meta">
      ${task.due_date ? `<span class="card__due ${isOverdue ? 'card__due--overdue' : ''}">📅 ${task.due_date}</span>` : ''}
      <span class="priority-badge priority-badge--${task.priority}">${PRIORITY_LABEL[task.priority]}</span>
    </div>
  `;

  card.addEventListener('dragstart', onDragStart);
  card.addEventListener('dragend', onDragEnd);
  card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditModal(task.id));
  card.querySelector('[data-action="delete"]').addEventListener('click', () => openDeleteModal(task.id));

  return card;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ===== Drag & Drop ===== */
function onDragStart(e) {
  dragSrcId = parseInt(this.dataset.id, 10);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.column__cards').forEach(c => c.classList.remove('drag-over'));
}

document.querySelectorAll('.column__cards').forEach(container => {
  container.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    container.classList.add('drag-over');
  });
  container.addEventListener('dragleave', () => container.classList.remove('drag-over'));
  container.addEventListener('drop', e => {
    e.preventDefault();
    container.classList.remove('drag-over');
    const newStatus = container.dataset.status;
    const task = tasks.find(t => t.id === dragSrcId);
    if (!task) return;

    const dropTarget = e.target.closest('.card');
    if (dropTarget && parseInt(dropTarget.dataset.id, 10) !== dragSrcId) {
      const targetId = parseInt(dropTarget.dataset.id, 10);
      const targetTask = tasks.find(t => t.id === targetId);
      const sameColumnTasks = tasks.filter(t => t.status === newStatus && t.id !== dragSrcId).sort((a, b) => a.position - b.position);
      const insertIdx = sameColumnTasks.findIndex(t => t.id === targetId);
      sameColumnTasks.splice(insertIdx, 0, task);
      sameColumnTasks.forEach((t, i) => { t.position = i; t.status = newStatus; });
    } else {
      task.status = newStatus;
      const maxPos = Math.max(-1, ...tasks.filter(t => t.status === newStatus && t.id !== dragSrcId).map(t => t.position));
      task.position = maxPos + 1;
    }

    render();
  });
});

/* ===== Card Modal ===== */
const cardModal    = document.getElementById('card-modal');
const cardForm     = document.getElementById('card-form');
const modalTitle   = document.getElementById('modal-title');
const modalSubmit  = document.getElementById('modal-submit');
const titleInput   = document.getElementById('field-title');
const descInput    = document.getElementById('field-desc');
const dueInput     = document.getElementById('field-due');
const priorityInput= document.getElementById('field-priority');
const titleError   = document.getElementById('title-error');

function openAddModal(status) {
  editingId = null;
  currentAddStatus = status;
  modalTitle.textContent = 'カードを追加';
  modalSubmit.textContent = '追加';
  titleInput.value = '';
  descInput.value = '';
  dueInput.value = '';
  priorityInput.value = 'medium';
  titleInput.classList.remove('error');
  titleError.hidden = true;
  cardModal.hidden = false;
  titleInput.focus();
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  modalTitle.textContent = 'カードを編集';
  modalSubmit.textContent = '保存';
  titleInput.value = task.title;
  descInput.value = task.description;
  dueInput.value = task.due_date;
  priorityInput.value = task.priority;
  titleInput.classList.remove('error');
  titleError.hidden = true;
  cardModal.hidden = false;
  titleInput.focus();
}

function closeCardModal() {
  cardModal.hidden = true;
  editingId = null;
  currentAddStatus = null;
}

cardForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.classList.add('error');
    titleError.hidden = false;
    titleInput.focus();
    return;
  }

  if (editingId !== null) {
    const task = tasks.find(t => t.id === editingId);
    task.title = title;
    task.description = descInput.value.trim();
    task.due_date = dueInput.value;
    task.priority = priorityInput.value;
  } else {
    const status = currentAddStatus || 'todo';
    const maxPos = Math.max(-1, ...tasks.filter(t => t.status === status).map(t => t.position));
    tasks.push({
      id: nextId++,
      title,
      description: descInput.value.trim(),
      status,
      priority: priorityInput.value,
      due_date: dueInput.value,
      position: maxPos + 1,
    });
  }

  closeCardModal();
  render();
});

titleInput.addEventListener('input', () => {
  if (titleInput.value.trim()) {
    titleInput.classList.remove('error');
    titleError.hidden = true;
  }
});

document.getElementById('modal-close').addEventListener('click', closeCardModal);
document.getElementById('modal-cancel').addEventListener('click', closeCardModal);
cardModal.addEventListener('click', e => { if (e.target === cardModal) closeCardModal(); });

/* ===== Delete Modal ===== */
const deleteModal   = document.getElementById('delete-modal');
const deleteMessage = document.getElementById('delete-message');

function openDeleteModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  deletingId = id;
  deleteMessage.textContent = `「${task.title}」を削除しますか？`;
  deleteModal.hidden = false;
}

function closeDeleteModal() {
  deleteModal.hidden = true;
  deletingId = null;
}

document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

document.getElementById('delete-confirm').addEventListener('click', () => {
  tasks = tasks.filter(t => t.id !== deletingId);
  closeDeleteModal();
  render();
});

/* ===== Add card buttons ===== */
document.querySelectorAll('.btn-add-card').forEach(btn => {
  btn.addEventListener('click', () => openAddModal(btn.dataset.status));
});

/* ===== Column sort ===== */
document.querySelectorAll('.column__sort').forEach(select => {
  select.addEventListener('change', () => {
    const status = select.dataset.status;
    const sort = select.value;
    if (!sort) return;

    const order = { high: 0, medium: 1, low: 2 };
    const columnTasks = tasks
      .filter(t => t.status === status)
      .sort((a, b) => {
        if (sort === 'priority') return order[a.priority] - order[b.priority];
        if (sort === 'due_date') {
          const da = a.due_date || '9999-99-99';
          const db = b.due_date || '9999-99-99';
          return da.localeCompare(db);
        }
        return 0;
      });

    // ソート結果を position に書き込んでカスタム状態として確定
    columnTasks.forEach((t, i) => { t.position = i; });

    // ドロップダウンをプレースホルダーに戻す
    select.value = '';

    render();
  });
});

/* ===== Escape key ===== */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!cardModal.hidden) closeCardModal();
    if (!deleteModal.hidden) closeDeleteModal();
  }
});

/* ===== Boot ===== */
seedData();
render();
