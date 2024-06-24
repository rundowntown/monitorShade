# -*- coding: utf-8 -*-
"""
Created on Mon Jun 24 15:38:55 2024

@author: dforc
"""

import sys
import os
import json
import screen_brightness_control as sbc
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QSlider, QPushButton, QCheckBox, QInputDialog, QTextEdit, QComboBox)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPixmap
import qdarkstyle

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

def save_state(state):
    with open(STATE_FILE, "w") as file:
        json.dump(state, file)

def set_brightness(level, monitor_indices):
    for index in monitor_indices:
        sbc.set_brightness(level, display=index)

class BrightnessControlApp(QWidget):
    def __init__(self):
        super().__init__()
        self.state = load_state()
        self.current_profile = "Default"
        self.initUI()

    def initUI(self):
        self.setWindowTitle('Monitor Brightness Control')
        self.setGeometry(100, 100, 500, 600)
        layout = QVBoxLayout()

        self.image_label = QLabel(self)
        pixmap = QPixmap("logo_2.jpg")
        self.image_label.setPixmap(pixmap)
        self.image_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.image_label)

        self.default_label = QLabel('Default Brightness Level: ', self)
        layout.addWidget(self.default_label)

        self.default_slider = QSlider(self)
        self.default_slider.setOrientation(Qt.Horizontal)
        self.default_slider.setMinimum(0)
        self.default_slider.setMaximum(100)
        self.default_slider.setValue(self.state["profiles"][self.current_profile]["default_level"])
        self.default_slider.setStyleSheet(self.slider_style())
        layout.addWidget(self.default_slider)

        self.dim_label = QLabel('Dim Brightness Level: ', self)
        layout.addWidget(self.dim_label)

        self.dim_slider = QSlider(self)
        self.dim_slider.setOrientation(Qt.Horizontal)
        self.dim_slider.setMinimum(0)
        self.dim_slider.setMaximum(100)
        self.dim_slider.setValue(self.state["profiles"][self.current_profile]["dim_level"])
        self.dim_slider.setStyleSheet(self.slider_style())
        layout.addWidget(self.dim_slider)

        self.monitor_checkboxes = []
        monitors = sbc.list_monitors_info()
        for i, monitor in enumerate(monitors):
            cb = QCheckBox(f'Monitor {i}: {monitor["name"]}', self)
            cb.setChecked(i in self.state["profiles"][self.current_profile]["monitors"])
            self.monitor_checkboxes.append(cb)
            layout.addWidget(cb)

        button_row = QHBoxLayout()
        self.toggle_button = QPushButton('Toggle Brightness', self)
        self.toggle_button.setStyleSheet(self.button_style())
        self.toggle_button.clicked.connect(self.toggle_brightness)
        button_row.addWidget(self.toggle_button)

        self.save_button = QPushButton('Save Settings', self)
        self.save_button.setStyleSheet(self.button_style())
        self.save_button.clicked.connect(self.save_settings)
        button_row.addWidget(self.save_button)
        
        layout.addLayout(button_row)

        profile_select_label = QLabel('Profile Selection:', self)
        profile_select_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        layout.addWidget(profile_select_label)

        self.profile_dropdown = QComboBox(self)
        self.profile_dropdown.addItems(self.state["profiles"].keys())
        self.profile_dropdown.currentTextChanged.connect(self.load_profile)
        layout.addWidget(self.profile_dropdown)

        profile_button_row = QHBoxLayout()
        self.add_profile_button = QPushButton('Add Profile', self)
        self.add_profile_button.setStyleSheet(self.button_style())
        self.add_profile_button.clicked.connect(self.add_profile)
        profile_button_row.addWidget(self.add_profile_button)

        self.delete_profile_button = QPushButton('Delete Profile', self)
        self.delete_profile_button.setStyleSheet(self.button_style())
        self.delete_profile_button.clicked.connect(self.delete_profile)
        profile_button_row.addWidget(self.delete_profile_button)
        
        layout.addLayout(profile_button_row)

        self.message_console = QTextEdit(self)
        self.message_console.setReadOnly(True)
        self.message_console.setStyleSheet("background-color: #1e1e1e; color: #ffffff;")
        layout.addWidget(self.message_console)

        self.setLayout(layout)

    def slider_style(self):
        return """
        QSlider::groove:horizontal {
            border: 1px solid #bbb;
            background: white;
            height: 10px;
            border-radius: 4px;
        }
        QSlider::sub-page:horizontal {
            background: #66ccff;
            border: 1px solid #777;
            height: 10px;
            border-radius: 4px;
        }
        QSlider::add-page:horizontal {
            background: #fff;
            border: 1px solid #777;
            height: 10px;
            border-radius: 4px;
        }
        QSlider::handle:horizontal {
            background: #B22222;
            border: 1px solid #777;
            width: 13px;
            margin-top: -2px;
            margin-bottom: -2px;
            border-radius: 4px;
        }
        QSlider::handle:horizontal:hover {
            background: #9932CC;
            border: 1px solid #444;
        }
        QSlider::sub-page:horizontal:disabled {
            background: #bbb;
            border-color: #999;
        }
        QSlider::add-page:horizontal:disabled {
            background: #eee;
            border-color: #999;
        }
        QSlider::handle:horizontal:disabled {
            background: #eee;
            border: 1px solid #aaa;
        }
        """

    def button_style(self):
        return """
        QPushButton {
            background-color: #228B22;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 18px;
            margin: 4px 2px;
            border-radius: 12px;
        }
        QPushButton:hover {
            background-color: #45a049;
        }
        """

    def toggle_brightness(self):
        default_level = self.default_slider.value()
        dim_level = self.dim_slider.value()
        monitors = [i for i, cb in enumerate(self.monitor_checkboxes) if cb.isChecked()]
        current_level = sbc.get_brightness(display=monitors[0])
        new_level = dim_level if current_level[0] == default_level else default_level
        set_brightness(new_level, monitors)
        self.show_message(f'Brightness set to {new_level}.')

    def save_settings(self):
        self.state["profiles"][self.current_profile] = {
            "default_level": self.default_slider.value(),
            "dim_level": self.dim_slider.value(),
            "monitors": [i for i, cb in enumerate(self.monitor_checkboxes) if cb.isChecked()]
        }
        save_state(self.state)
        self.show_message(f'Settings for profile "{self.current_profile}" saved successfully.')

    def load_profile(self, profile_name):
        self.current_profile = profile_name
        profile = self.state["profiles"][profile_name]
        self.default_slider.setValue(profile["default_level"])
        self.dim_slider.setValue(profile["dim_level"])
        for i, cb in enumerate(self.monitor_checkboxes):
            cb.setChecked(i in profile["monitors"])

    def add_profile(self):
        new_profile_name, ok = QInputDialog.getText(self, 'Add Profile', 'Enter profile name:')
        if ok and new_profile_name.strip() and new_profile_name not in self.state["profiles"]:
            new_profile_name = new_profile_name.strip()
            self.state["profiles"][new_profile_name] = {
                "default_level": self.default_slider.value(),
                "dim_level": self.dim_slider.value(),
                "monitors": [i for i, cb in enumerate(self.monitor_checkboxes) if cb.isChecked()]
            }
            self.profile_dropdown.addItem(new_profile_name)
            self.profile_dropdown.setCurrentText(new_profile_name)
            self.save_settings()
            self.show_message(f'Profile {new_profile_name} added successfully.')

    def delete_profile(self):
        profile_name = self.profile_dropdown.currentText()
        if profile_name != "Default":
            del self.state["profiles"][profile_name]
            self.profile_dropdown.removeItem(self.profile_dropdown.currentIndex())
            self.save_settings()
            self.profile_dropdown.setCurrentText("Default")
            self.load_profile("Default")
            self.show_message(f'Profile {profile_name} deleted successfully.')
        else:
            self.show_message('Cannot delete the default profile.', warning=True)

    def show_message(self, message, warning=False):
        if warning:
            self.message_console.append(f"<span style='color: red;'>{message}</span>")
        else:
            self.message_console.append(message)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setStyleSheet(qdarkstyle.load_stylesheet_pyqt5())
    ex = BrightnessControlApp()
    ex.show()
    sys.exit(app.exec_())