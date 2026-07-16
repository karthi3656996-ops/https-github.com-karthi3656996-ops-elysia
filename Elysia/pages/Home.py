import streamlit as st
import os
import cv2
import utils.ui_helper as ui
import utils.db_manager as db

# Inject styling
ui.inject_custom_css()

# Fetch stats from SQLite
gestures = db.get_all_gestures()
total_gestures = len(gestures)
total_images = sum([g[3] for g in gestures]) if total_gestures > 0 else 0
last_acc = db.get_setting('last_accuracy', 'N/A')
last_trained = db.get_setting('last_trained_date', 'Never')

# Check camera status
camera_idx = int(db.get_setting('camera_index', '0'))
cap = cv2.VideoCapture(camera_idx)
if cap.isOpened():
    camera_status = "Connected"
    cap.release()
else:
    camera_status = "Disconnected"

# Wix-Inspired Hero Section with Pulsing Rings
st.markdown("""
    <section class="hero" style="min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 5rem 1rem 3rem; position: relative; overflow: hidden; z-index: 1;">
        <div class="rings">
            <div class="ring ring1"></div>
            <div class="ring ring2"></div>
            <div class="ring ring3"></div>
        </div>
        <div class="neon-badge" style="z-index: 2;">❤️ AI-Powered Accessibility Platform</div>
        <h1 style="font-family:'Space Grotesk',sans-serif; font-weight:800; font-size: clamp(4rem, 10vw, 8rem); color:#fff; line-height:1; margin-bottom:1rem; text-shadow:0 0 80px rgba(168,85,247,.5),0 0 160px rgba(124,58,237,.25); z-index: 2;">Elysia</h1>
        <p style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); color:#9ca3af; max-width:650px; margin-bottom:0.75rem; line-height:1.5; font-family:'Inter',sans-serif; z-index: 2;">
            Breaking barriers through <span style="background:linear-gradient(135deg,#c084fc,#7c3aed,#a855f7); background-size:200%; -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; font-weight:700;">AI-powered sign language translation</span>
        </p>
        <p style="color:#6b7280; font-size: 1rem; max-width:520px; margin-bottom:2.5rem; line-height:1.6; font-family:'Inter',sans-serif; z-index: 2;">
            Helping deaf and mute individuals communicate naturally using real-time hand gesture recognition. No apps. No hardware. Just your hands.
        </p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; z-index: 2;">
            <a href="/Translator" target="_self" class="btn-neon">▶ Start Translating</a>
            <a href="/Add_Gesture" target="_self" class="btn-outline">🤚 Add New Sign →</a>
        </div>
    </section>
""", unsafe_allow_html=True)

# Wix-Inspired Stats Section
st.markdown(f"""
    <section class="stats" style="padding: 2rem 1rem; display: flex; justify-content: center; position: relative; z-index: 1;">
        <div style="background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 1.25rem; backdrop-filter: blur(20px); padding: 2rem 3rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 3rem; width: 100%; max-width: 1000px;">
            <div style="text-align: center;">
                <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.5rem; color:#fff; text-shadow:0 0 20px rgba(168,85,247,.5);">&lt;100ms</div>
                <div style="color:#6b7280; font-size:.875rem; margin-top:.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Latency</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.5rem; color:#fff; text-shadow:0 0 20px rgba(168,85,247,.5);">21</div>
                <div style="color:#6b7280; font-size:.875rem; margin-top:.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Hand Landmarks</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.5rem; color:#fff; text-shadow:0 0 20px rgba(168,85,247,.5);">∞</div>
                <div style="color:#6b7280; font-size:.875rem; margin-top:.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Custom Gestures</div>
            </div>
            <div style="text-align: center;">
                <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.5rem; color:#fff; text-shadow:0 0 20px rgba(168,85,247,.5);">100%</div>
                <div style="color:#6b7280; font-size:.875rem; margin-top:.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Browser-based</div>
            </div>
        </div>
    </section>
""", unsafe_allow_html=True)

# Layout Split: CTA Dashboard
col1, col2 = st.columns([1, 1], gap="large")

