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
from PyQt5.QtCore import pyqtSignal, QObject

class Communicate(QObject):
    open_settings = pyqtSignal()

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_path, relative_path)

STATE_FILE = resource_path("monitor_brightness_state.json")
icon_path = resource_path('icon.png')

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
    def __init__(self, comm):
        super().__init__()
        self.state = load_state()
        self.comm = comm
        self.initTray()

    def initTray(self):
        print("Initializing system tray...")
        self.tray_icon = QSystemTrayIcon(self)
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
        print("Updating profiles...")
        self.profile_menu.clear()
        self.state = load_state()  # Reload the state
        for profile in self.state["profiles"]:
            profile_action = QAction(profile, self)
            profile_action.triggered.connect(lambda checked, p=profile: self.switch_profile(p))
            self.profile_menu.addAction(profile_action)

    def open_settings(self):
        print("Opening settings...")
        script_path = resource_path("dim_screen_json.py")
        print(f"Script path: {script_path}")
        try:
            subprocess.Popen([sys.executable, script_path])
        except Exception as e:
            print(f"Failed to launch settings GUI: {e}")

    def switch_profile(self, profile_name):
        profile = self.state["profiles"][profile_name]
        set_brightness(profile["default_level"], profile["monitors"])
        self.tray_icon.showMessage("Profile Switched", f'Switched to profile "{profile_name}"', QSystemTrayIcon.Information, 2000)

    def exit_app(self):
        self.tray_icon.hide()  # Hide the tray icon
        QApplication.instance().quit()  # Quit the application

def main():
    app = QApplication(sys.argv)
    QApplication.setQuitOnLastWindowClosed(False)  # Ensure the app doesn't quit when the last window is closed

    comm = Communicate()
    tray_app = SystemTrayApp(comm)
    
    comm.open_settings.connect(tray_app.open_settings)
    
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()