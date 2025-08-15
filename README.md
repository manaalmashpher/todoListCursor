# Todo List Web App 📝

A beautiful, modern, and fully functional todo list web application built with vanilla HTML, CSS, and JavaScript. Features drag-and-drop reordering, local storage persistence, and a responsive design.

![Todo List App](https://img.shields.io/badge/Status-Complete-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

### Core Functionality
- **Add Todos** - Create new tasks with a simple form
- **Mark Complete** - Toggle completion status with a single click
- **Delete Todos** - Remove unwanted tasks with smooth animations
- **Drag & Drop Reordering** - Rearrange tasks by dragging them
- **Filter Views** - View All, Active, or Completed todos
- **Clear Completed** - Bulk remove all finished tasks
- **Local Storage** - Your todos persist between browser sessions

### User Experience
- **Beautiful UI** - Modern gradient design with smooth animations
- **Responsive Design** - Works perfectly on desktop and mobile
- **Fast Performance** - Vanilla JavaScript for optimal speed
- **Intuitive Controls** - Clear visual indicators and feedback
- **Auto-Save** - Changes are automatically saved locally

### Design Features
- Modern gradient background
- Smooth slide-in animations
- Hover effects and transitions
- Custom styled checkboxes
- Drag handles with visual feedback
- Empty state with helpful messaging
- Task counter and filter badges

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/todo-list-app.git
   cd todo-list-app
   ```

2. **Open the app**
   Simply open `index.html` in your web browser:
   ```bash
   # On Windows
   start index.html
   
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   ```

3. **Or use a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

## 🎯 How to Use

### Adding Todos
1. Type your task in the input field
2. Press Enter or click the + button
3. New todos appear at the top of the list

### Managing Todos
- **Complete**: Click the circular checkbox
- **Delete**: Hover over a todo and click the trash icon
- **Reorder**: Drag the grip handle (⋮⋮) to rearrange tasks

### Filtering
- **All**: View all todos
- **Active**: Show only incomplete tasks
- **Completed**: Show only finished tasks

### Bulk Actions
- **Clear Completed**: Remove all finished tasks at once

## 🛠️ Technical Details

### File Structure
```
todo-list-app/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # JavaScript functionality
├── .gitignore         # Git ignore file
└── README.md          # Project documentation
```

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and animations
- **Vanilla JavaScript** - No frameworks, pure JS for optimal performance
- **Local Storage API** - Client-side data persistence
- **Drag and Drop API** - Native HTML5 drag and drop functionality

### Key JavaScript Features
- ES6+ Classes and modules
- Event delegation for dynamic elements
- Local Storage for data persistence
- Drag and Drop API implementation
- DOM manipulation and rendering

### CSS Highlights
- CSS Grid and Flexbox layouts
- Custom CSS animations and transitions
- Responsive design with media queries
- CSS custom properties (variables)
- Modern styling with gradients and shadows

## Customization

### Changing Colors
Edit the CSS custom properties in `styles.css`:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --text-color: #333;
  --background-color: #f8fafc;
}
```

### Adding New Features
The modular JavaScript structure makes it easy to extend:
- Add new todo properties (priority, due date, etc.)
- Implement categories or tags
- Add search functionality
- Include data export/import

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Font Awesome for the beautiful icons
- Google Fonts for the Inter font family
- Modern CSS techniques inspired by contemporary design systems

---

**Built with ❤️ using vanilla web technologies**

*No frameworks, no dependencies, just pure web development!*
