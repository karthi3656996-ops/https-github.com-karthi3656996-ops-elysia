import streamlit as st
import cv2
import time
import collections
import numpy as np
from PIL import Image
import utils.ui_helper as ui
import utils.db_manager as db
from utils.landmark_extractor import HandLandmarkExtractor
import utils.model_helper as mh

# Load CSS Styles
ui.inject_custom_css()

# Header
ui.page_header(
    title="Real-Time Sign Language Translator",
    subtitle="Translate hand gestures into spoken sentences in real time.",
    badge_text="Live AI Translator"
)

# Initialize Session State Variables
if 'sentence' not in st.session_state:
    st.session_state.sentence = []
if 'run_camera' not in st.session_state:
    st.session_state.run_camera = False
if 'prediction_buffer' not in st.session_state:
    st.session_state.prediction_buffer = collections.deque(maxlen=10)
if 'consecutive_frames' not in st.session_state:
    st.session_state.consecutive_frames = 0
if 'last_added_sign' not in st.session_state:
    st.session_state.last_added_sign = ""

# Load configurations
confidence_thresh = float(db.get_setting('confidence_threshold', '80')) / 100.0
camera_idx = int(db.get_setting('camera_index', '0'))
model_ver = db.get_setting('model_version', 'latest.keras')

# Load the AI model
model, classes = mh.load_gesture_model(model_ver)

# Helper function to trigger client-side Text-to-Speech
def speak_text(text):
    if text.strip():
        # Inject standard Web Speech API JavaScript for zero-latency offline TTS
        js_code = f"""
        <script>
        if ('speechSynthesis' in window) {{
            window.speechSynthesis.cancel();
            var utterance = new SpeechSynthesisUtterance("{text}");
            window.speechSynthesis.speak(utterance);
        }} else {{
            console.error("Speech Synthesis not supported in this browser.");
        }}
        </script>
        """
        st.components.v1.html(js_code, height=0)

if model is None:
    st.markdown("""
        <div class="glass-card" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05);">
            <h3 style="color: #ef4444; margin-bottom: 0.5rem;">🚨 No Trained Model Found</h3>
            <p style="color: #9ca3af; font-size: 0.9rem;">
                Elysia needs a trained model to translate gestures. Please capture gestures on the <b>Add Gesture</b> page, and then train the AI model on the <b>AI Training</b> page.
            </p>
            <a href="/Train_Model" target="_self" class="btn-neon" style="margin-top: 1rem; text-decoration: none;">⚙️ Go to Training Page</a>
        </div>
    """, unsafe_allow_html=True)
