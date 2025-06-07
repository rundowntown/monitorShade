A PySide6 desktop application to control brightness, dimness, and overlay opacity across up to 8 monitors. Supports hotkey toggling, profile saving, and visual monitor previews.

---
<p align="center">
  <img src="/Readme_Images/toggle-mode.png" alt="Toggle Mode" width="80%">
</p>

🖥️ Multi-Monitor Brightness Controller
This app was originally built as a personal tool for a multi-monitor setup. Its core functionality is to apply toggleable brightness and configuration presets per monitor, making it easy to switch between customized setups—or manually adjust each screen—on the fly. It supports up to 8 monitors on the same system.

#### 🌙 Dark Overlay Feature
Some monitors won’t dim as low as desired even at their lowest brightness settings. To solve this, the app includes a Dark Overlay feature, which places a semi-transparent black layer over each selected screen. This allows you to dim monitors far beyond their built-in limits—without modifying any monitor hardware or firmware. You can control the overlay’s transparency to achieve nearly pitch-black output when needed.

<p align="center">
  <img src="/Readme_Images/dim-select.png" alt="Toggle Mode" width="60%">
</p>


Seriously it can get very dark.
<p align="center">
  <img src="/Readme_Images/darkness.png" alt="Toggle Mode" width="60%">
</p>  


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

## ✅ Roadmap (Read: Likely never)

- [ ] System tray support  
- [ ] Named monitor detection  
- [ ] Profile export/import

---

## 📝 License

MIT License © 2025  

rundowntown / daniel forcade
