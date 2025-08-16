const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Database setup
const db = new sqlite3.Database('todos.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Todos table
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        position INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Add updated_at column if it doesn't exist (for existing databases)
    db.run(`ALTER TABLE todos ADD COLUMN updated_at DATETIME`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding updated_at column:', err.message);
        } else if (!err) {
            console.log('✅ Added updated_at column to existing todos table');
            // Update existing rows to have a timestamp
            db.run(`UPDATE todos SET updated_at = created_at WHERE updated_at IS NULL`);
        }
    });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Authentication Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    message: 'User created successfully',
                    token,
                    user: { id: this.lastID, username, email }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user in database
    db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username],
        async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });
        }
    );
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: { id: req.user.userId, username: req.user.username } 
    });
});

// Todo Routes (protected)

// Get user's todos
app.get('/api/todos', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM todos WHERE user_id = ? ORDER BY position ASC, created_at DESC',
        [req.user.userId],
        (err, todos) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch todos' });
            }
            res.json(todos);
        }
    );
});

// Create new todo
app.post('/api/todos', authenticateToken, (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Todo text is required' });
    }

    db.run(
        'INSERT INTO todos (user_id, text) VALUES (?, ?)',
        [req.user.userId, text],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create todo' });
            }

            res.status(201).json({
                id: this.lastID,
                user_id: req.user.userId,
                text,
                completed: false,
                position: 0
            });
        }
    );
});

// Update todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    // Update todo with proper timestamp handling
    let updateQuery;
    let updateParams;
    
    if (text !== undefined && completed !== undefined) {
        updateQuery = 'UPDATE todos SET text = ?, completed = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?';
        updateParams = [text, completed, id, req.user.userId];
    } else if (text !== undefined) {
        updateQuery = 'UPDATE todos SET text = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?';
        updateParams = [text, id, req.user.userId];
    } else if (completed !== undefined) {
        updateQuery = 'UPDATE todos SET completed = ?, updated_at = datetime("now") WHERE id = ? AND user_id = ?';
        updateParams = [completed, id, req.user.userId];
    } else {
        return res.status(400).json({ error: 'No fields to update' });
    }

    db.run(updateQuery, updateParams, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update todo' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        // Return the updated todo with new timestamp
        db.get(
            'SELECT * FROM todos WHERE id = ? AND user_id = ?',
            [id, req.user.userId],
            (err, todo) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to fetch updated todo' });
                }
                res.json({ message: 'Todo updated successfully', todo });
            }
        );
    });
});

// Delete todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM todos WHERE id = ? AND user_id = ?',
        [id, req.user.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete todo' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Todo not found' });
            }

            res.json({ message: 'Todo deleted successfully' });
        }
    );
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Todo app with authentication ready!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