else:
    # Set up layout
    col_cam, col_ctrl = st.columns([3, 2], gap="large")
    
    with col_cam:
        st.markdown("<h3 style='color: white; margin-bottom: 0.5rem;'>📷 Video Feed</h3>", unsafe_allow_html=True)
        # Placeholder for webcam feed
        camera_placeholder = st.empty()
        
        # Start / Stop buttons
        c1, c2 = st.columns(2)
        with c1:
            if st.button("▶ Start Camera", use_container_width=True, type="primary"):
                st.session_state.run_camera = True
                st.rerun()
        with c2:
            if st.button("⏹ Stop Camera", use_container_width=True):
                st.session_state.run_camera = False
                st.rerun()

    with col_ctrl:
        st.markdown("<h3 style='color: white; margin-bottom: 0.5rem;'>📝 Live Translation</h3>", unsafe_allow_html=True)
        
        # Prediction Output card
        prediction_placeholder = st.empty()
        
        # Sentence card
        st.markdown("<h4 style='color: #c084fc; margin-top: 1.5rem;'>Built Sentence</h4>", unsafe_allow_html=True)
        sentence_placeholder = st.empty()
        
        # Action Buttons
        st.markdown("<div style='margin-top: 1rem;'></div>", unsafe_allow_html=True)
        btn1, btn2, btn3, btn4 = st.columns(4)
        
        with btn1:
            if st.button("⌴ Space", use_container_width=True):
                st.session_state.sentence.append(" ")
                st.session_state.last_added_sign = " "
        with btn2:
            if st.button("⌫ Delete", use_container_width=True):
                if st.session_state.sentence:
                    st.session_state.sentence.pop()
                st.session_state.last_added_sign = ""
        with btn3:
            if st.button("🗑 Clear", use_container_width=True):
                st.session_state.sentence = []
                st.session_state.last_added_sign = ""
        with btn4:
            if st.button("🔊 Speak", use_container_width=True):
                full_sentence = "".join(st.session_state.sentence)
                speak_text(full_sentence)
                
    # Loop to capture and predict
    if st.session_state.run_camera:
        # Initialize detector
        detector = HandLandmarkExtractor(max_num_hands=2)
        cap = cv2.VideoCapture(camera_idx)
        
        # Lower resolution to optimize processing speed and layout
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        last_prediction_time = time.time()
        
        # Helper to join words properly
        def render_sentence():
            words = []
            current_word = ""
            for char in st.session_state.sentence:
                if char == " ":
                    if current_word:
                        words.append(current_word)
                        current_word = ""
                else:
                    current_word += char
            if current_word:
                words.append(current_word)
            return " ".join(words) if words else "(Empty)"
        
        while st.session_state.run_camera:
            ret, frame = cap.read()
            if not ret:
                st.error("Failed to read from camera. Please verify camera settings.")
                st.session_state.run_camera = False
                break
                
            # Flip horizontally for mirrored view
            frame = cv2.flip(frame, 1)
            
            # Extract landmarks and annotate frame
            features, annotated_frame, detected = detector.extract_landmarks(frame)
            
            prediction_label = "No Hand Detected"
            confidence_score = 0.0
            
            if detected:
                # Classify
                label, conf = mh.predict_gesture(model, classes, features)
                
                # Check confidence threshold
                if conf >= confidence_thresh:
                    st.session_state.prediction_buffer.append(label)
                else:
                    st.session_state.prediction_buffer.append("Unknown Gesture")
                    
                # Find majority label in buffer
                buffer_counts = collections.Counter(st.session_state.prediction_buffer)
                prediction_label, count = buffer_counts.most_common(1)[0]
                confidence_score = conf
                
                # Word confirmation logic
                if prediction_label != "Unknown Gesture":
                    if prediction_label == st.session_state.last_added_sign:
                        # Reset frames counter since we've already added it
                        st.session_state.consecutive_frames = 0
                    else:
                        st.session_state.consecutive_frames += 1
                        # If held for 15 frames (~0.5 seconds), confirm and append
                        if st.session_state.consecutive_frames >= 15:
                            st.session_state.sentence.append(prediction_label)
                            st.session_state.last_added_sign = prediction_label
                            st.session_state.consecutive_frames = 0
                            # Optional client-side TTS on confirmation
                            if db.get_setting('tts_enabled', 'true') == 'true':
                                speak_text(prediction_label)
            else:
                # No hand detected -> Reset buffers
                st.session_state.prediction_buffer.clear()
                st.session_state.consecutive_frames = 0
                st.session_state.last_added_sign = ""
                prediction_label = "No Hand Detected"
                confidence_score = 0.0
                
            # Render video feed
            # Convert BGR to RGB for Streamlit st.image
            frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
            camera_placeholder.image(frame_rgb, use_container_width=True)
            
            # Render status panel
            status_color = "#10b981" if detected and prediction_label != "Unknown Gesture" else "#f59e0b"
            if prediction_label == "No Hand Detected":
                status_color = "#6b7280"
            elif prediction_label == "Unknown Gesture":
                status_color = "#ef4444"
                
            prediction_placeholder.markdown(f"""
                <div class="glass-card">
                    <p style="font-size:0.9rem; color: #9ca3af; margin-bottom: 0.25rem;">CURRENT SIGN</p>
                    <div style="font-size: 2.25rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: {status_color}; margin-bottom: 0.5rem;">
                        {prediction_label}
                    </div>
                    <p style="font-size:0.9rem; color: #9ca3af; margin-bottom: 0.25rem;">CONFIDENCE</p>
                    <div style="display:flex; align-items:center; gap: 1rem;">
                        <div style="flex-grow: 1; background: rgba(255,255,255,0.05); height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: {status_color}; width: {int(confidence_score * 100)}%; height: 100%;"></div>
                        </div>
                        <div style="font-weight: 600; color: white; width: 45px; text-align:right;">
                            {int(confidence_score * 100)}%
                        </div>
                    </div>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.75rem;">
                        Hold hand steady for 15 frames to add the letter/word to the sentence builder.
                    </p>
                </div>
            """, unsafe_allow_html=True)
            
            # Render sentence builder
            raw_sentence = "".join(st.session_state.sentence)
            sentence_placeholder.markdown(f"""
                <div class="glass-card" style="min-height: 100px; font-size: 1.5rem; color: white; display: flex; align-items: center; border-left: 4px solid #7c3aed;">
                    {raw_sentence if raw_sentence else '<span style="color:#4b5563; font-style: italic;">No translation yet...</span>'}
                </div>
            """, unsafe_allow_html=True)
            
            # Slow down loop to regulate frame rate (~30fps)
            time.sleep(0.01)
            
        cap.release()
        detector.close()
    else:
        # Camera is stopped -> Show standby page elements
        camera_placeholder.markdown("""
            <div style="aspect-ratio: 4/3; background: #0b0f19; border: 2px dashed rgba(255,255,255,0.05); border-radius: 1.25rem; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #4b5563;">
                <span style="font-size: 4rem; margin-bottom: 1rem;">🎥</span>
                <p style="font-size: 1.1rem; color: #6b7280;">Camera Feed Standby</p>
                <p style="font-size: 0.85rem; color: #4b5563;">Click 'Start Camera' to begin translation feed</p>
            </div>
        """, unsafe_allow_html=True)
        
        prediction_placeholder.markdown("""
            <div class="glass-card">
                <p style="font-size:0.9rem; color: #9ca3af; margin-bottom: 0.25rem;">CURRENT SIGN</p>
                <div style="font-size: 2.25rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #4b5563;">
                    Camera Inactive
                </div>
                <p style="font-size:0.9rem; color: #9ca3af; margin-bottom: 0.25rem; margin-top: 1rem;">CONFIDENCE</p>
                <div style="display:flex; align-items:center; gap: 1rem;">
                    <div style="flex-grow: 1; background: rgba(255,255,255,0.02); height: 10px; border-radius: 5px; overflow: hidden;">
                        <div style="background: #4b5563; width: 0%; height: 100%;"></div>
                    </div>
                    <div style="font-weight: 600; color: #4b5563; width: 45px; text-align:right;">
                        0%
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)
        
        raw_sentence = "".join(st.session_state.sentence)
        sentence_placeholder.markdown(f"""
            <div class="glass-card" style="min-height: 100px; font-size: 1.5rem; color: white; display: flex; align-items: center; border-left: 4px solid #4b5563;">
                {raw_sentence if raw_sentence else '<span style="color:#4b5563; font-style: italic;">No translation yet...</span>'}
            </div>
        """, unsafe_allow_html=True)
