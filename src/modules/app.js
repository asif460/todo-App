import Todo from './todo.js';
import Project from './project.js';
import Storage from './storage.js';

export default class App {
  constructor() {
    this.projects = [];
    this.todos = [];
    this.currentProject = null;

    this.load();
  }

  load() {
    const savedData = Storage.loadTodoApp();

    if (savedData) {
      // Load projects
      this.projects = savedData.projects.map(projectData => {
        const project = new Project(projectData.name);
        project.id = projectData.id;
        return project;
      });

      // Load todos
      this.todos = savedData.todos.map(todoData => Todo.fromJSON(todoData));

      // Rebuild project-todo relationships
      this.projects.forEach(project => {
        const projectData = savedData.projects.find(p => p.id === project.id);
        if (projectData) {
          project.todos = projectData.todoIds
            .map(todoId => this.todos.find(todo => todo.id === todoId))
            .filter(todo => todo); // Filter out undefined if todo not found
        }
      });

      this.currentProject = this.projects[0] || null;
    } else {
      // Initialize with default project
      const defaultProject = new Project('Inbox');
      this.projects.push(defaultProject);
      this.currentProject = defaultProject;
      this.save();
    }
  }

  save() {
    const data = {
      projects: this.projects.map(project => project.toJSON()),
      todos: this.todos.map(todo => todo.toJSON())
    };
    Storage.saveTodoApp(data);
  }

  addProject(name) {
    const project = new Project(name);
    this.projects.push(project);
    this.save();
    return project;
  }

  deleteProject(projectId) {
    // Move todos to default project
    const defaultProject = this.projects.find(p => p.name === 'Inbox') || this.projects[0];
    const project = this.projects.find(p => p.id === projectId);
    
    if (project) {
      project.todos.forEach(todo => {
        todo.project = defaultProject.id;
        defaultProject.addTodo(todo);
      });
      
      this.projects = this.projects.filter(p => p.id !== projectId);
      
      if (this.currentProject.id === projectId) {
        this.currentProject = defaultProject;
      }
      
      this.save();
    }
  }

  addTodo(todoData) {
    const todo = new Todo(
      todoData.title,
      todoData.description,
      todoData.dueDate,
      todoData.priority,
      todoData.project,
      todoData.notes,
      todoData.checklist
    );

    this.todos.push(todo);
    
    const project = this.projects.find(p => p.id === todoData.project);
    if (project) {
      project.addTodo(todo);
    }

    this.save();
    return todo;
  }

  updateTodo(todoId, updatedData) {
    const todo = this.todos.find(t => t.id === todoId);
    if (!todo) return null;

    // Remove from old project
    const oldProject = this.projects.find(p => p.id === todo.project);
    if (oldProject) {
      oldProject.removeTodo(todoId);
    }

    // Update todo properties
    Object.keys(updatedData).forEach(key => {
      if (key in todo) {
        todo[key] = updatedData[key];
      }
    });

    // Add to new project
    const newProject = this.projects.find(p => p.id === todo.project);
    if (newProject) {
      newProject.addTodo(todo);
    }

    this.save();
    return todo;
  }

  deleteTodo(todoId) {
    const todo = this.todos.find(t => t.id === todoId);
    if (todo) {
      const project = this.projects.find(p => p.id === todo.project);
      if (project) {
        project.removeTodo(todoId);
      }
      this.todos = this.todos.filter(t => t.id !== todoId);
      this.save();
    }
  }

  setCurrentProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      this.currentProject = project;
    }
  }

  getTodosForProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.todos : [];
  }
}