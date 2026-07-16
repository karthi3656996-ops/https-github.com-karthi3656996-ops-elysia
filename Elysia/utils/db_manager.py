import sqlite3
import os
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database')
DB_PATH = os.path.join(DB_DIR, 'elysia.db')

def init_db():
    """Initialize the SQLite database and create tables if they do not exist."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Gestures Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gestures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            image_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Training History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS training_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            accuracy REAL NOT NULL,
            loss REAL NOT NULL,
            epochs INTEGER NOT NULL,
            model_path TEXT NOT NULL
        )
    ''')
    
    # Settings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')
    
    # Insert default settings if not exists
    default_settings = [
        ('camera_index', '0'),
        ('confidence_threshold', '80'),
        ('tts_enabled', 'true'),
        ('model_version', 'latest'),
        ('theme', 'dark')
    ]
    for key, val in default_settings:
        cursor.execute('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', (key, val))
        
    conn.commit()
    conn.close()

def execute_query(query, params=(), fetch=False, fetchone=False):
    """Utility to execute queries safely."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        if fetch:
            if fetchone:
                res = cursor.fetchone()
            else:
                res = cursor.fetchall()
            return res
        conn.commit()
    except Exception as e:
        print(f"Database error: {e}")
        raise e
    finally:
        conn.close()

# Gestures CRUD
def add_gesture(name, category, image_count=0):
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    execute_query(
        "INSERT INTO gestures (name, category, image_count, created_at) VALUES (?, ?, ?, ?)",
        (name, category, image_count, created_at)
    )

def get_all_gestures():
    return execute_query("SELECT id, name, category, image_count, created_at FROM gestures ORDER BY name ASC", fetch=True)

def update_gesture_image_count(name, count):
    execute_query("UPDATE gestures SET image_count = ? WHERE name = ?", (count, name))

def rename_gesture(old_name, new_name):
    execute_query("UPDATE gestures SET name = ? WHERE name = ?", (new_name, old_name))

def delete_gesture(name):
    execute_query("DELETE FROM gestures WHERE name = ?", (name,))

# Training History CRUD
def add_training_log(accuracy, loss, epochs, model_path):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    execute_query(
        "INSERT INTO training_history (timestamp, accuracy, loss, epochs, model_path) VALUES (?, ?, ?, ?, ?)",
        (timestamp, accuracy, loss, epochs, model_path)
    )

def get_training_history():
    return execute_query("SELECT id, timestamp, accuracy, loss, epochs, model_path FROM training_history ORDER BY id DESC", fetch=True)

# Settings CRUD
def get_setting(key, default_val=None):
    res = execute_query("SELECT value FROM settings WHERE key = ?", (key,), fetch=True, fetchone=True)
    return res[0] if res else default_val

def set_setting(key, value):
    execute_query("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, str(value)))

# Initialize database on import
init_db()
