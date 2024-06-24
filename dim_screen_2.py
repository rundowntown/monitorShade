# -*- coding: utf-8 -*-
"""
Created on Sun Jun 23 17:35:11 2024

@author: dforc
"""

import sys
import os
import json
import screen_brightness_control as sbc
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QSlider, QPushButton, QCheckBox, QMessageBox, 
                             QFrame, QComboBox, QLineEdit, QInputDialog, QTextEdit)
from PyQt5.QtCore import Qt  # Import Qt for the slider orientation
from PyQt5.QtGui import QPixmap  # Import QPixmap for images
import qdarkstyle  # Import qdarkstyle for a dark theme

# =============================================================================
# ## User Configuration - Adjust the settings below as needed
# =============================================================================

## Default file name where the brightness levels are saved.
## No need to change this unless necessary.
STATE_FILE = "monitor_brightness_state.json"

## ///////////////////////////////////////////////////////////////////////////

# =============================================================================
# ## Define Paths and Ensure Current Script Runs in its Directory
# =============================================================================

## Set working directory to the script's directory to ensure relative paths work
abs_path = os.path.abspath(__file__)          # Absolute path of the script
dir_path = os.path.dirname(abs_path)          # Directory path of the script
os.chdir(dir_path)                            # Set the current directory to the script's directory

# =============================================================================
# ## Function to Load Brightness State from a File
# =============================================================================
def load_state():
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as file:
                state = json.load(file)
        else:
            state = {}
    except (json.JSONDecodeError, IOError):
        state = {}
    
    ## Ensure the state has the 'profiles' key with a default profile
    if "profiles" not in state:
        state["profiles"] = {
            "Default": {
                "default_level": 100,
                "dim_level": 30,
                "monitors": [0, 1, 2, 3]
            }
        }
    return state

# =============================================================================
# ## Function to Save Brightness State to a File
# =============================================================================
def save_state(state):
    with open(STATE_FILE, "w") as file:
        json.dump(state, file)

# =============================================================================
# ## Function to Set Brightness Level for Monitors
# =============================================================================
def set_brightness(level, monitor_indices):
    for index in monitor_indices:
        sbc.set_brightness(level, display=index)

