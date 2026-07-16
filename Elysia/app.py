import streamlit as st
import os

# Set global page configuration
st.set_page_config(
    page_title="Elysia - AI Sign Language Translator",
    page_icon="🤟",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Define pages relative to the app root
home_page = st.Page("pages/Home.py", title="Home", icon="🏠", default=True)
translator_page = st.Page("pages/Translator.py", title="Real-Time Translator", icon="🤟")
add_gesture_page = st.Page("pages/Add_Gesture.py", title="Add Gesture", icon="📸")
train_page = st.Page("pages/Train_Model.py", title="AI Training Page", icon="🧠")
dataset_page = st.Page("pages/Dataset_Manager.py", title="Dataset Management", icon="📁")
settings_page = st.Page("pages/Settings.py", title="Settings", icon="⚙️")

# Create navigation list
pg = st.navigation({
    "Navigation": [home_page, translator_page],
    "Developer & Dataset tools": [add_gesture_page, train_page, dataset_page, settings_page]
})

# Inject logo at top of sidebar
st.sidebar.markdown("""
    <div style="display:flex; align-items:center; gap:0.6rem; margin-top: 1rem; margin-bottom: 2rem; padding-left: 0.5rem;">
        <div style="width:32px; height:32px; position:relative; display:inline-block;">
            <div style="position:absolute; inset:0; border-radius:4px; transform:rotate(45deg); background:#7c3aed;"></div>
            <div style="position:absolute; inset:4px; border-radius:4px; transform:rotate(45deg); background:#030712;"></div>
            <div style="position:absolute; inset:7px; border-radius:4px; transform:rotate(45deg); background:#a855f7;"></div>
        </div>
        <span style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.4rem; color:#fff; text-shadow:0 0 20px rgba(168,85,247,0.6);">Elysia</span>
    </div>
""", unsafe_allow_html=True)

# Run the selected page
pg.run()

