import streamlit as st
import cv2
import os
import time
import shutil
from PIL import Image
import utils.ui_helper as ui
import utils.db_manager as db
from utils.landmark_extractor import HandLandmarkExtractor

# Inject custom styles
ui.inject_custom_css()

# Header
ui.page_header(
    title="Capture & Add New Gestures",
    subtitle="Add new signs to Elysia's library by capturing custom training frames.",
    badge_text="Dataset Creator"
)

# Folder paths
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset')
os.makedirs(DATASET_DIR, exist_ok=True)

# Configurations
camera_idx = int(db.get_setting('camera_index', '0'))

# Input layout
col_form, col_instructions = st.columns([2, 2], gap="large")

with col_form:
    st.markdown("<h3 style='color: white; margin-bottom: 0.5rem;'>📝 Sign Registration</h3>", unsafe_allow_html=True)
    
    with st.form("gesture_form"):
        gesture_name = st.text_input("Gesture Name", placeholder="e.g. Help, Hello, Water, A, B").strip()
        gesture_category = st.selectbox(
            "Category", 
            ["Alphabet", "Numbers", "Phrases", "Custom"]
        )
        target_images = st.slider(
            "Target Frame Count (More frames = Better AI)", 
            min_value=50, 
            max_value=300, 
            value=150, 
            step=50
        )
        
        submitted = st.form_submit_button("Initialize Capture Session")

with col_instructions:
    st.markdown("""
        <div class="glass-card" style="height: 100%;">
            <h3 style="color: #c084fc; margin-bottom: 0.5rem;">💡 Capture Tips for Best Accuracy</h3>
            <ul style="color: #9ca3af; font-size: 0.9rem; padding-left: 1.2rem; line-height: 1.6;">
                <li><b>Distance:</b> Move your hand closer and further from the camera.</li>
                <li><b>Angle:</b> Slightly tilt your hand left, right, up, and down.</li>
                <li><b>Lighting:</b> Try to capture in clear, well-lit environments.</li>
                <li><b>Position:</b> Shift your hand to different parts of the screen.</li>
                <li><b>Hands:</b> For two-handed signs, make sure both hands are clearly in the frame.</li>
            </ul>
        </div>
    """, unsafe_allow_html=True)

if submitted:
    if not gesture_name:
        st.error("Please enter a valid gesture name before proceeding.")
    else:
        # Sanitize gesture name for folder usage
        safe_name = "".join([c for c in gesture_name if c.isalnum() or c in ('_', '-')]).strip()
        if not safe_name:
            st.error("Gesture name contains invalid characters. Use alphanumeric values only.")
        else:
            st.session_state.safe_name = safe_name
            st.session_state.gesture_name = gesture_name
            st.session_state.gesture_category = gesture_category
            st.session_state.target_images = target_images
            st.session_state.start_countdown = True

