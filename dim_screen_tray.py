# -*- coding: utf-8 -*-
"""
Created on Mon Jun 24 15:39:14 2024

@author: dforc
"""

import sys
import os
import json
import subprocess
import screen_brightness_control as sbc
from PyQt5.QtWidgets import (QApplication, QSystemTrayIcon, QMenu, QAction, QWidget)
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import Qt

STATE_FILE = "monitor_brightness_state.json"

def load_state():
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as file:
                state = json.load(file)
        else:
            state = {}
    except (json.JSONDecodeError, IOError):
        state = {}

    if "profiles" not in state:
        state["profiles"] = {
            "Default": {
                "default_level": 100,
                "dim_level": 30,
                "monitors": [0, 1, 2, 3]
            }
        }
    return state

def set_brightness(level, monitor_indices):
    for index in monitor_indices:
        sbc.set_brightness(level, display=index)

class SystemTrayApp(QWidget):
    def __init__(self):
        super().__init__()
        self.state = load_state()
        self.initTray()

    def initTray(self):
        self.tray_icon = QSystemTrayIcon(self)
        
        # Ensure the icon path is correct
        icon_path = "icon.png"  # Change to your icon path
        if not os.path.exists(icon_path):
            icon_path = "/usr/share/icons/default.png"  # Fallback icon path

        self.tray_icon.setIcon(QIcon(icon_path))

        self.tray_menu = QMenu(self)

        open_action = QAction("Open Settings", self)
        open_action.triggered.connect(self.open_settings)
        self.tray_menu.addAction(open_action)

        self.profile_menu = QMenu("Switch Profile", self)
        self.tray_menu.addMenu(self.profile_menu)
        self.update_profiles()

        exit_action = QAction("Exit", self)
        exit_action.triggered.connect(self.exit_app)
        self.tray_menu.addAction(exit_action)

        self.tray_icon.setContextMenu(self.tray_menu)
        self.tray_icon.show()

    def update_profiles(self):
        self.profile_menu.clear()
        self.state = load_state()  # Reload the state
        for profile in self.state["profiles"]:
            profile_action = QAction(profile, self)
            profile_action.triggered.connect(lambda checked, p=profile: self.switch_profile(p))
            self.profile_menu.addAction(profile_action)

    def open_settings(self):
        # Use subprocess to open the main GUI script
        script_path = "path_to_main_gui_script.py"  # Change this to the path of your main GUI script
        subprocess.Popen([sys.executable, script_path]).wait()
        self.update_profiles()  # Update profiles after settings are closed

    def switch_profile(self, profile_name):
        profile = self.state["profiles"][profile_name]
        set_brightness(profile["default_level"], profile["monitors"])
        self.tray_icon.showMessage("Profile Switched", f'Switched to profile "{profile_name}"', QSystemTrayIcon.Information, 2000)

    def exit_app(self):
        self.tray_icon.hide()  # Hide the tray icon
        QApplication.instance().quit()  # Quit the application

if __name__ == '__main__':
    app = QApplication(sys.argv)
    QApplication.setQuitOnLastWindowClosed(False)  # Ensure the app doesn't quit when the last window is closed

    tray_app = SystemTrayApp()
    tray_app.show()  # This may be necessary to keep a reference to the app

    sys.exit(app.exec_())