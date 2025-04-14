export default class Storage {
    static saveTodoApp(data) {
      localStorage.setItem('todoApp', JSON.stringify(data));
    }
  
    static loadTodoApp() {
      const data = localStorage.getItem('todoApp');
      return data ? JSON.parse(data) : null;
    }
  
    static clearTodoApp() {
      localStorage.removeItem('todoApp');
    }
  }