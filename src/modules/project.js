export default class Project {
    constructor(name) {
      this.id = Date.now().toString();
      this.name = name;
      this.todos = [];
    }
  
    addTodo(todo) {
      this.todos.push(todo);
    }
  
    removeTodo(todoId) {
      this.todos = this.todos.filter(todo => todo.id !== todoId);
    }
  
    findTodo(todoId) {
      return this.todos.find(todo => todo.id === todoId);
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        todoIds: this.todos.map(todo => todo.id)
      };
    }
  }