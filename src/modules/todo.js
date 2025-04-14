import { format, parseISO } from 'date-fns';

export default class Todo {
  constructor(
    title,
    description = '',
    dueDate = null,
    priority = 'medium',
    project = 'inbox',
    notes = '',
    checklist = []
  ) {
    this.id = Date.now().toString();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.project = project;
    this.completed = false;
    this.creationDate = new Date();
    this.notes = notes;
    this.checklist = checklist;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  updatePriority(newPriority) {
    this.priority = newPriority;
  }

  updateProject(newProject) {
    this.project = newProject;
  }

  updateDueDate(newDate) {
    this.dueDate = newDate;
  }

  addChecklistItem(item) {
    this.checklist.push({
      id: Date.now().toString(),
      text: item,
      completed: false
    });
  }

  toggleChecklistItem(itemId) {
    const item = this.checklist.find(item => item.id === itemId);
    if (item) {
      item.completed = !item.completed;
    }
  }

  removeChecklistItem(itemId) {
    this.checklist = this.checklist.filter(item => item.id !== itemId);
  }

  get formattedDueDate() {
    if (!this.dueDate) return 'No due date';
    return format(parseISO(this.dueDate), 'MMM dd, yyyy');
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      project: this.project,
      completed: this.completed,
      creationDate: this.creationDate.toISOString(),
      notes: this.notes,
      checklist: this.checklist
    };
  }

  static fromJSON(json) {
    const todo = new Todo(
      json.title,
      json.description,
      json.dueDate,
      json.priority,
      json.project,
      json.notes,
      json.checklist
    );
    todo.id = json.id;
    todo.completed = json.completed;
    todo.creationDate = new Date(json.creationDate);
    return todo;
  }
}