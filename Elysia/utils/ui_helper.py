import streamlit as st

def inject_custom_css():
    """Inject custom premium glassmorphism and neon styles matching the Wix design template."""
    # Hide default Streamlit header, footer, and menu items to maximize premium feel
    hide_streamlit_style = """
        <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        
        /* App Background with Radial Gradients */
        .stApp {
            background-color: #030712 !important;
            color: #f9fafb !important;
            font-family: 'Inter', sans-serif !important;
            position: relative;
        }
        .stApp::before {
            content: '';
            position: fixed;
            inset: 0;
            background: radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #030712;
        }
        ::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #7c3aed;
        }
        </style>
    """
    st.markdown(hide_streamlit_style, unsafe_allow_html=True)
    
    # Import Google Fonts
    st.markdown(
        """
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        """,
        unsafe_allow_html=True
    )
    
    # Custom CSS code for cards, buttons, titles, etc.
    custom_css = """
        <style>
        /* Base typography overrides */
        h1, h2, h3, h4, h5, h6, .font-display {
            font-family: 'Space Grotesk', sans-serif !important;
            font-weight: 700;
        }
        
        div.stMarkdown p, div.stText, span, label {
            font-family: 'Inter', sans-serif !important;
        }
        
        /* Pulsing Rings Animation */
        .rings {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 0;
        }
        .ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid;
        }
        .ring1 {
            width: 400px;
            height: 400px;
            border-color: rgba(168, 85, 247, 0.12);
            animation: pulse 4s ease-in-out infinite;
        }
        .ring2 {
            width: 600px;
            height: 600px;
            border-color: rgba(124, 58, 237, 0.08);
            animation: pulse 5s ease-in-out infinite 0.5s;
        }
        .ring3 {
            width: 800px;
            height: 800px;
            border-color: rgba(168, 85, 247, 0.05);
            animation: pulse 6s ease-in-out infinite 1s;
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 0.4;
                transform: scale(1);
            }
            50% {
                opacity: 1;
                transform: scale(1.03);
            }
        }
        
        /* Glassmorphism Cards */
        .glass-card {
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 1.25rem !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            padding: 1.5rem;
            margin-bottom: 1.25rem;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
        }
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.07) !important;
            border-color: rgba(168, 85, 247, 0.3) !important;
            box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.15) !important;
            transform: translateY(-2px);
        }
        
        /* Stats Container & Boxes */
        .stat-container {
            display: flex;
            justify-content: space-between;
            gap: 1.5rem;
            flex-wrap: wrap;
            margin-bottom: 2.5rem;
            position: relative;
            z-index: 1;
        }
        .stat-box {
            flex: 1;
            min-width: 200px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 1.25rem;
            padding: 1.5rem 2rem;
            text-align: center;
            backdrop-filter: blur(20px);
            transition: all 0.3s;
        }
        .stat-box:hover {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(168, 85, 247, 0.3);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .stat-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
            margin-bottom: 0.25rem;
        }
        .stat-label {
            font-size: 0.85rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        /* Neon Badges */
        .neon-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.375rem 1rem;
            border-radius: 9999px;
            border: 1px solid rgba(168, 85, 247, 0.3);
            background: rgba(168, 85, 247, 0.1);
            color: #c084fc;
            font-size: 0.75rem;
            font-weight: 500;
            margin-bottom: 1.5rem;
        }
        
        /* Glowing Titles */
        .glowing-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 800;
            color: #ffffff;
            line-height: 1.1;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 60px rgba(168, 85, 247, 0.4);
        }
        .glowing-title span {
            background: linear-gradient(135deg, #c084fc, #7c3aed);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .section-desc {
            font-size: 1.1rem;
            color: #6b7280;
            margin-bottom: 2.5rem;
            max-width: 600px;
        }
        
        /* Custom Button Styling */
        .btn-neon {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            color: #fff !important;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
            transition: all 0.3s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
            cursor: pointer;
        }
        .btn-neon:hover {
            box-shadow: 0 0 35px rgba(168, 85, 247, 0.7);
            transform: translateY(-1px);
        }
        
        .btn-outline {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 600;
            color: #c084fc !important;
            border: 1px solid rgba(168, 85, 247, 0.5) !important;
            background: transparent;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }
        .btn-outline:hover {
            background: rgba(168, 85, 247, 0.1);
            border-color: rgba(168, 85, 247, 0.8) !important;
        }
        
        /* Overriding Native Streamlit Buttons to match theme */
        div[data-testid="stBaseButton-primary"] button {
            background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
            color: #ffffff !important;
            border: none !important;
            font-family: 'Space Grotesk', sans-serif !important;
            font-weight: 600 !important;
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.35) !important;
            transition: all 0.3s ease !important;
            border-radius: 0.75rem !important;
        }
        div[data-testid="stBaseButton-primary"] button:hover {
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.6) !important;
            transform: translateY(-1px) !important;
        }
        
        div[data-testid="stBaseButton-secondary"] button {
            background: transparent !important;
            color: #c084fc !important;
            border: 1px solid rgba(168, 85, 247, 0.5) !important;
            font-family: 'Space Grotesk', sans-serif !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            border-radius: 0.75rem !important;
        }
        div[data-testid="stBaseButton-secondary"] button:hover {
            background: rgba(168, 85, 247, 0.1) !important;
            border-color: rgba(168, 85, 247, 0.8) !important;
        }
        
        /* Feature icons */
        .feature-icon {
            width: 48px;
            height: 48px;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, rgba(124,58,237,.3), rgba(168,85,247,.3));
            border: 1px solid rgba(168,85,247,.2);
        }
        
        /* Overrides for sidebar navigation panel */
        section[data-testid="stSidebar"] {
            background-color: #030712 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
            z-index: 100;
        }
        section[data-testid="stSidebar"] [data-testid="stSidebarNavItems"] li {
            margin-bottom: 0.25rem !important;
        }
        section[data-testid="stSidebar"] [data-testid="stSidebarNavItems"] a {
            border-radius: 0.5rem !important;
            font-family: 'Space Grotesk', sans-serif !important;
            font-weight: 500 !important;
            color: #9ca3af !important;
            transition: all 0.2s !important;
        }
        section[data-testid="stSidebar"] [data-testid="stSidebarNavItems"] a:hover {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.05) !important;
        }
        section[data-testid="stSidebar"] [data-testid="stSidebarNavItems"] a[aria-current="page"] {
            color: #c084fc !important;
            background: rgba(168, 85, 247, 0.15) !important;
            border: 1px solid rgba(168, 85, 247, 0.3) !important;
        }
        
        /* Inputs & forms styling */
        .stTextInput>div>div>input, .stSelectbox>div>div>div, .stSlider>div>div {
            background-color: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            color: white !important;
            border-radius: 0.5rem !important;
        }
        </style>
    """
    st.markdown(custom_css, unsafe_allow_html=True)

def page_header(title, subtitle, badge_text=None):
    """Renders a standard beautiful gradient header with optional badge."""
    inject_custom_css()
    
    header_html = ""
    if badge_text:
        header_html += f'<div class="neon-badge">❤️ {badge_text}</div>'
        
    header_html += f"""
        <div class="glowing-title">{title}</div>
        <div class="section-desc">{subtitle}</div>
    """
    st.markdown(header_html, unsafe_allow_html=True)
