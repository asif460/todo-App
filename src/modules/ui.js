import { format, parseISO } from 'date-fns';

export default class UI {
  constructor(app) {
    this.app = app;
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.elements = {
      projectList: document.querySelector('.project-list'),
      todoList: document.querySelector('.todo-list'),
      projectTitle: document.querySelector('.project-title'),
      addProjectBtn: document.querySelector('.add-project'),
      addTodoBtn: document.querySelector('.add-todo'),
      projectModal: document.querySelector('.project-modal'),
      todoModal: document.querySelector('.todo-modal'),
      projectForm: document.getElementById('project-form'),
      todoForm: document.getElementById('todo-form'),
      projectNameInput: document.getElementById('project-name'),
      todoTitleInput: document.getElementById('todo-title'),
      todoDescriptionInput: document.getElementById('todo-description'),
      todoDateInput: document.getElementById('todo-date'),
      todoPriorityInput: document.getElementById('todo-priority'),
      todoProjectInput: document.getElementById('todo-project'),
      todoNotesInput: document.getElementById('todo-notes'),
      checklistItems: document.querySelector('.checklist-items'),
      addChecklistItemBtn: document.querySelector('.add-checklist-item'),
      closeButtons: document.querySelectorAll('.close')
    };
  }

  bindEvents() {
    // Project events
    this.elements.addProjectBtn.addEventListener('click', () => this.toggleModal(this.elements.projectModal));
    this.elements.projectForm.addEventListener('submit', (e) => this.handleAddProject(e));

    // Todo events
    this.elements.addTodoBtn.addEventListener('click', () => {
      this.prepareTodoForm();
      this.toggleModal(this.elements.todoModal);
    });
    this.elements.todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
    this.elements.addChecklistItemBtn.addEventListener('click', () => this.addChecklistItemField());

    // Close modals
    this.elements.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.elements.projectModal.classList.add('hidden');
        this.elements.todoModal.classList.add('hidden');
      });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.elements.projectModal) {
        this.elements.projectModal.classList.add('hidden');
      }
      if (e.target === this.elements.todoModal) {
        this.elements.todoModal.classList.add('hidden');
      }
    });
  }

  toggleModal(modal) {
    modal.classList.toggle('hidden');
  }

  render() {
    this.renderProjects();
    this.renderTodos();
  }

  renderProjects() {
    this.elements.projectList.innerHTML = '';
    
    this.app.projects.forEach(project => {
      const li = document.createElement('li');
      li.textContent = project.name;
      li.dataset.projectId = project.id;
      
      if (this.app.currentProject && project.id === this.app.currentProject.id) {
        li.classList.add('active');
      }
      
      li.addEventListener('click', () => {
        this.app.setCurrentProject(project.id);
        this.render();
      });
      
      this.elements.projectList.appendChild(li);
    });
    
    if (this.app.currentProject) {
      this.elements.projectTitle.textContent = this.app.currentProject.name;
    }
  }

  renderTodos() {
    this.elements.todoList.innerHTML = '';
    
    if (!this.app.currentProject) return;
    
    const todos = this.app.currentProject.todos;
    
    if (todos.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'No todos in this project. Add one to get started!';
      this.elements.todoList.appendChild(emptyMsg);
      return;
    }
    
    todos.forEach(todo => {
      const todoElement = document.createElement('div');
      todoElement.className = `todo-item priority-${todo.priority}`;
      todoElement.dataset.todoId = todo.id;
      
      todoElement.innerHTML = `
        <div class="todo-info">
          <div class="todo-title">
            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
            <span>${todo.title}</span>
          </div>
          <div class="todo-due">${todo.formattedDueDate}</div>
        </div>
        <div class="todo-actions">
          <button class="edit-todo" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="delete-todo" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;
      
      // Add event listeners
      const checkbox = todoElement.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        todo.toggleComplete();
        this.app.save();
        this.render();
      });
      
      const editBtn = todoElement.querySelector('.edit-todo');
      editBtn.addEventListener('click', () => {
        this.prepareTodoForm(todo);
        this.toggleModal(this.elements.todoModal);
      });
      
      const deleteBtn = todoElement.querySelector('.delete-todo');
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this todo?')) {
          this.app.deleteTodo(todo.id);
          this.render();
        }
      });
      
      this.elements.todoList.appendChild(todoElement);
    });
  }

  prepareTodoForm(todo = null) {
    const form = this.elements.todoForm;
    const modalTitle = document.querySelector('.modal-title');
    
    if (todo) {
      // Edit mode
      modalTitle.textContent = 'Edit Todo';
      form.dataset.todoId = todo.id;
      
      this.elements.todoTitleInput.value = todo.title;
      this.elements.todoDescriptionInput.value = todo.description;
      this.elements.todoDateInput.value = todo.dueDate ? format(parseISO(todo.dueDate), 'yyyy-MM-dd') : '';
      this.elements.todoPriorityInput.value = todo.priority;
      this.elements.todoNotesInput.value = todo.notes || '';
      
      // Render checklist
      this.elements.checklistItems.innerHTML = '';
      todo.checklist.forEach(item => {
        this.addChecklistItemField(item);
      });
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Todo';
      form.removeAttribute('data-todo-id');
      
      this.elements.todoTitleInput.value = '';
      this.elements.todoDescriptionInput.value = '';
      this.elements.todoDateInput.value = '';
      this.elements.todoPriorityInput.value = 'medium';
      this.elements.todoNotesInput.value = '';
      this.elements.checklistItems.innerHTML = '';
    }
    
    // Update project options
    this.elements.todoProjectInput.innerHTML = '';
    this.app.projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      if (todo && project.id === todo.project) {
        option.selected = true;
      } else if (!todo && project.id === this.app.currentProject.id) {
        option.selected = true;
      }
      this.elements.todoProjectInput.appendChild(option);
    });
  }

  addChecklistItemField(item = null) {
    const checklistItem = document.createElement('div');
    checklistItem.className = 'checklist-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item ? item.completed : false;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Checklist item';
    input.value = item ? item.text : '';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.className = 'btn delete-checklist-item';
    deleteBtn.type = 'button';
    
    checklistItem.appendChild(checkbox);
    checklistItem.appendChild(input);
    checklistItem.appendChild(deleteBtn);
    
    deleteBtn.addEventListener('click', () => {
      checklistItem.remove();
    });
    
    this.elements.checklistItems.appendChild(checklistItem);
  }

  handleAddProject(e) {
    e.preventDefault();
    
    const name = this.elements.projectNameInput.value.trim();
    if (!name) return;
    
    this.app.addProject(name);
    this.elements.projectNameInput.value = '';
    this.elements.projectModal.classList.add('hidden');
    this.render();
  }

  handleAddTodo(e) {
    e.preventDefault();
    
    // Get checklist items
    const checklistItems = [];
    const checklistElements = this.elements.checklistItems.querySelectorAll('.checklist-item');
    
    checklistElements.forEach(item => {
      const text = item.querySelector('input[type="text"]').value.trim();
      if (text) {
        checklistItems.push({
          text,
          completed: item.querySelector('input[type="checkbox"]').checked
        });
      }
    });
    
    const todoData = {
      title: this.elements.todoTitleInput.value.trim(),
      description: this.elements.todoDescriptionInput.value.trim(),
      dueDate: this.elements.todoDateInput.value || null,
      priority: this.elements.todoPriorityInput.value,
      project: this.elements.todoProjectInput.value,
      notes: this.elements.todoNotesInput.value.trim(),
      checklist: checklistItems
    };
    
    if (!todoData.title) return;
    
    const todoId = this.elements.todoForm.dataset.todoId;
    if (todoId) {
      // Update existing todo
      this.app.updateTodo(todoId, todoData);
    } else {
      // Add new todo
      this.app.addTodo(todoData);
    }
    
    this.elements.todoModal.classList.add('hidden');
    this.render();
  }
}