import streamlit as st
import os
import cv2
import pandas as pd
import numpy as np
import utils.ui_helper as ui
import utils.db_manager as db
from utils.landmark_extractor import HandLandmarkExtractor
import utils.model_helper as mh

# Inject custom styles
ui.inject_custom_css()

# Header
ui.page_header(
    title="AI Model Training Center",
    subtitle="Extract landmarks from your gesture dataset and train a custom neural network.",
    badge_text="AI Training Pipeline"
)

# Folder paths
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset')

# Check if we have any gestures
gestures = db.get_all_gestures()

if not gestures:
    st.markdown("""
        <div class="glass-card" style="border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05);">
            <h3 style="color: #f59e0b; margin-bottom: 0.5rem;">⚠️ No Gestures Available</h3>
            <p style="color: #9ca3af; font-size: 0.90rem; margin-bottom: 1rem;">
                You haven't captured any gestures yet. Please capture at least 2 gestures before training a model.
            </p>
            <a href="/Add_Gesture" target="_self" class="btn-neon" style="text-decoration: none;">📸 Go to Capture Page</a>
        </div>
    """, unsafe_allow_html=True)
else:
    # Check total image count
    total_images = sum([g[3] for g in gestures])
    
    st.markdown(f"""
        <div class="glass-card">
            <h4 style="color: white; margin-bottom: 0.75rem;">📊 Dataset Summary</h4>
            <div style="display: flex; gap: 2rem; color: #9ca3af; font-size: 0.95rem;">
                <div>Total Classes: <b style="color: white;">{len(gestures)}</b></div>
                <div>Total Training Frames: <b style="color: white;">{total_images}</b></div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Configuration form
    col_params, col_action = st.columns([2, 1], gap="medium")
    
    with col_params:
        epochs = st.slider("Epochs (Training cycles)", min_value=10, max_value=200, value=50, step=10)
        batch_size = st.selectbox("Batch Size", [16, 32, 64, 128], index=1)
        
    with col_action:
        st.markdown("<div style='margin-top: 1.8rem;'></div>", unsafe_allow_html=True)
        # Verify training can proceed
        can_train = len(gestures) >= 2 and total_images >= 100
        if not can_train:
            st.warning("Ensure you have at least 2 gestures and 100+ images in total.")
            st.button("⚙️ Train AI Model", disabled=True, use_container_width=True)
        else:
            train_clicked = st.button("⚙️ Train AI Model", type="primary", use_container_width=True)

    if can_train and train_clicked:
        st.markdown("<hr style='border-color: rgba(255,255,255,0.05);'>", unsafe_allow_html=True)
        
        # UI Placeholders
        extraction_status = st.empty()
        training_progress = st.empty()
        training_logs = st.empty()
        
        extraction_status.info("🔍 Phase 1: Extracting Hand Landmarks from images using MediaPipe...")
        progress_bar = st.progress(0.0)
        
        # MediaPipe Hand Landmarks Extraction
        detector = HandLandmarkExtractor(max_num_hands=2)
        
        X = []
        y = []
        classes = []
        
        # Sort gestures to ensure alphabetic order
        sorted_gestures = sorted(gestures, key=lambda x: x[1])
        class_mapping = {}
        for idx, g in enumerate(sorted_gestures):
            g_id, g_name, g_cat, g_count, g_date = g
            class_mapping[g_name] = idx
            classes.append(g_name)
            
        processed_images = 0
        total_valid_landmarks = 0
        
        for g_idx, g in enumerate(sorted_gestures):
            g_id, g_name, g_cat, g_count, g_date = g
            safe_g_name = "".join([c for c in g_name if c.isalnum() or c in ('_', '-')]).strip()
            g_dir = os.path.join(DATASET_DIR, safe_g_name)
            
            if not os.path.exists(g_dir):
                continue
                
            imgs = [f for f in os.listdir(g_dir) if f.endswith('.jpg')]
            
            for img_name in imgs:
                img_path = os.path.join(g_dir, img_name)
                frame = cv2.imread(img_path)
                if frame is None:
                    continue
                    
                # Run landmarks detection (mirror-friendly layout)
                features, _, detected = detector.extract_landmarks(frame)
                
                if detected:
                    X.append(features)
                    y.append(class_mapping[g_name])
                    total_valid_landmarks += 1
                    
                processed_images += 1
                progress_bar.progress(processed_images / total_images)
                
        detector.close()
        progress_bar.empty()
        
        if total_valid_landmarks < 50:
            extraction_status.error(f"❌ Extraction complete. Found only {total_valid_landmarks} valid landmarks. MediaPipe was unable to detect hands in your images. Please recapture in better lighting.")
        elif len(np.unique(y)) < 2:
            extraction_status.error("❌ Insufficient classes with valid landmarks detected. Make sure at least 2 gestures have images where hands are clearly visible.")
        else:
            extraction_status.success(f"✅ Joint extraction complete! Successfully extracted landmarks from {total_valid_landmarks} / {processed_images} frames.")
            
            # Convert to numpy arrays
            X_arr = np.array(X, dtype=np.float32)
            y_arr = np.array(y, dtype=np.int32)
            
            # Phase 2: Train model
            training_progress.info("🧠 Phase 2: Training Neural Network Model (TensorFlow/Keras)...")
            epoch_progress = st.progress(0.0)
            epoch_status = st.empty()
            
            # Instantiate Keras Streamlit callback
            st_cb = mh.StreamlitTrainingCallback(epoch_progress, epoch_status, epochs)
            
            try:
                # Train model
                history, model_name, val_acc, val_loss = mh.train_gesture_model(
                    X_arr, y_arr, classes, 
                    epochs=epochs, batch_size=batch_size, 
                    st_callback=st_cb
                )
                
                # Clear progress widgets
                epoch_progress.empty()
                epoch_status.empty()
                training_progress.empty()
                
                # Show success
                st.markdown(f"""
                    <div style="text-align:center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 1rem; margin-bottom: 1.5rem;">
                        <h2 style="color: #10b981; margin-bottom: 0.25rem;">🏆 Training Successful!</h2>
                        <p style="color: #fff; font-size: 0.95rem; margin-bottom: 0.5rem;">
                            Model successfully saved as <b>{model_name}</b> and copied as <b>latest.keras</b>.
                        </p>
                        <p style="color: #9ca3af; font-size: 0.85rem; margin: 0;">
                            Validation Accuracy: <b>{val_acc*100:.2f}%</b> | Validation Loss: <b>{val_loss:.4f}</b>.
                        </p>
                    </div>
                """, unsafe_allow_html=True)
                
                # Plot accuracy/loss graphs
                st.markdown("### 📈 Training Curves", unsafe_allow_html=True)
                col_graph1, col_graph2 = st.columns(2)
                
                hist_df = pd.DataFrame(history.history)
                
                with col_graph1:
                    st.markdown("##### Accuracy")
                    st.line_chart(hist_df[['accuracy', 'val_accuracy']], height=220)
                with col_graph2:
                    st.markdown("##### Loss")
                    st.line_chart(hist_df[['loss', 'val_loss']], height=220)
                    
            except Exception as e:
                training_progress.error(f"❌ Error during training: {e}")

# History Grid
st.markdown("<hr style='border-color: rgba(255, 255, 255, 0.05);'>", unsafe_allow_html=True)
st.markdown("### 📜 Past Training Sessions", unsafe_allow_html=True)

history_data = db.get_training_history()

if not history_data:
    st.markdown("<p style='color: #6b7280; font-style: italic;'>No training history available yet.</p>", unsafe_allow_html=True)
else:
    # Format database history into a pretty pandas DataFrame
    history_df = pd.DataFrame(
        history_data,
        columns=["ID", "Timestamp", "Accuracy", "Loss", "Epochs", "Model Name"]
    )
    # Format Accuracy as percentage
    history_df["Accuracy"] = history_df["Accuracy"].apply(lambda x: f"{x*100:.1f}%")
    history_df["Loss"] = history_df["Loss"].apply(lambda x: f"{x:.4f}")
    
    st.dataframe(
        history_df.set_index("ID"),
        use_container_width=True
    )
