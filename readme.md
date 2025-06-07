A PySide6 desktop application to control brightness, dimness, and overlay opacity across up to 8 monitors. Supports hotkey toggling, profile saving, and visual monitor previews.

---

## 🖥️ Features

- **Auto Mode**: Adjust and lock brightness on selected monitors  
- **Manual (Toggle) Mode**: Alternate between two brightness states (e.g., Day/Night)  
- **Overlay Opacity**: Apply a dark transparent layer to mimic dimming  
- **Per-monitor settings**: Individual brightness, dimness, and overlays  
- **Hotkey toggle**: Instantly switch between brightness states  
- **Profile manager**: Save and load complete configurations  
- **Visual UI**: Clickable, labeled monitor representations  

---

## 🛠 Installation

### Prerequisites

- Python 3.8+  
- Windows or Linux (macOS not tested)  
- May require admin privileges for `screen_brightness_control`

### Install Dependencies
pip install -r requirements.txt


### Run
python monitorShade.py

---

## 📁 Project Structure

    .
    ├── monitorShade.py         # Main application file
    ├── readme.md               # This file
    ├── requirements.txt        # Dependencies
    ├── profiles.json           # Auto-generated saved profiles
    ├── monitorShade.spec       # PyInstaller config (includes icon)
    ├── assets/                 # Icons and monitor images
    │   ├── monitorImage_on.png     # Monitor frame (bright)
    │   ├── monitorImage_off.png    # Monitor frame (dim)
    │   ├── logo_160w.png           # Sidebar logo
    │   ├── icon2.png               # PyInstaller icon (alt 1)
    │   └── icon3.png               # PyInstaller icon (alt 2)
    ├── dist/                   # PyInstaller output
    └── build/                  # PyInstaller temp files

---

## 🚀 Running the App



To build a Windows executable:
pyinstaller --noconfirm --onefile --windowed monitorShade.spec

Make sure the `.spec` file references `icon2.png` or `icon3.png` as the icon for the executable.
Built icon file can also be found in assets/monitor-icon.ico

---

## 🔐 Hotkey Tips

- Set a global toggle (e.g., Ctrl + Shift + B) via the app UI  
- Applies only in Manual Mode  
- Saved per profile

---

## ✅ Roadmap

- [ ] System tray support  
- [ ] Named monitor detection  
- [ ] Profile export/import

---

## 📝 License

MIT License © 2025