import os
import urllib.request
import shutil
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

print("--- Testing MediaPipe Tasks API on Python 3.13 ---")

models_dir = os.path.join(os.getcwd(), 'models')
os.makedirs(models_dir, exist_ok=True)
model_path = os.path.join(models_dir, 'hand_landmarker.task')

# Download the model file if it doesn't exist
if not os.path.exists(model_path):
    print("Downloading hand_landmarker.task model...")
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req) as response, open(model_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        print("Download complete!")
    except Exception as e:
        print(f"Failed to download model. Error: {e}")
        exit(1)
else:
    print("Model file already exists.")

# Try to initialize the model using the tasks API
try:
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.IMAGE,
        num_hands=2,
        min_hand_detection_confidence=0.7,
        min_hand_presence_confidence=0.5
    )
    detector = vision.HandLandmarker.create_from_options(options)
    print("SUCCESS: HandLandmarker initialized successfully!")
    detector.close()
except Exception as e:
    print(f"FAILED: Could not initialize HandLandmarker. Error: {e}")