with col1:
    st.markdown(f"""
        <div class="glass-card" style="height: 100%;">
            <h3 style="color: #ffffff; margin-bottom: 1rem; font-size: 1.5rem;">📊 Repository Dashboard</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem; color: #9ca3af; font-size: 0.95rem;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                    <span>Total Gestures:</span>
                    <strong style="color: white;">{total_gestures}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                    <span>Total Captured Images:</span>
                    <strong style="color: white;">{total_images}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                    <span>Active Model Accuracy:</span>
                    <strong style="color: #c084fc;">{last_acc}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                    <span>Camera Status (Source {camera_idx}):</span>
                    <strong style="color: {'#10b981' if camera_status == 'Connected' else '#ef4444'};">{camera_status}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom: 0.5rem;">
                    <span>Last Trained:</span>
                    <strong style="color: white;">{last_trained}</strong>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
        <div class="glass-card" style="height: 100%;">
            <h3 style="color: #ffffff; margin-bottom: 1rem; font-size: 1.5rem;">🧠 Machine Learning Pipeline</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem; color: #9ca3af; font-size: 0.925rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #7c3aed; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.8rem;">1</div>
                    <div><b>Webcam Stream:</b> Captures frames locally at up to 30 frames per second.</div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #7c3aed; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.8rem;">2</div>
                    <div><b>MediaPipe Tracking:</b> Extracts 21 coordinate points (X, Y, Z) per hand.</div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #7c3aed; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.8rem;">3</div>
                    <div><b>TensorFlow AI:</b> Classifies the combined 126 landmark features into signs.</div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                    <div style="background: #7c3aed; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 0.8rem;">4</div>
                    <div><b>Smoothing & TTS:</b> Smooths predictions and speaks words via Web Speech API.</div>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

st.markdown("""
    <br>
    <div style="text-align: center; margin-bottom: 3.5rem;">
        <p style="color: #a855f7; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Capabilities</p>
        <h2 style="font-family:'Space Grotesk',sans-serif; font-size: 2.25rem; color: white; margin: 0 0 1rem 0;">Everything you need to <br><span style="background:linear-gradient(135deg,#c084fc,#7c3aed); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;">communicate freely</span></h2>
    </div>
""", unsafe_allow_html=True)

# Features Grid
feat_col1, feat_col2, feat_col3 = st.columns(3, gap="medium")

with feat_col1:
    st.markdown("""
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(168,85,247,.3))">🤚</div>
            <h3>Real-Time Translation</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">MediaPipe AI detects 21 joints per hand and translates sign language into text with sub-100ms latency.</p>
        </div>
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(99,102,241,.3))">🔒</div>
            <h3>Private & Offline-Ready</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">All AI processes run in your browser or local system. No video is ever sent to external cloud servers.</p>
        </div>
    """, unsafe_allow_html=True)

with feat_col2:
    st.markdown("""
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(124,58,237,.3))">🧠</div>
            <h3>Custom AI Training</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">Record your own hand positions, label them, and compile a custom neural network that learns your unique signing style.</p>
        </div>
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(139,92,246,.3),rgba(124,58,237,.3))">📂</div>
            <h3>Dataset Backups</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">Export your custom sign files as ZIP archives or import external packages to collaborate on shared sign systems.</p>
        </div>
    """, unsafe_allow_html=True)

with feat_col3:
    st.markdown("""
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(168,85,247,.3),rgba(219,39,119,.2))">🔊</div>
            <h3>Voice Synthesis</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">Synthesizes translated words aloud using the high-fidelity browser voice engine, enabling fluid two-way talks.</p>
        </div>
        <div class="glass-card">
            <div class="feature-icon" style="background:linear-gradient(135deg,rgba(79,70,229,.3),rgba(124,58,237,.3))">⚙️</div>
            <h3>Advanced Configs</h3>
            <p style="color: #9ca3af; font-size: 0.875rem;">Select webcam inputs, slide confidence thresholds, or rollback to older versioned model classifications.</p>
        </div>
    """, unsafe_allow_html=True)

# Footer
st.markdown("""
    <div style="margin-top: 4rem; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 2rem; color: #4b5563; font-size: 0.85rem;">
        © 2026 Elysia · Built for accessibility · Powered by AI ❤️
    </div>
""", unsafe_allow_html=True)
