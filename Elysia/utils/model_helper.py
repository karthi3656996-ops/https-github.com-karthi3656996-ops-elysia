import os
import json
import shutil
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model as keras_load_model
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, Input
from tensorflow.keras.callbacks import Callback
import utils.db_manager as db

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

class StreamlitTrainingCallback(Callback):
    """Keras callback to update training progress in Streamlit UI."""
    def __init__(self, progress_bar, status_text, epochs):
        super().__init__()
        self.progress_bar = progress_bar
        self.status_text = status_text
        self.epochs = epochs

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        acc = logs.get('accuracy', 0.0)
        loss = logs.get('loss', 0.0)
        val_acc = logs.get('val_accuracy', 0.0)
        val_loss = logs.get('val_loss', 0.0)
        
        progress = (epoch + 1) / self.epochs
        self.progress_bar.progress(progress)
        
        self.status_text.markdown(
            f"**Epoch {epoch + 1}/{self.epochs}**  \n"
            f"📈 Accuracy: `{acc:.4f}` | 📉 Loss: `{loss:.4f}`  \n"
            f"🧪 Val Accuracy: `{val_acc:.4f}` | 🧪 Val Loss: `{val_loss:.4f}`"
        )

def get_next_model_version():
    """Determine the next version number based on existing files in models/ folder."""
    files = os.listdir(MODELS_DIR)
    version = 1
    for f in files:
        if f.startswith('model_v') and f.endswith('.keras'):
            try:
                v = int(f.replace('model_v', '').replace('.keras', ''))
                if v >= version:
                    version = v + 1
            except ValueError:
                pass
    return version

def build_model(num_classes):
    """
    Build a multi-layer perceptron for landmark classification.
    Input size: 126 (2 hands * 21 landmarks * 3 coordinates [x, y, z])
    """
    model = Sequential([
        Input(shape=(126,)),
        
        Dense(128, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        
        Dense(32, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def train_gesture_model(X, y, classes, epochs=50, batch_size=32, st_callback=None):
    """
    Train a new gesture classifier.
    X: numpy array of shape (N, 126)
    y: numpy array of shape (N,) containing integer labels
    classes: list of strings (gesture names) corresponding to the integer labels
    """
    # Build model
    num_classes = len(classes)
    model = build_model(num_classes)
    
    # Split train/test
    indices = np.arange(X.shape[0])
    np.random.shuffle(indices)
    X, y = X[indices], y[indices]
    
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    
    callbacks = []
    if st_callback:
        callbacks.append(st_callback)
        
    # Fit model
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=0
    )
    
    # Evaluate final accuracy
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    
    # Save versioned model
    version = get_next_model_version()
    versioned_filename = f"model_v{version}.keras"
    versioned_path = os.path.join(MODELS_DIR, versioned_filename)
    latest_path = os.path.join(MODELS_DIR, "latest.keras")
    
    model.save(versioned_path)
    shutil.copy(versioned_path, latest_path)
    
    # Save classes JSON
    classes_path = os.path.join(MODELS_DIR, "classes.json")
    with open(classes_path, 'w') as f:
        json.dump(classes, f)
        
    # Log in database
    db.add_training_log(
        accuracy=float(val_acc),
        loss=float(val_loss),
        epochs=epochs,
        model_path=versioned_filename
    )
    
    # Update latest accuracy in settings
    db.set_setting('last_accuracy', f"{val_acc*100:.1f}%")
    db.set_setting('last_trained_date', datetime_now_str())
    
    return history, versioned_filename, val_acc, val_loss

def load_gesture_model(model_name="latest.keras"):
    """
    Load a model and its associated classes.
    """
    model_path = os.path.join(MODELS_DIR, model_name)
    classes_path = os.path.join(MODELS_DIR, "classes.json")
    
    if not os.path.exists(model_path) or not os.path.exists(classes_path):
        return None, None
        
    try:
        model = keras_load_model(model_path)
        with open(classes_path, 'r') as f:
            classes = json.load(f)
        return model, classes
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None

def predict_gesture(model, classes, features):
    """
    Run inference on a 126-dimensional landmarks vector.
    """
    features_arr = np.expand_dims(np.array(features), axis=0)
    predictions = model.predict(features_arr, verbose=0)[0]
    best_idx = np.argmax(predictions)
    confidence = float(predictions[best_idx])
    return classes[best_idx], confidence

def datetime_now_str():
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def get_available_models():
    """List all versioned models in the models directory."""
    if not os.path.exists(MODELS_DIR):
        return []
    files = os.listdir(MODELS_DIR)
    models = []
    if os.path.exists(os.path.join(MODELS_DIR, "latest.keras")):
        models.append("latest.keras")
    for f in sorted(files):
        if f.startswith('model_v') and f.endswith('.keras'):
            models.append(f)
    return models
