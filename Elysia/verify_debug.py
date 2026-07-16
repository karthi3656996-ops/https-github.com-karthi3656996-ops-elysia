import sys
import os

print("--- Python Environment Diagnostics ---")
print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print("\n--- Python PATH (sys.path) ---")
for p in sys.path:
    print(f"  {p}")

print("\n--- MediaPipe Diagnostics ---")
try:
    import mediapipe as mp
    print(f"MediaPipe imported successfully from: {mp.__file__}")
    print(f"MediaPipe Version: {getattr(mp, '__version__', 'No __version__ attribute')}")
    print(f"Attributes in mediapipe module: {dir(mp)}")
    
    # Check if 'solutions' is in dir(mp)
    print(f"Has attribute 'solutions': {hasattr(mp, 'solutions')}")
    
    try:
        import mediapipe.solutions
        print("Importing 'mediapipe.solutions' directly: SUCCESS")
        print(f"mediapipe.solutions file: {mediapipe.solutions.__file__}")
        print(f"Attributes in mediapipe.solutions: {dir(mediapipe.solutions)}")
    except Exception as e:
        print(f"Importing 'mediapipe.solutions' directly: FAILED. Error: {e}")
        
except Exception as e:
    print(f"Failed to import 'mediapipe'. Error: {e}")

print("\n--- Project Directory Inspection ---")
cwd = os.getcwd()
print(f"Current Directory: {cwd}")
for root, dirs, files in os.walk(cwd):
    # Only search root-level or pages/utils levels to check for shadow folders
    depth = root.replace(cwd, '').count(os.sep)
    if depth > 2:
         continue
    for d in dirs:
        if 'mediapipe' in d.lower():
            print(f"  WARNING: Found folder shadowing mediapipe: {os.path.join(root, d)}")
    for f in files:
        if 'mediapipe' in f.lower():
            print(f"  WARNING: Found file shadowing mediapipe: {os.path.join(root, f)}")