# =============================================================================
# ## Main Window Class
# =============================================================================
class BrightnessControlApp(QWidget):
    def __init__(self):
        ## Initialize the QWidget superclass
        super().__init__()
        ## Load the saved state
        self.state = load_state()
        self.current_profile = "Default"
        ## Initialize the user interface
        self.initUI()

    def initUI(self):
        ## Set the window title
        self.setWindowTitle('Monitor Brightness Control')
        ## Set the window geometry (x, y, width, height)
        self.setGeometry(100, 100, 500, 600)

        ## Create a vertical layout for the widgets
        layout = QVBoxLayout()

        ## Add an image to the GUI
        self.image_label = QLabel(self)
        pixmap = QPixmap("logo_2.jpg")  ## Path to the generated logo
        self.image_label.setPixmap(pixmap)
        self.image_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.image_label)

        ## Add a label for the default brightness level
        self.default_label = QLabel('Default Brightness Level: ', self)
        layout.addWidget(self.default_label)
        
        ## Add a styled slider for the default brightness level
        self.default_slider = QSlider(self)
        self.default_slider.setOrientation(Qt.Horizontal)
        self.default_slider.setMinimum(0)
        self.default_slider.setMaximum(100)
        self.default_slider.setValue(self.state["profiles"][self.current_profile]["default_level"])
        self.default_slider.setStyleSheet(self.slider_style())
        layout.addWidget(self.default_slider)

        ## Add a label for the dim brightness level
        self.dim_label = QLabel('Dim Brightness Level: ', self)
        layout.addWidget(self.dim_label)
        
        ## Add a styled slider for the dim brightness level
        self.dim_slider = QSlider(self)
        self.dim_slider.setOrientation(Qt.Horizontal)
        self.dim_slider.setMinimum(0)
        self.dim_slider.setMaximum(100)
        self.dim_slider.setValue(self.state["profiles"][self.current_profile]["dim_level"])
        self.dim_slider.setStyleSheet(self.slider_style())
        layout.addWidget(self.dim_slider)

        ## Add checkboxes for each monitor
        self.monitor_checkboxes = []
        monitors = sbc.list_monitors_info()
        for i, monitor in enumerate(monitors):
            cb = QCheckBox(f'Monitor {i}: {monitor["name"]}', self)
            cb.setChecked(i in self.state["profiles"][self.current_profile]["monitors"])
            self.monitor_checkboxes.append(cb)
            layout.addWidget(cb)

        ## Add a button row for toggle brightness and save settings
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

        ## Add a section for profile selection
        profile_select_label = QLabel('Profile Selection:', self)
        profile_select_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        layout.addWidget(profile_select_label)

        ## Add a dropdown for selecting profiles
        self.profile_dropdown = QComboBox(self)
        self.profile_dropdown.addItems(self.state["profiles"].keys())
        self.profile_dropdown.currentTextChanged.connect(self.load_profile)
        layout.addWidget(self.profile_dropdown)

        ## Add a button row for add and delete profile
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

        ## Add a message console
        self.message_console = QTextEdit(self)
        self.message_console.setReadOnly(True)
        self.message_console.setStyleSheet("background-color: #1e1e1e; color: #ffffff;")
        layout.addWidget(self.message_console)

        ## Set the layout for the main window
        self.setLayout(layout)


    # =========================================================================
    #  Define the stylesheet for sliders
    # =========================================================================
    def slider_style(self):
        return """
        /* Slider groove */
        QSlider::groove:horizontal {
            border: 1px solid #bbb;
            background: white;
            height: 10px;
            border-radius: 4px;
        }

        /* Active slider area */
        QSlider::sub-page:horizontal {
            background: #66ccff;
            border: 1px solid #777;
            height: 10px;
            border-radius: 4px;
        }

        /* Inactive slider area */
        QSlider::add-page:horizontal {
            background: #fff;
            border: 1px solid #777;
            height: 10px;
            border-radius: 4px;
        }

        /* Slider handle */
        QSlider::handle:horizontal {
            background: #B22222;
            border: 1px solid #777;
            width: 13px;
            margin-top: -2px;
            margin-bottom: -2px;
            border-radius: 4px;
        }

        /* Slider handle on hover */
        QSlider::handle:horizontal:hover {
            background: #9932CC;
            border: 1px solid #444;
        }

        /* Disabled active slider area */
        QSlider::sub-page:horizontal:disabled {
            background: #bbb;
            border-color: #999;
        }

        /* Disabled inactive slider area */
        QSlider::add-page:horizontal:disabled {
            background: #eee;
            border-color: #999;
        }

        /* Disabled slider handle */
        QSlider::handle:horizontal:disabled {
            background: #eee;
            border: 1px solid #aaa;
        }
        """

    # =========================================================================
    #  ## Define the stylesheet for buttons
    # =========================================================================    
    def button_style(self):      
        return """
        /* Button style */
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

        /* Button style on hover */
        QPushButton:hover {
            background-color: #45a049;
        }
        """


    # =========================================================================
    # ## Toggle Brightness Levels
    # =========================================================================
    def toggle_brightness(self):
        ## Get the values from the sliders
        default_level = self.default_slider.value()
        dim_level = self.dim_slider.value()
        ## Get the list of selected monitors
        monitors = [i for i, cb in enumerate(self.monitor_checkboxes) if cb.isChecked()]

        ## Get the current brightness level of the first selected monitor
        current_level = sbc.get_brightness(display=monitors[0])

        ## Toggle between default and dim brightness levels
        if current_level[0] == default_level:
            new_level = dim_level
        else:
            new_level = default_level

        ## Set the new brightness level for the selected monitors
        set_brightness(new_level, monitors)

        ## Show a message in the console to inform the user
        self.show_message(f'Brightness set to {new_level}.')

    # =========================================================================
    # ## Save the Settings
    # =========================================================================
    def save_settings(self):
        ## Update the state with the current slider values and selected monitors
        self.state["profiles"][self.current_profile] = {
            "default_level": self.default_slider.value(),
            "dim_level": self.dim_slider.value(),
            "monitors": [i for i, cb in enumerate(self.monitor_checkboxes) if cb.isChecked()]
        }
        ## Save the state to the file
        save_state(self.state)
        ## Show a message in the console to inform the user
        self.show_message(f'Settings for profile "{self.current_profile}" saved successfully.')
        
        
        

    # =========================================================================
    # ## Load a Selected Profile
    # =========================================================================
    def load_profile(self, profile_name):
        self.current_profile = profile_name
        profile = self.state["profiles"][profile_name]
        self.default_slider.setValue(profile["default_level"])
        self.dim_slider.setValue(profile["dim_level"])
        for i, cb in enumerate(self.monitor_checkboxes):
            cb.setChecked(i in profile["monitors"])

    # =========================================================================
    # ## Add a New Profile
    # =========================================================================
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

    # =========================================================================
    # ## Delete a Selected Profile
    # =========================================================================
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

    # =========================================================================
    # ## Show a Message in the Console
    # =========================================================================
    def show_message(self, message, warning=False):
        if warning:
            self.message_console.append(f"<span style='color: red;'>{message}</span>")
        else:
            self.message_console.append(message)

# =============================================================================
# ## Main Function to Run the Application
# =============================================================================
if __name__ == '__main__':
    ## Create a QApplication instance
    app = QApplication(sys.argv)
    ## Apply the dark style
    app.setStyleSheet(qdarkstyle.load_stylesheet_pyqt5())
    ## Create an instance of the BrightnessControlApp
    ex = BrightnessControlApp()
    ## Show the application window
    ex.show()
    ## Execute the application
    sys.exit(app.exec_())