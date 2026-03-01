<div align="center">

# MonitorShade

**Multi-monitor brightness control for Windows.**
Dim any screen beyond hardware limits. Save profiles. Switch with a hotkey.

[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D4?style=flat-square&logo=windows)](https://github.com/rundowntown/monitorShade)
[![Version](https://img.shields.io/badge/version-2.0.0-6366f1?style=flat-square)](https://github.com/rundowntown/monitorShade/releases)
[![Electron](https://img.shields.io/badge/Electron-34-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)

</div>

---

> Whether you're reducing eye strain at night, setting up a dark room for movies, or just want your side monitors dimmer while you work — MonitorShade has you covered.

<p align="center">
  <img src="assets/demo.gif" alt="MonitorShade demo" width="720">
</p>

---

## Getting Started

### Download & Install

| Method | How |
|---|---|
| **Installer** | Run `MonitorShade Setup 2.0.0.exe` — picks your install folder, adds a Start Menu shortcut |
| **Portable** | Run `MonitorShade.exe` from the `win-unpacked` folder — nothing installed, just run it |

Both are in the `screendim/release/` folder.

### Requirements

- **Windows 10 or 11**
- **Python 3.8+** (optional) — only needed if you want to control your monitor's *actual hardware brightness* via DDC/CI. Install the dependency with:

```
pip install screen-brightness-control
```

If you skip Python, the **dark overlay** still works — it places a transparent tinted layer over your screen to reduce brightness visually.

---

## How It Works

MonitorShade gives you two ways to dim a screen:

| Method | What it does | Python required? |
|---|---|---|
| **Hardware brightness** | Talks directly to your monitor to change its backlight level (0–100%) | Yes |
| **Dark overlay** | Places a transparent colored layer on top of your screen, dimming it beyond what the hardware slider can reach | No |

You can use either or both at the same time. The overlay is especially useful for screens that don't support DDC/CI (like many laptops) or when you need to go *darker than dark*.

---

## Using the App

### Dashboard

Open MonitorShade and you see your monitors laid out visually. Each one shows its current brightness and has its own slider.

| Action | What happens |
|---|---|
| **Click a monitor** | Select it — adjust brightness or overlay independently |
| **"Control All" toggle** | Adjust every monitor at once |
| **Drag a monitor** | Rearrange the canvas to match your physical desk layout |
| **Double-click a name** | Rename it (e.g., "Display 2" → "Right Ultrawide") |

### Modes

| Mode | Behavior |
|---|---|
| **Auto** | Set your levels and they stay put |
| **Toggle** | Flip between two brightness presets with a hotkey — dim ↔ bright in one keystroke |

### Profiles

Save any setup as a **profile** you can recall instantly:

1. Adjust your monitors how you like them
2. Click **Save** — name it and pick an emoji (e.g., 🎬 Movie Night)
3. Restore it anytime from the app or the system tray

### System Tray

Closing the window doesn't quit MonitorShade — it stays in your system tray. Right-click the icon to:

- **Switch profiles** without opening the window
- **Full Power** — reset all monitors to 100%
- **Open** or **Quit**

### Global Hotkeys

Assign a shortcut (e.g., `Ctrl+Shift+D`) in **Settings → Hotkeys**. Works even when MonitorShade is in the background — no need to alt-tab.

### Themes

Five built-in themes: **Dark** · **Light** · **Midnight** · **Forest** · **Georgia Tech**

When your screens are dimmed low, the UI automatically flips to high-contrast **Tron mode** so controls stay readable. You can also drag-and-drop a custom logo onto the sidebar for each theme.

---

## What's New in v2.0

Complete rewrite from Python/PySide6 to **Electron + React + TypeScript**.

| Area | What changed |
|---|---|
| **UI** | Free-form drag-and-drop monitor grid, 5 themes, animated canvas border |
| **Profiles** | Named presets with emoji icons, one-click switching from app or tray |
| **Overlay** | Per-monitor dark overlays that dim beyond hardware limits |
| **Hotkeys** | Global shortcuts that work even when the app is unfocused |
| **Tray** | Runs in background, profile switching from system tray |
| **Architecture** | Multi-process Electron with IPC bridge, Zustand state, Python subprocess for DDC/CI |

---

## For Developers

<details>
<summary><strong>Dev setup, build commands, tech stack, and project structure</strong></summary>

<br>

### Quick Start

```bash
cd screendim
npm install
```

### Run in development

```bash
npm run dev
```

Starts Vite (frontend), TypeScript watcher (main process), and Electron concurrently.

### Build

```bash
npm run build              # Compile main + renderer
npm run electron:build     # Package as .exe installer
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Electron 34 |
| Frontend | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| Persistence | electron-store 8 |
| Brightness | Python screen_brightness_control (via subprocess) |
| Packaging | electron-builder 25 |

### Project Structure

```
screendim/
  src/
    main/                    # Electron main process
      main.ts                # Window management, app lifecycle
      preload.ts             # Secure IPC bridge
      services/
        brightness.ts        # WMI/DDC brightness via Python sbc
        overlay.ts           # Transparent overlay windows
        profiles.ts          # electron-store persistence
        monitors.ts          # Display detection
        tray.ts              # System tray with profile switching
        hotkeys.ts           # Global keyboard shortcuts
      ipc/
        handlers.ts          # IPC message handlers
    renderer/                # React frontend
      App.tsx                # Root with theme + tron system
      pages/
        Dashboard.tsx        # Main displays + controls page
        ProfilesPage.tsx     # Profile management with emoji picker
        SettingsPage.tsx     # Themes, hotkeys, general settings
      components/
        layout/              # TitleBar, Sidebar, AppLogo
        monitors/            # MonitorCard, MonitorGrid (drag & drop)
        controls/            # BrightnessSlider, OverlaySlider, ModeToggle
      stores/                # Zustand state (monitors, profiles, settings)
      hooks/                 # useMonitors, useBrightness, useProfiles, useTheme
      themes/                # 5 theme definitions with CSS variable system
      styles/                # Global CSS, animations, slider styling
    shared/
      types.ts               # Shared TypeScript interfaces
      constants.ts           # IPC channels, defaults
  assets/
    icons/                   # App icons (.ico, .png)
  legacy/                    # Original Python v1.0 (monitorShade.py)
```

</details>

---

## Architecture

```mermaid
graph TB
    subgraph MainProcess [Electron Main Process]
        Main[main.ts<br/>Window & Lifecycle]
        IPC[IPC Handlers]
        BrightSvc[BrightnessService<br/>Python sbc subprocess]
        OverlaySvc[OverlayManager<br/>Transparent BrowserWindows]
        ProfileSvc[ProfileStore<br/>electron-store JSON]
        TraySvc[TrayManager<br/>Context menu + profiles]
        HotkeySvc[GlobalHotkeys<br/>Electron globalShortcut]
        MonitorSvc[MonitorDetection<br/>Electron screen API]
    end

    subgraph Renderer [React Frontend]
        App[App.tsx<br/>Theme + Tron system]
        Dashboard[Dashboard<br/>Monitor grid + controls]
        Profiles[ProfilesPage<br/>CRUD + emoji picker]
        Settings[SettingsPage<br/>Themes + hotkeys]
        MonitorGrid[MonitorGrid<br/>Free-form drag & drop]
        MonitorCard[MonitorCard<br/>Bezel + brightness viz]
        Stores[Zustand Stores<br/>monitors, profiles, settings]
        Themes[Theme Engine<br/>5 themes + CSS variables]
    end

    subgraph OS [Windows OS Layer]
        PythonSBC[Python<br/>screen_brightness_control]
        WMI[WMI / DDC-CI]
        Displays[Physical Displays]
        SysTray[System Tray]
    end

    App --> Dashboard
    App --> Profiles
    App --> Settings
    App --> Themes
    Dashboard --> MonitorGrid
    MonitorGrid --> MonitorCard
    Dashboard --> Stores

    Renderer ---|contextBridge IPC| MainProcess

    Main --> IPC
    IPC --> BrightSvc
    IPC --> OverlaySvc
    IPC --> ProfileSvc
    IPC --> HotkeySvc
    Main --> TraySvc
    Main --> MonitorSvc

    BrightSvc --> PythonSBC
    PythonSBC --> WMI
    WMI --> Displays
    OverlaySvc --> Displays
    TraySvc --> SysTray
    MonitorSvc --> Displays
```

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as React UI
    participant Store as Zustand Store
    participant IPC as IPC Bridge
    participant Main as Main Process
    participant OS as Windows/Python

    User->>UI: Drag brightness slider
    UI->>Store: setBrightness(id, value)
    Store-->>UI: Re-render monitor card
    UI->>IPC: setBrightness(id, value)
    IPC->>Main: IPC invoke
    Main->>OS: python -c "sbc.set_brightness()"
    OS-->>Main: Done

    User->>UI: Click profile "Movie Night"
    UI->>Store: Apply profile state
    Store-->>UI: Update all cards + sliders
    UI->>IPC: setBrightness + setOverlay per monitor
    UI->>IPC: syncTrayProfile("Movie Night")
    IPC->>Main: Apply to hardware
    Main->>OS: Brightness + overlay windows
```

---

## Legacy (v1.0)

The original Python/PySide6 application is preserved in `legacy/monitorShade.py` for reference.

---

<div align="center">

**MIT License** · © 2025 Daniel Forcade

*Built with Electron, React, TypeScript, and too many late nights staring at bright monitors.*

</div>
