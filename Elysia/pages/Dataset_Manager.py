import streamlit as st
import os
import io
import json
import zipfile
import shutil
from PIL import Image
import utils.ui_helper as ui
import utils.db_manager as db

# Inject custom styles
ui.inject_custom_css()

# Header
ui.page_header(
    title="Dataset Management Center",
    subtitle="Manage your custom signs, inspect frame counts, rename gestures, or export/import the entire dataset.",
    badge_text="Dataset Repository"
)

# Folder paths
DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset')
os.makedirs(DATASET_DIR, exist_ok=True)

# Helper function to generate ZIP in memory
def export_dataset_zip():
    zip_buffer = io.BytesIO()
    gestures = db.get_all_gestures()
    
    # Create metadata mapping
    metadata = {}
    for g in gestures:
        g_id, g_name, g_cat, g_count, g_date = g
        metadata[g_name] = {
            "category": g_cat,
            "created_at": g_date
        }
        
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Write metadata.json
        zip_file.writestr("metadata.json", json.dumps(metadata, indent=4))
        
        # Write images
        for g_name in metadata.keys():
            safe_g_name = "".join([c for c in g_name if c.isalnum() or c in ('_', '-')]).strip()
            g_dir = os.path.join(DATASET_DIR, safe_g_name)
            if os.path.exists(g_dir):
                for img in os.listdir(g_dir):
                    if img.endswith('.jpg'):
                        img_path = os.path.join(g_dir, img)
                        # Store as safe_name/img_name
                        zip_file.write(img_path, os.path.join(safe_g_name, img))
                        
    return zip_buffer.getvalue()

# Layout: Export / Import Tools
st.markdown("### 📤 Import & Export Tools", unsafe_allow_html=True)
col_exp, col_imp = st.columns(2, gap="large")

