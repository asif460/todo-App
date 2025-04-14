import App from './modules/app.js';
import UI from './modules/ui.js';
import './styles/main.css';

// Initialize the application
const app = new App();
const ui = new UI(app);

// Make app available in console for debugging
window.app = app;