# Capture process
if 'start_countdown' in st.session_state and st.session_state.start_countdown:
    safe_name = st.session_state.safe_name
    gesture_name = st.session_state.gesture_name
    gesture_category = st.session_state.gesture_category
    target_images = st.session_state.target_images
    
    st.markdown("<hr style='border-color: rgba(255,255,255,0.05);'>", unsafe_allow_html=True)
    st.markdown(f"### Recording: `{gesture_name}` (Category: `{gesture_category}`)", unsafe_allow_html=True)
    
    # Placeholders
    countdown_placeholder = st.empty()
    camera_placeholder = st.empty()
    progress_placeholder = st.empty()
    
    # Countdown
    for i in range(3, 0, -1):
        countdown_placeholder.markdown(f"""
            <div style="text-align:center; padding: 2rem; background: rgba(124, 58, 237, 0.1); border: 1px solid #7c3aed; border-radius: 1rem; margin-bottom: 1.5rem;">
                <h2 style="color: #c084fc; margin-bottom: 0;">Get Ready! Starting in {i}...</h2>
                <p style="color: #9ca3af; margin-top: 0.5rem; font-size: 0.95rem;">Position your hand(s) in front of the camera.</p>
            </div>
        """, unsafe_allow_html=True)
        time.sleep(1.0)
        
    countdown_placeholder.markdown("""
        <div style="text-align:center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 1rem; margin-bottom: 1.5rem;">
            <h2 style="color: #10b981; margin-bottom: 0;">🎬 Recording!</h2>
            <p style="color: #9ca3af; margin-top: 0.5rem; font-size: 0.95rem;">Move your hand slightly to capture different angles and distances.</p>
        </div>
    """, unsafe_allow_html=True)
    
    # Create dataset folder
    gesture_dir = os.path.join(DATASET_DIR, safe_name)
    os.makedirs(gesture_dir, exist_ok=True)
    
    # Start capturing
    detector = HandLandmarkExtractor(max_num_hands=2)
    cap = cv2.VideoCapture(camera_idx)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    captured_count = 0
    progress_bar = progress_placeholder.progress(0.0)
    
    # Read existing files to prevent overwriting
    existing_files = os.listdir(gesture_dir)
    img_index = 0
    for f in existing_files:
        if f.startswith('img_') and f.endswith('.jpg'):
            try:
                idx = int(f.replace('img_', '').replace('.jpg', ''))
                if idx >= img_index:
                    img_index = idx + 1
            except ValueError:
                pass
                
    st.session_state.start_countdown = False
    
    # Recording loop
    while captured_count < target_images:
        ret, frame = cap.read()
        if not ret:
            st.error("Camera disconnected during capture.")
            break
            
        frame = cv2.flip(frame, 1)
        
        # Verify hand exists using MediaPipe (ensures quality data)
        features, annotated_frame, detected = detector.extract_landmarks(frame)
        
        if detected:
            # Save raw frame
            img_path = os.path.join(gesture_dir, f"img_{img_index}.jpg")
            cv2.imwrite(img_path, frame)
            
            captured_count += 1
            img_index += 1
            
            # Update progress
            progress_pct = captured_count / target_images
            progress_bar.progress(progress_pct)
            
        # Display live feed with landmarks overlay
        frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
        camera_placeholder.image(frame_rgb, use_container_width=True)
        
        # Display capture counter text
        countdown_placeholder.markdown(f"""
            <div style="text-align:center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border: 1px solid #a855f7; border-radius: 1rem; margin-bottom: 1.5rem;">
                <h3 style="color: #fff; margin-bottom: 0;">Captured: {captured_count} / {target_images} Frames</h3>
                <p style="color: {'#10b981' if detected else '#ef4444'}; font-size: 0.85rem; font-weight: 600; margin-top: 0.25rem;">
                    {'Hand Detected - Saving Frame' if detected else 'No Hand Detected - Capture Paused'}
                </p>
            </div>
        """, unsafe_allow_html=True)
        
        # Short sleep to vary frames (~15-20fps capture rate)
        time.sleep(0.05)
        
    cap.release()
    detector.close()
    
    # Save/Update in SQLite
    existing_gesture = db.execute_query("SELECT id FROM gestures WHERE name = ?", (gesture_name,), fetch=True, fetchone=True)
    current_total_images = len([f for f in os.listdir(gesture_dir) if f.endswith('.jpg')])
    
    if existing_gesture:
        db.update_gesture_image_count(gesture_name, current_total_images)
    else:
        db.add_gesture(gesture_name, gesture_category, current_total_images)
        
    countdown_placeholder.markdown(f"""
        <div style="text-align:center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 1rem; margin-bottom: 1.5rem;">
            <h2 style="color: #10b981; margin-bottom: 0.25rem;">🎉 Capture Complete!</h2>
            <p style="color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem;">
                Successfully saved <b>{captured_count}</b> new frames for gesture <b>"{gesture_name}"</b>.
            </p>
            <p style="color: #9ca3af; font-size: 0.85rem; margin: 0;">
                Total images in database for this gesture: <b>{current_total_images}</b>.
            </p>
        </div>
    """, unsafe_allow_html=True)
    camera_placeholder.empty()
    progress_placeholder.empty()

# Grid Preview of Saved Gestures
st.markdown("<hr style='border-color: rgba(255, 255, 255, 0.05);'>", unsafe_allow_html=True)
st.markdown("### 📁 Existing Gestures in Dataset", unsafe_allow_html=True)

gestures = db.get_all_gestures()

if not gestures:
    st.markdown("<p style='color: #6b7280; font-style: italic;'>No gestures captured yet. Register a gesture above to start building the dataset.</p>", unsafe_allow_html=True)
else:
    # Build columns for grid view of captured gestures
    cols = st.columns(4)
    for idx, g in enumerate(gestures):
        g_id, g_name, g_cat, g_count, g_date = g
        col = cols[idx % 4]
        
        # Try to find a thumbnail from the dataset folder
        thumb_path = None
        safe_g_name = "".join([c for c in g_name if c.isalnum() or c in ('_', '-')]).strip()
        g_dir = os.path.join(DATASET_DIR, safe_g_name)
        if os.path.exists(g_dir):
            imgs = [f for f in os.listdir(g_dir) if f.endswith('.jpg')]
            if imgs:
                # Use the first image as thumbnail
                thumb_path = os.path.join(g_dir, imgs[0])
                
        with col:
            st.markdown(f"""
                <div class="glass-card" style="text-align: center; padding: 1rem; margin-bottom: 1rem; min-height: 250px;">
                    <p style="font-size: 0.75rem; color: #a855f7; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">{g_cat}</p>
                    <h4 style="color: white; margin: 0 0 0.5rem 0; font-size: 1.15rem; font-weight:700;">{g_name}</h4>
                    <p style="color: #9ca3af; font-size: 0.8rem; margin-bottom: 0.75rem;">Frames: <b>{g_count}</b></p>
                </div>
            """, unsafe_allow_html=True)
            
            # Show thumbnail if available, otherwise fallback image
            if thumb_path:
                img = Image.open(thumb_path)
                st.image(img, use_container_width=True)
            else:
                st.markdown("<div style='aspect-ratio:4/3; background:rgba(255,255,255,0.02); border-radius:0.5rem; display:flex; align-items:center; justify-content:center; color:#4b5563; font-size:0.8rem;'>No Preview</div>", unsafe_allow_html=True)