with col_exp:
    st.markdown("""
        <div class="glass-card" style="height: 100%;">
            <h4 style="color: white; margin-bottom: 0.5rem;">Export Dataset</h4>
            <p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 1.5rem;">
                Back up your entire dataset. It compiles all images and category settings into a portable ZIP package that can be shared or imported.
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    # Fetch ZIP data
    zip_data = export_dataset_zip()
    st.download_button(
        label="📥 Download Dataset (ZIP)",
        data=zip_data,
        file_name="elysia_gesture_dataset.zip",
        mime="application/zip",
        use_container_width=True
    )

with col_imp:
    st.markdown("""
        <div class="glass-card" style="height: 100%;">
            <h4 style="color: white; margin-bottom: 0.5rem;">Import Dataset</h4>
            <p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 0.5rem;">
                Upload an Elysia dataset ZIP to merge with your current files. It imports both the directories and SQLite registers.
            </p>
        </div>
    """, unsafe_allow_html=True)
    
    uploaded_file = st.file_uploader("Choose dataset ZIP file", type="zip", label_visibility="collapsed")
    if uploaded_file is not None:
        try:
            with zipfile.ZipFile(uploaded_file, 'r') as zip_ref:
                # Verify metadata.json exists
                if "metadata.json" not in zip_ref.namelist():
                    st.error("Invalid dataset ZIP file. Missing metadata.json.")
                else:
                    # Extract and read metadata
                    metadata_content = zip_ref.read("metadata.json")
                    metadata = json.loads(metadata_content)
                    
                    # Unzip images
                    zip_ref.extractall(DATASET_DIR)
                    # Delete metadata.json file if extracted to disk to keep dataset clean
                    meta_disk_path = os.path.join(DATASET_DIR, "metadata.json")
                    if os.path.exists(meta_disk_path):
                        os.remove(meta_disk_path)
                        
                    # Sync database
                    for g_name, info in metadata.items():
                        safe_g_name = "".join([c for c in g_name if c.isalnum() or c in ('_', '-')]).strip()
                        g_dir = os.path.join(DATASET_DIR, safe_g_name)
                        
                        if os.path.exists(g_dir):
                            img_count = len([f for f in os.listdir(g_dir) if f.endswith('.jpg')])
                            
                            # Check if exists in db
                            exists = db.execute_query("SELECT id FROM gestures WHERE name = ?", (g_name,), fetch=True, fetchone=True)
                            if exists:
                                db.update_gesture_image_count(g_name, img_count)
                            else:
                                db.add_gesture(g_name, info["category"], img_count)
                                
                    st.success("✅ Dataset imported and merged successfully! Page is refreshing...")
                    time.sleep(1.5)
                    st.rerun()
        except Exception as e:
            st.error(f"Error importing dataset: {e}")

# Gesture Repository Manager
st.markdown("<br><hr style='border-color: rgba(255, 255, 255, 0.05);'>", unsafe_allow_html=True)
st.markdown("### 📁 Gesture Repository Manager", unsafe_allow_html=True)

gestures = db.get_all_gestures()

if not gestures:
    st.markdown("<p style='color: #6b7280; font-style: italic;'>No gestures captured yet. Go to 'Add Gesture' page to capture some signs.</p>", unsafe_allow_html=True)
else:
    for idx, g in enumerate(gestures):
        g_id, g_name, g_cat, g_count, g_date = g
        safe_g_name = "".join([c for c in g_name if c.isalnum() or c in ('_', '-')]).strip()
        g_dir = os.path.join(DATASET_DIR, safe_g_name)
        
        # Grid layout for each gesture card
        with st.container():
            st.markdown(f"""
                <div class="glass-card" style="margin-bottom: 1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                        <div>
                            <span style="font-size:0.75rem; color:#a855f7; font-weight:600; text-transform:uppercase;">{g_cat}</span>
                            <h3 style="color:white; margin:0; font-size:1.4rem;">{g_name}</h3>
                            <p style="color:#6b7280; font-size:0.8rem; margin:0.25rem 0 0 0;">Registered on: {g_date} | Total Frames: <b>{g_count}</b></p>
                        </div>
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
            # Action controls inside card
            c_preview, c_rename, c_delete = st.columns([1, 2, 1], gap="medium")
            
            with c_preview:
                thumb_path = None
                if os.path.exists(g_dir):
                    imgs = [f for f in os.listdir(g_dir) if f.endswith('.jpg')]
                    if imgs:
                        thumb_path = os.path.join(g_dir, imgs[0])
                
                if thumb_path:
                    img = Image.open(thumb_path)
                    st.image(img, caption="Dataset Thumbnail", use_container_width=True)
                else:
                    st.markdown("<div style='aspect-ratio:4/3; background:rgba(255,255,255,0.02); border-radius:0.5rem; display:flex; align-items:center; justify-content:center; color:#4b5563; font-size:0.8rem; height:120px;'>No Frames</div>", unsafe_allow_html=True)
                    
            with c_rename:
                new_name = st.text_input("New Name", value=g_name, key=f"rename_input_{g_id}").strip()
                if st.button("✏️ Rename Gesture", key=f"rename_btn_{g_id}"):
                    if not new_name:
                        st.error("Name cannot be empty.")
                    elif new_name == g_name:
                        st.warning("New name is same as current name.")
                    else:
                        safe_new_name = "".join([c for c in new_name if c.isalnum() or c in ('_', '-')]).strip()
                        new_dir = os.path.join(DATASET_DIR, safe_new_name)
                        
                        try:
                            # Rename folders
                            if os.path.exists(g_dir):
                                os.rename(g_dir, new_dir)
                            # Update DB
                            db.rename_gesture(g_name, new_name)
                            st.success(f"Renamed '{g_name}' to '{new_name}'!")
                            time.sleep(1)
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error renaming: {e}")
                            
            with c_delete:
                st.markdown("<div style='margin-top: 1.5rem;'></div>", unsafe_allow_html=True)
                confirm_del = st.checkbox("Confirm Delete", key=f"confirm_del_{g_id}")
                if st.button("🗑 Delete Gesture", key=f"delete_btn_{g_id}", type="primary", disabled=not confirm_del):
                    try:
                        # Delete folders
                        if os.path.exists(g_dir):
                            shutil.rmtree(g_dir)
                        # Update DB
                        db.delete_gesture(g_name)
                        st.success(f"Deleted '{g_name}' from repository.")
                        time.sleep(1)
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error deleting: {e}")
            
            st.markdown("<div style='height: 1px; background: rgba(255, 255, 255, 0.03); margin-top: 1.5rem; margin-bottom: 1.5rem;'></div>", unsafe_allow_html=True)
