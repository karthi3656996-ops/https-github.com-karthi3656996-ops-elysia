import streamlit as st
import os
import utils.ui_helper as ui
import utils.db_manager as db
import utils.model_helper as mh

# Inject custom styles
ui.inject_custom_css()

# Header
ui.page_header(
    title="Application Configurations",
    subtitle="Customize the AI thresholds, configure input camera hardware, select versioned models, and manage output speech features.",
    badge_text="Control Panel"
)

# Fetch settings from DB
current_cam = int(db.get_setting('camera_index', '0'))
current_thresh = int(db.get_setting('confidence_threshold', '80'))
current_tts = db.get_setting('tts_enabled', 'true') == 'true'
current_model = db.get_setting('model_version', 'latest.keras')

# Layout
col_left, col_right = st.columns(2, gap="large")

with col_left:
    st.markdown("<h3 style='color: white; margin-bottom: 1rem;'>⚙️ Device & Threshold Controls</h3>", unsafe_allow_html=True)
    
    # Camera Index
    new_cam = st.selectbox(
        "Camera Input Source",
        options=[0, 1, 2, 3],
        index=[0, 1, 2, 3].index(current_cam) if current_cam in [0, 1, 2, 3] else 0,
        help="Select the hardware webcam device. Default is 0."
    )
    
    # Confidence Threshold
    new_thresh = st.slider(
        "Confidence Decision Threshold (%)",
        min_value=50,
        max_value=100,
        value=current_thresh,
        step=5,
        help="Predictions below this confidence level will display as 'Unknown Gesture' (Default: 80%)."
    )
    
    # Text-to-Speech
    new_tts = st.toggle(
        "Enable Voice Synthesis (TTS)",
        value=current_tts,
        help="Automatically speak confirmed letters/words aloud as they are recognized."
    )

with col_right:
    st.markdown("<h3 style='color: white; margin-bottom: 1rem;'>🧠 AI Model Version Selector</h3>", unsafe_allow_html=True)
    
    # Retrieve available models
    available_models = mh.get_available_models()
    
    if not available_models:
        st.markdown("""
            <div class="glass-card" style="border-color: rgba(245,158,11,0.2); background: rgba(245,158,11,0.02); padding: 1rem;">
                <p style="color:#f59e0b; font-size:0.875rem; margin:0;">
                    <b>No saved models found.</b><br>
                    Once you record gestures and run a training session, you will see a list of versioned models (e.g. model_v1.keras) here.
                </p>
            </div>
        """, unsafe_allow_html=True)
        new_model = "latest.keras"  # Fallback setting
    else:
        # Sort so latest is first
        default_index = 0
        if current_model in available_models:
            default_index = available_models.index(current_model)
            
        new_model = st.selectbox(
            "Model Version",
            options=available_models,
            index=default_index,
            help="Select the trained model file. You can rollback to previous model versions if needed."
        )
        
        # Display model info if selected
        if new_model != "latest.keras":
            # Retrieve model statistics from training history in database
            model_info = db.execute_query(
                "SELECT timestamp, accuracy, loss, epochs FROM training_history WHERE model_path = ?", 
                (new_model,), 
                fetch=True, 
                fetchone=True
            )
            if model_info:
                time_str, acc, loss, epochs = model_info
                st.markdown(f"""
                    <div class="glass-card" style="padding: 1rem; margin-top: 1rem;">
                        <span style="font-size:0.75rem; color:#7c3aed; font-weight:600; text-transform:uppercase;">MODEL DETAILS</span>
                        <p style="color:white; margin:0.25rem 0; font-size:0.85rem;">Accuracy: <b>{acc*100:.1f}%</b> | Loss: <b>{loss:.4f}</b></p>
                        <p style="color:#6b7280; margin:0; font-size:0.75rem;">Epochs trained: {epochs} | Trained on: {time_str}</p>
                    </div>
                """, unsafe_allow_html=True)

st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)

# Save settings button
if st.button("💾 Save Configurations", type="primary", use_container_width=True):
    db.set_setting('camera_index', str(new_cam))
    db.set_setting('confidence_threshold', str(new_thresh))
    db.set_setting('tts_enabled', 'true' if new_tts else 'false')
    db.set_setting('model_version', new_model)
    
    st.success("✅ Configurations successfully updated and saved!")
    st.rerun()
