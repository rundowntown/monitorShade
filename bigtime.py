# -*- coding: utf-8 -*-
"""
Created on Thu Jun 27 16:45:43 2024

@author: dforc
"""
import json
import os
import sys
import re
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QCheckBox, QSlider, QLabel, QFrame, QPlainTextEdit, QSplitter, QGroupBox,
    QSizePolicy, QSpacerItem, QComboBox, QInputDialog, QSpinBox
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QPixmap
import screen_brightness_control as sbc

## Validate Profile Name
def is_valid_profile_name(profile_name):
    """Validate profile name to prevent injection attacks."""
    return bool(re.match(r'^[\w\s]+$', profile_name))

class ProfileManager:
    def __init__(self, file_name='profiles.json'):
        self.file_name = self.resource_path(file_name)
        self.profiles = self.load_profiles()

    def resource_path(self, relative_path):
        """ Get absolute path to resource, works for dev and for PyInstaller """
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base_path, relative_path)

    def load_profiles(self):
        if os.path.exists(self.file_name):
            with open(self.file_name, 'r') as file:
                return json.load(file)
        else:
            return {}

    def save_profiles(self):
        with open(self.file_name, 'w') as file:
            json.dump(self.profiles, file, indent=4)

    def add_profile(self, profile_name, profile_data):
        self.profiles[profile_name] = profile_data
        self.save_profiles()

    def delete_profile(self, profile_name):
        if profile_name in self.profiles:
            del self.profiles[profile_name]
            self.save_profiles()

    def get_profile(self, profile_name):
        return self.profiles.get(profile_name, None)            

    def get_profiles_by_mode(self, mode):
        return {name: data for name, data in self.profiles.items() if data['mode'] == mode}

class ClickableFrame(QFrame):
    def __init__(self, app, monitor_id, parent=None):
        super().__init__(parent)
        self.app = app
        self.monitor_id = monitor_id
        self.setFrameShape(QFrame.Box)
        self.setStyleSheet("""
            background-color: white;
            border: 1px solid black;
            border-radius: 15px;
        """)

        self.image_label = QLabel(self)
        self.image_label.setGeometry(0, 0, 100, 80)  # Adjust size to fit your needs
        self.image_label.setScaledContents(True)  # Ensure the image scales to fit the QLabel
        self.image_label.setVisible(False)

    def mousePressEvent(self, event):
        self.app.toggle_monitor_selection(self)

    def set_image(self, image_path):
        pixmap = QPixmap(image_path)
        self.image_label.setPixmap(pixmap)
        self.image_label.setVisible(True)

    def clear_image(self):
        self.image_label.clear()
        self.image_label.setVisible(False)

class OverlayWindow(QWidget):
    def __init__(self, screen_geometry, opacity):
        super().__init__()
        self.setWindowFlags(Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint | Qt.Tool | Qt.WindowTransparentForInput)
        self.setStyleSheet("background-color: rgba(0, 0, 0, 100);")  # Adjust the alpha for transparency
        self.setGeometry(screen_geometry)
        self.setWindowOpacity(opacity)

class BrightnessControlApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Screen Brightness Control")
        self.setGeometry(100, 100, 800, 600)

        self.manual_mode = False  # Initialize manual_mode attribute here
        self.selected_monitors = []
        self.all_monitors_control = False
        self.brightness_values = [100] * 8  # Only 8 monitors
        self.dimness_values = [50] * 8  # Separate dimness for the bottom row
        self.current_brightness_state = [False] * 8  # Track which brightness state is active
        self.overlay_opacity_values = [0.0] * 8  # Initial opacity values for dark overlay
        self.overlay_windows = [None] * 8  # Store overlay windows

        self.profile_manager = ProfileManager()

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        self.layout = QVBoxLayout(self.central_widget)

        self.create_ui()  # Create the entire UI first
        self.show()  # Show the main window first

        # Now load the profiles
        self.load_profiles()

    def create_ui(self):
        self.main_splitter = QSplitter(Qt.Horizontal)
        self.layout.addWidget(self.main_splitter)
    
        self.left_menu_widget = QWidget()
        self.left_menu_widget.setFixedSize(200, 600)
        self.left_menu_layout = QVBoxLayout(self.left_menu_widget)
        self.left_menu_layout.setAlignment(Qt.AlignCenter)
        self.main_splitter.addWidget(self.left_menu_widget)
    
        separator = QFrame()
        separator.setFrameShape(QFrame.VLine)
        separator.setFrameShadow(QFrame.Sunken)
        self.main_splitter.addWidget(separator)
    
        self.main_content_widget = QWidget()
        self.main_content_layout = QVBoxLayout(self.main_content_widget)
        self.main_splitter.addWidget(self.main_content_widget)
    
        self.console_output = QPlainTextEdit()
        self.console_output.setReadOnly(True)
        self.console_output.setFixedHeight(100)
        self.layout.addWidget(self.console_output)
    
        self.create_profile_section()  # Create profile section first
    
        self.create_left_side_menu()  # Create the left side menu
    
        self.create_main_screen()  # Create the main screen components
        self.create_toggle_mode_screen()  # Create toggle mode components
    
        self.update_visibility()  # Ensure correct visibility at startup

    def update_visibility(self):
        if hasattr(self, 'auto_mode_widget') and hasattr(self, 'manual_mode_widget'):
            self.auto_mode_widget.setVisible(not self.manual_mode)
            self.manual_mode_widget.setVisible(self.manual_mode)

    def create_profile_section(self):
        profile_section = QVBoxLayout()
    
        profile_layout = QHBoxLayout()
        self.profile_combo_box = QComboBox()
        self.profile_combo_box.currentIndexChanged.connect(self.load_selected_profile)  # Connect to load_selected_profile
        self.add_profile_button = self.create_styled_button("Add Profile")
        self.delete_profile_button = self.create_styled_button("Delete Profile")
        self.make_profile_active_button = self.create_styled_button("Make Profile Active")
    
        profile_layout.addWidget(QLabel("Profile:"))
        profile_layout.addWidget(self.profile_combo_box)
        profile_layout.addWidget(self.add_profile_button)
        profile_layout.addWidget(self.delete_profile_button)
        profile_layout.addWidget(self.make_profile_active_button)
    
        profile_section.addLayout(profile_layout)
    
        self.main_content_layout.addLayout(profile_section)  # Add profile section to the main content layout
    
        self.add_profile_button.clicked.connect(self.add_profile_dialog)
        self.delete_profile_button.clicked.connect(self.delete_current_profile)
        
    def add_profile_dialog(self):
        profile_name, ok = QInputDialog.getText(self, 'Add Profile', 'Enter profile name:')
        if ok and profile_name and is_valid_profile_name(profile_name):
            profile_data = {
                'mode': 'Auto' if not self.manual_mode else 'Toggle',
                'monitors_selected': [i for i, checkbox in enumerate(self.monitor_checkboxes) if checkbox.isChecked()],
                'brightness_values': {i: self.brightness_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()},
                'dimness_values': {i: self.dimness_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()} if self.manual_mode else {},
                'overlay_opacity_values': {i: self.overlay_opacity_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()}
            }
            self.profile_manager.add_profile(profile_name, profile_data)
            self.console_output.appendPlainText(f'Profile "{profile_name}" added successfully.')
            self.load_profiles()
            self.profile_combo_box.setCurrentText(profile_name)
        else:
            self.console_output.appendPlainText('Invalid profile name. Please use only letters, numbers, spaces, and underscores.')
            
    def delete_current_profile(self):
        profile_name = self.profile_combo_box.currentText()
        if profile_name:
            self.profile_manager.delete_profile(profile_name)
            self.console_output.appendPlainText(f'Profile "{profile_name}" deleted successfully.')
            self.load_profiles()
        else:
            self.console_output.appendPlainText('No profile selected to delete.')

    def load_profiles(self):
        self.profile_combo_box.clear()
        current_mode = 'Auto' if not self.manual_mode else 'Toggle'
        profiles = self.profile_manager.get_profiles_by_mode(current_mode)
        for profile_name in profiles:
            self.profile_combo_box.addItem(profile_name)
            
    def load_selected_profile(self):
        profile_name = self.profile_combo_box.currentText()
        profile = self.profile_manager.get_profile(profile_name)
        if profile:
            self.apply_profile(profile)

    def apply_profile(self, profile):
        self.manual_mode = profile['mode'] == 'Toggle'
        if hasattr(self, 'manual_mode_button'):
            self.manual_mode_button.setChecked(self.manual_mode)  # Ensure this is set after initialization
        self.update_visibility()
    
        self.selected_monitors.clear()  # Clear the selected monitors
        selected_monitors = profile['monitors_selected']
        for i, checkbox in enumerate(self.monitor_checkboxes):
            checkbox.setChecked(i in selected_monitors)
    
        self.brightness_values = [100] * 8  # Reset brightness values
        self.dimness_values = [50] * 8  # Reset dimness values
        self.overlay_opacity_values = [0.0] * 8  # Reset overlay opacity values

        for monitor_id_str, brightness_value in profile.get('brightness_values', {}).items():
            monitor_id = int(monitor_id_str)  # Convert the key to integer
            self.brightness_values[monitor_id] = brightness_value

        if self.manual_mode:
            for monitor_id_str, dimness_value in profile.get('dimness_values', {}).items():
                monitor_id = int(monitor_id_str)  # Convert the key to integer
                self.dimness_values[monitor_id] = dimness_value

        for monitor_id_str, overlay_opacity in profile.get('overlay_opacity_values', {}).items():
            monitor_id = int(monitor_id_str)  # Convert the key to integer
            self.overlay_opacity_values[monitor_id] = overlay_opacity
    
        self.update_monitor_display()
        self.update_brightness_slider()
        self.update_all_frames()  # Ensure frames are updated to reflect new profile

    def save_profile(self):
        profile_name = self.profile_combo_box.currentText()
        if not profile_name:
            self.console_output.appendPlainText('No profile selected to save.')
            return
    
        profile_data = {
            'mode': 'Auto' if not self.manual_mode else 'Toggle',
            'monitors_selected': [i for i, checkbox in enumerate(self.monitor_checkboxes) if checkbox.isChecked()],
            'brightness_values': {i: self.brightness_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()},
            'dimness_values': {i: self.dimness_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()} if self.manual_mode else {},
            'overlay_opacity_values': {i: self.overlay_opacity_values[i] for i in range(len(self.monitor_checkboxes)) if self.monitor_checkboxes[i].isChecked()}
        }
    
        self.profile_manager.add_profile(profile_name, profile_data)
        self.console_output.appendPlainText(f'Profile "{profile_name}" saved successfully.')
        self.load_profiles()

    def create_left_side_menu(self):
        self.left_menu = QVBoxLayout()
        self.left_menu.setAlignment(Qt.AlignTop)
        
        # Add the image at the top
        self.logo_label = QLabel(self)
        pixmap = QPixmap("logo_160w.png")  ## Left Side Image Logo
        self.logo_label.setPixmap(pixmap)
        self.logo_label.setAlignment(Qt.AlignCenter)  # Center the image horizontally
        self.left_menu.addWidget(self.logo_label)
    
        self.refresh_button = self.create_styled_button("Refresh Monitors")
        self.save_settings_button = self.create_styled_button("Save Settings")
        self.save_settings_button.clicked.connect(self.save_profile)
        
        self.left_menu.addWidget(self.refresh_button)
        self.left_menu.addWidget(self.save_settings_button)
        
        self.left_menu.addSpacerItem(QSpacerItem(20, 20, QSizePolicy.Minimum, QSizePolicy.Fixed))
        
        self.monitor_select_groupbox = QGroupBox("Monitor Select")
        self.monitor_select_groupbox.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        self.monitor_select_layout = QVBoxLayout(self.monitor_select_groupbox)
        self.monitor_select_layout.setAlignment(Qt.AlignHCenter)
        self.select_all_checkbox = QCheckBox("Select All")
        self.select_all_checkbox.stateChanged.connect(self.select_all_monitors)
        self.monitor_select_layout.addWidget(self.select_all_checkbox)
        self.monitor_checkboxes = [QCheckBox(f"Monitor {i}") for i in range(8)]  # Only 8 monitors
        for checkbox in self.monitor_checkboxes:
            checkbox.stateChanged.connect(self.update_monitor_display)
            self.monitor_select_layout.addWidget(checkbox)
        self.left_menu.addWidget(self.monitor_select_groupbox, alignment=Qt.AlignHCenter)
        
        self.left_menu.addSpacerItem(QSpacerItem(20, 20, QSizePolicy.Minimum, QSizePolicy.Fixed))
        
        self.manual_mode_button = self.create_styled_button("Manual Mode", checkable=True)
        self.manual_mode_button.setFixedHeight(40)
        self.manual_mode_button.clicked.connect(self.toggle_manual_mode)
        self.left_menu.addWidget(self.manual_mode_button)
        
        self.left_menu_layout.addLayout(self.left_menu)

    def create_styled_button(self, text, checkable=False):
        button = QPushButton(text)
        button.setFixedHeight(40)
        button.setFixedWidth(180)
        button.setCheckable(checkable)
        button.setStyleSheet("""
            QPushButton {
                background-color: #44475a;
                color: #f8f8f2;
                border: 1px solid #6272a4;
                padding: 10px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #6272a4;
            }
            QPushButton:pressed {
                background-color: #bd93f9;
                border-color: #ff79c6;
            }
            QPushButton:checked {
                background-color: #6272a4;
                border-color: #ffb86c;
            }
        """)
        return button

    def create_main_screen(self):
        self.main_screen = QVBoxLayout()
    
        self.auto_mode_widget = QGroupBox("Auto Mode")
        self.auto_mode_layout = QVBoxLayout(self.auto_mode_widget)
    
        self.monitor_display_area = QWidget()
        self.monitor_display_area.setFixedSize(800, 150)  # Adjusted height for single row of monitors
        self.monitor_display_layout = QHBoxLayout(self.monitor_display_area)
        self.auto_mode_layout.addWidget(self.monitor_display_area)
    
        brightness_label = QLabel("Brightness")
        self.brightness_slider = QSlider(Qt.Horizontal)
        self.brightness_slider.setRange(0, 100)
        self.brightness_slider.setValue(100)
        self.brightness_slider.setTickPosition(QSlider.TicksBelow)
        self.brightness_slider.setTickInterval(10)
        self.brightness_slider.valueChanged.connect(self.update_brightness)

        self.brightness_spinbox = QSpinBox()
        self.brightness_spinbox.setRange(0, 100)
        self.brightness_spinbox.setValue(100)
        self.brightness_spinbox.setFixedWidth(75)
        self.brightness_spinbox.valueChanged.connect(self.brightness_slider.setValue)
        self.brightness_slider.valueChanged.connect(self.brightness_spinbox.setValue)
    
        control_all_button = self.create_styled_button("Control All Monitors", checkable=True)
        control_all_button.setFixedSize(180, 40)
        control_all_button.clicked.connect(self.control_all_monitors)
        self.auto_mode_layout.addWidget(control_all_button, alignment=Qt.AlignCenter)
    
        brightness_layout = QHBoxLayout()
        brightness_layout.addWidget(brightness_label)
        brightness_layout.addWidget(self.brightness_slider)
        brightness_layout.addWidget(self.brightness_spinbox)
        self.auto_mode_layout.addLayout(brightness_layout)

        overlay_label = QLabel("Overlay Opacity")
        self.overlay_slider = QSlider(Qt.Horizontal)
        self.overlay_slider.setRange(0, 100)
        self.overlay_slider.setValue(0)
        self.overlay_slider.setTickPosition(QSlider.TicksBelow)
        self.overlay_slider.setTickInterval(10)
        self.overlay_slider.valueChanged.connect(self.schedule_update_overlay_opacity)

        self.overlay_spinbox = QSpinBox()
        self.overlay_spinbox.setRange(0, 100)
        self.overlay_spinbox.setValue(0)
        self.overlay_spinbox.setFixedWidth(75)
        self.overlay_spinbox.valueChanged.connect(self.overlay_slider.setValue)
        self.overlay_slider.valueChanged.connect(self.overlay_spinbox.setValue)

        overlay_layout = QHBoxLayout()
        overlay_layout.addWidget(overlay_label)
        overlay_layout.addWidget(self.overlay_slider)
        overlay_layout.addWidget(self.overlay_spinbox)
        self.auto_mode_layout.addLayout(overlay_layout)

        self.monitor_frames = [ClickableFrame(self, i) for i in range(8)]  # Only 8 monitors
        for frame in self.monitor_frames:
            frame.setFixedSize(100, 80)
            frame.setVisible(False)
            self.monitor_display_layout.addWidget(frame)
    
        self.main_screen.addWidget(self.auto_mode_widget)
        self.main_content_layout.addLayout(self.main_screen)

    def create_toggle_mode_screen(self):
        self.toggle_mode_screen = QVBoxLayout()
    
        self.manual_mode_widget = QGroupBox("Toggle Mode")
        self.manual_mode_layout = QVBoxLayout(self.manual_mode_widget)
    
        self.monitor_display_area_manual = QWidget()
        self.monitor_display_area_manual.setFixedSize(800, 300)  # Adjusted height for two rows of monitors
        self.monitor_display_layout_manual = QVBoxLayout(self.monitor_display_area_manual)
        self.monitor_display_layout_manual_row1 = QHBoxLayout()
        self.monitor_display_layout_manual_row2 = QHBoxLayout()
        self.monitor_display_layout_manual.addLayout(self.monitor_display_layout_manual_row1)
        self.monitor_display_layout_manual.addLayout(self.monitor_display_layout_manual_row2)
        self.manual_mode_layout.addWidget(self.monitor_display_area_manual)
    
        brightness_label_manual = QLabel("Brightness")
        self.brightness_slider_manual = QSlider(Qt.Horizontal)
        self.brightness_slider_manual.setRange(0, 100)
        self.brightness_slider_manual.setValue(100)
        self.brightness_slider_manual.setTickPosition(QSlider.TicksBelow)
        self.brightness_slider_manual.setTickInterval(10)
        self.brightness_slider_manual.valueChanged.connect(self.update_brightness)

        self.brightness_spinbox_manual = QSpinBox()
        self.brightness_spinbox_manual.setRange(0, 100)
        self.brightness_spinbox_manual.setValue(100)
        self.brightness_spinbox_manual.setFixedWidth(75)
        self.brightness_spinbox_manual.valueChanged.connect(self.brightness_slider_manual.setValue)
        self.brightness_slider_manual.valueChanged.connect(self.brightness_spinbox_manual.setValue)
    
        dimness_label_manual = QLabel("Dimness")
        self.dimness_slider_manual = QSlider(Qt.Horizontal)
        self.dimness_slider_manual.setRange(0, 100)
        self.dimness_slider_manual.setValue(50)
        self.dimness_slider_manual.setTickPosition(QSlider.TicksBelow)
        self.dimness_slider_manual.setTickInterval(10)
        self.dimness_slider_manual.valueChanged.connect(self.update_dimness)

        self.dimness_spinbox_manual = QSpinBox()
        self.dimness_spinbox_manual.setRange(0, 100)
        self.dimness_spinbox_manual.setValue(50)
        self.dimness_spinbox_manual.setFixedWidth(75)
        self.dimness_spinbox_manual.valueChanged.connect(self.dimness_slider_manual.setValue)
        self.dimness_slider_manual.valueChanged.connect(self.dimness_spinbox_manual.setValue)

        overlay_label_manual = QLabel("Overlay Opacity")
        self.overlay_slider_manual = QSlider(Qt.Horizontal)
        self.overlay_slider_manual.setRange(0, 100)
        self.overlay_slider_manual.setValue(0)
        self.overlay_slider_manual.setTickPosition(QSlider.TicksBelow)
        self.overlay_slider_manual.setTickInterval(10)
        self.overlay_slider_manual.valueChanged.connect(self.schedule_update_overlay_opacity)

        self.overlay_spinbox_manual = QSpinBox()
        self.overlay_spinbox_manual.setRange(0, 100)
        self.overlay_spinbox_manual.setValue(0)
        self.overlay_spinbox_manual.setFixedWidth(75)
        self.overlay_spinbox_manual.valueChanged.connect(self.overlay_slider_manual.setValue)
        self.overlay_slider_manual.valueChanged.connect(self.overlay_spinbox_manual.setValue)

        overlay_layout_manual = QHBoxLayout()
        overlay_layout_manual.addWidget(overlay_label_manual)
        overlay_layout_manual.addWidget(self.overlay_slider_manual)
        overlay_layout_manual.addWidget(self.overlay_spinbox_manual)
        self.manual_mode_layout.addLayout(overlay_layout_manual)
    
        control_all_button_manual = self.create_styled_button("Control All Monitors", checkable=True)
        control_all_button_manual.setFixedSize(180, 40)
        control_all_button_manual.clicked.connect(self.control_all_monitors)
        self.manual_mode_layout.addWidget(control_all_button_manual, alignment=Qt.AlignCenter)
    
        self.toggle_brightness_button = self.create_styled_button("Toggle Brightness")
        self.toggle_brightness_button.setFixedSize(180, 40)
        self.toggle_brightness_button.clicked.connect(self.toggle_brightness)
        self.manual_mode_layout.addWidget(self.toggle_brightness_button, alignment=Qt.AlignCenter)
    
        brightness_layout_manual = QHBoxLayout()
        brightness_layout_manual.addWidget(brightness_label_manual)
        brightness_layout_manual.addWidget(self.brightness_slider_manual)
        brightness_layout_manual.addWidget(self.brightness_spinbox_manual)
        self.manual_mode_layout.addLayout(brightness_layout_manual)
    
        dimness_layout_manual = QHBoxLayout()
        dimness_layout_manual.addWidget(dimness_label_manual)
        dimness_layout_manual.addWidget(self.dimness_slider_manual)
        dimness_layout_manual.addWidget(self.dimness_spinbox_manual)
        self.manual_mode_layout.addLayout(dimness_layout_manual)
    
        self.monitor_frames_manual = [ClickableFrame(self, i) for i in range(8)]  # Only 8 monitors for brightness
        self.monitor_frames_dimness = [ClickableFrame(self, i) for i in range(8)]  # Only 8 monitors for dimness
        for frame in self.monitor_frames_manual:
            frame.setFixedSize(100, 80)
            frame.setVisible(False)
            self.monitor_display_layout_manual_row1.addWidget(frame)
    
        for frame in self.monitor_frames_dimness:
            frame.setFixedSize(100, 80)
            frame.setVisible(False)
            self.monitor_display_layout_manual_row2.addWidget(frame)
    
        self.toggle_mode_screen.addWidget(self.manual_mode_widget)
        self.main_content_layout.addLayout(self.toggle_mode_screen)

    def toggle_manual_mode(self):
        self.manual_mode = self.manual_mode_button.isChecked()
        self.update_visibility()
        self.selected_monitors = []  # Clear selection when toggling mode
        self.update_monitor_display()
        self.load_profiles()
        self.update_toggle_mode_display()  # Update display to show correct images based on toggle mode

    def select_all_monitors(self):
        select_all_state = self.select_all_checkbox.isChecked()
        for checkbox in self.monitor_checkboxes:
            checkbox.setChecked(select_all_state)
        self.update_monitor_display()

    def control_all_monitors(self):
        self.all_monitors_control = not self.all_monitors_control
        self.selected_monitors.clear()
        self.update_monitor_display()
        if self.all_monitors_control:
            for frame in self.monitor_frames:
                frame.setStyleSheet("""
                    background-color: white;
                    border: 2px solid green;
                    border-width: 3px;
                    border-radius: 10px;
                """)
            for frame in self.monitor_frames_dimness:
                frame.setStyleSheet("""
                    background-color: white;
                    border: 2px solid green;
                    border-width: 3px;
                    border-radius: 10px;
                """)
        else:
            for frame in self.monitor_frames:
                frame.setStyleSheet("""
                    background-color: white;
                    border: 1px solid black;
                    border-radius: 10px;
                """)
            for frame in self.monitor_frames_dimness:
                frame.setStyleSheet("""
                    background-color: white;
                    border: 1px solid black;
                    border-radius: 10px;
                """)
        self.update_brightness_slider()

    def update_monitor_display(self):
        for i, checkbox in enumerate(self.monitor_checkboxes):
            self.monitor_frames[i].setVisible(checkbox.isChecked())
            self.monitor_frames_manual[i].setVisible(checkbox.isChecked())
            self.monitor_frames_dimness[i].setVisible(checkbox.isChecked())
            if checkbox.isChecked():
                self.monitor_frames[i].set_image("monitorImage_on.png")
                self.monitor_frames_manual[i].set_image("monitorImage_on.png")
                self.monitor_frames_dimness[i].set_image("monitorImage_on.png")
            else:
                self.monitor_frames[i].clear_image()
                self.monitor_frames_manual[i].clear_image()
                self.monitor_frames_dimness[i].clear_image()
            self.update_frame_brightness(i)
            self.update_frame_dimness(i)
        self.update_brightness_slider()
        self.clear_selection_styles()  # Clear previous selection styles
        self.update_all_frames()  # Ensure frames are updated to reflect the current state
        self.update_toggle_mode_display()  # Update display to show correct images based on toggle mode

    def clear_selection_styles(self):
        for frame in self.monitor_frames:
            frame.setStyleSheet("""
                background-color: white;
                border: 1px solid black;
                border-radius: 10px;
            """)
        for frame in self.monitor_frames_manual:
            frame.setStyleSheet("""
                background-color: white;
                border: 1px solid black;
                border-radius: 10px;
            """)
        for frame in self.monitor_frames_dimness:
            frame.setStyleSheet("""
                background-color: white;
                border: 1px solid black;
                border-radius: 10px;
            """)

    def toggle_monitor_selection(self, frame):
        if self.all_monitors_control:
            return
        column_id = frame.monitor_id
        top_frame = self.monitor_frames_manual[column_id]
        bottom_frame = self.monitor_frames_dimness[column_id]
        if self.manual_mode:
            if top_frame in self.selected_monitors or bottom_frame in self.selected_monitors:
                self.selected_monitors = [
                    monitor for monitor in self.selected_monitors 
                    if monitor not in (top_frame, bottom_frame)
                ]
            else:
                self.selected_monitors.extend([top_frame, bottom_frame])
            self.update_frame_brightness(column_id)
            self.update_frame_dimness(column_id)
        else:
            if frame in self.selected_monitors:
                self.selected_monitors.remove(frame)
            else:
                self.selected_monitors.append(frame)
            self.update_frame_brightness(column_id)
        self.update_brightness_slider()

    def update_brightness_slider(self):
        if self.selected_monitors:
            monitor_id = self.selected_monitors[0].monitor_id
            if self.manual_mode:
                self.brightness_slider_manual.blockSignals(True)
                self.brightness_slider_manual.setValue(self.brightness_values[monitor_id])
                self.brightness_spinbox_manual.setValue(self.brightness_values[monitor_id])
                self.brightness_slider_manual.blockSignals(False)
                self.dimness_slider_manual.blockSignals(True)
                self.dimness_slider_manual.setValue(self.dimness_values[monitor_id])
                self.dimness_spinbox_manual.setValue(self.dimness_values[monitor_id])
                self.dimness_slider_manual.blockSignals(False)
                self.overlay_slider_manual.blockSignals(True)
                self.overlay_slider_manual.setValue(int(self.overlay_opacity_values[monitor_id] * 100))
                self.overlay_spinbox_manual.setValue(int(self.overlay_opacity_values[monitor_id] * 100))
                self.overlay_slider_manual.blockSignals(False)
            else:
                self.brightness_slider.blockSignals(True)
                self.brightness_slider.setValue(self.brightness_values[monitor_id])
                self.brightness_spinbox.setValue(self.brightness_values[monitor_id])
                self.brightness_slider.blockSignals(False)
                self.overlay_slider.blockSignals(True)
                self.overlay_slider.setValue(int(self.overlay_opacity_values[monitor_id] * 100))
                self.overlay_spinbox.setValue(int(self.overlay_opacity_values[monitor_id] * 100))
                self.overlay_slider.blockSignals(False)
        elif self.all_monitors_control:
            self.brightness_slider.blockSignals(True)
            self.brightness_slider.setValue(self.brightness_values[0])
            self.brightness_spinbox.setValue(self.brightness_values[0])
            self.brightness_slider.blockSignals(False)
            self.overlay_slider.blockSignals(True)
            self.overlay_slider.setValue(int(self.overlay_opacity_values[0] * 100))
            self.overlay_spinbox.setValue(int(self.overlay_opacity_values[0] * 100))
            self.overlay_slider.blockSignals(False)
            if self.manual_mode:
                self.dimness_slider_manual.blockSignals(True)
                self.dimness_slider_manual.setValue(self.dimness_values[0])
                self.dimness_spinbox_manual.setValue(self.dimness_values[0])
                self.dimness_slider_manual.blockSignals(False)

    def update_brightness(self):
        brightness_value = self.brightness_slider.value() if not self.manual_mode else self.brightness_slider_manual.value()
        brightness_color_value = int((brightness_value / 100) * 255)
    
        if self.all_monitors_control:
            for i, frame in enumerate(self.monitor_frames):
                if frame.isVisible():
                    self.brightness_values[i] = brightness_value
                    frame.setStyleSheet(f"""
                        background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                        border: 2px solid green;
                        border-radius: 10px;
                    """)
                    if not self.manual_mode:
                        sbc.set_brightness(brightness_value, display=i)
        else:
            if self.manual_mode:
                for frame in self.monitor_frames_manual:
                    if frame.isVisible() and frame in self.selected_monitors:
                        monitor_id = frame.monitor_id
                        self.brightness_values[monitor_id] = brightness_value
                        frame.setStyleSheet(f"""
                            background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                            border: 2px solid blue;
                            border-radius: 10px;
                        """)
                self.update_toggle_mode_display()  # Update display to show correct images based on toggle mode
            else:
                for frame in self.selected_monitors:
                    monitor_id = frame.monitor_id
                    self.brightness_values[monitor_id] = brightness_value
                    frame.setStyleSheet(f"""
                        background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                        border: 2px solid blue;
                        border-radius: 10px;
                    """)
                    sbc.set_brightness(brightness_value, display=monitor_id)
    
        if not self.manual_mode:
            self.brightness_spinbox.setValue(brightness_value)
        else:
            self.brightness_spinbox_manual.setValue(brightness_value)
        
        self.update_all_frames()

    def update_dimness(self):
        dimness_value = self.dimness_slider_manual.value()
        dimness_color_value = int((dimness_value / 100) * 255)
        if self.all_monitors_control:
            for i, frame in enumerate(self.monitor_frames_dimness):
                if frame.isVisible():
                    self.dimness_values[i] = dimness_value
                    frame.setStyleSheet(f"""
                        background-color: rgb({dimness_color_value}, {dimness_color_value}, {dimness_color_value});
                        border: 2px solid green;
                        border-radius: 10px;
                    """)
        else:
            for frame in self.selected_monitors:
                monitor_id = frame.monitor_id
                self.dimness_values[monitor_id] = dimness_value
                frame.setStyleSheet(f"""
                    background-color: rgb({dimness_color_value}, {dimness_color_value}, {dimness_color_value});
                    border: 2px solid blue;
                    border-radius: 10px;
                """)
        self.update_toggle_mode_display()  # Update display to show correct images based on toggle mode

        self.update_all_frames()

    def schedule_update_overlay_opacity(self):
        # Debounce to prevent rapid slider movements from overwhelming the update function
        if hasattr(self, 'overlay_timer'):
            self.overlay_timer.stop()
        else:
            self.overlay_timer = QTimer(self)
            self.overlay_timer.setSingleShot(True)
            self.overlay_timer.timeout.connect(self.update_overlay_opacity)
        self.overlay_timer.start(100)  # Adjust delay as needed

    def update_overlay_opacity(self):
        overlay_opacity = self.overlay_slider.value() / 100 if not self.manual_mode else self.overlay_slider_manual.value() / 100
        num_screens = len(QApplication.screens())
        if self.all_monitors_control:
            for i, frame in enumerate(self.monitor_frames):
                if i >= num_screens:
                    continue
                if frame.isVisible():
                    self.overlay_opacity_values[i] = overlay_opacity
                    if self.overlay_windows[i] is None:
                        self.overlay_windows[i] = OverlayWindow(QApplication.screens()[i].geometry(), overlay_opacity)
                    else:
                        self.overlay_windows[i].setWindowOpacity(overlay_opacity)
                    if self.overlay_windows[i].isHidden():
                        self.overlay_windows[i].show()
        else:
            for frame in self.selected_monitors:
                monitor_id = frame.monitor_id
                if monitor_id >= num_screens:
                    continue
                self.overlay_opacity_values[monitor_id] = overlay_opacity
                if self.overlay_windows[monitor_id] is None:
                    self.overlay_windows[monitor_id] = OverlayWindow(QApplication.screens()[monitor_id].geometry(), overlay_opacity)
                else:
                    self.overlay_windows[monitor_id].setWindowOpacity(overlay_opacity)
                if self.overlay_windows[monitor_id].isHidden():
                    self.overlay_windows[monitor_id].show()
        if not self.manual_mode:
            self.overlay_spinbox.setValue(int(overlay_opacity * 100))
        else:
            self.overlay_spinbox_manual.setValue(int(overlay_opacity * 100))

        self.update_all_frames()

    def toggle_brightness(self):
        for i in range(8):  # Assuming 8 monitors
            if self.monitor_checkboxes[i].isChecked():
                if self.current_brightness_state[i]:
                    sbc.set_brightness(self.brightness_values[i], display=i)
                else:
                    sbc.set_brightness(self.dimness_values[i], display=i)
                self.current_brightness_state[i] = not self.current_brightness_state[i]
        self.update_toggle_mode_display()  # Update display to show correct images based on toggle mode

    def update_frame_brightness(self, monitor_id):
        brightness_value = self.brightness_values[monitor_id]
        brightness_color_value = int((brightness_value / 100) * 255)
        frame = self.monitor_frames[monitor_id]
        frame_manual = self.monitor_frames_manual[monitor_id]
        if frame in self.selected_monitors or frame_manual in self.selected_monitors:
            frame.setStyleSheet(f"""
                background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                border: 2px solid blue;
                border-radius: 10px;
            """)
            frame_manual.setStyleSheet(f"""
                background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                border: 2px solid blue;
                border-radius: 10px;
            """)
        else:
            frame.setStyleSheet(f"""
                background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                border: 1px solid black;
                border-radius: 10px;
            """)
            frame_manual.setStyleSheet(f"""
                background-color: rgb({brightness_color_value}, {brightness_color_value}, {brightness_color_value});
                border: 1px solid black;
                border-radius: 10px;
            """)

    def update_frame_dimness(self, monitor_id):
        dimness_value = self.dimness_values[monitor_id]
        dimness_color_value = int((dimness_value / 100) * 255)
        frame_dimness = self.monitor_frames_dimness[monitor_id]
        if frame_dimness in self.selected_monitors:
            frame_dimness.setStyleSheet(f"""
                background-color: rgb({dimness_color_value}, {dimness_color_value}, {dimness_color_value});
                border: 2px solid blue;
                border-radius: 10px;
            """)
        else:
            frame_dimness.setStyleSheet(f"""
                background-color: rgb({dimness_color_value}, {dimness_color_value}, {dimness_color_value});
                border: 1px solid black;
                border-radius: 10px;
            """)

    def update_toggle_mode_display(self):
        if self.manual_mode:
            for i in range(8):
                if self.current_brightness_state[i]:
                    self.monitor_frames_manual[i].set_image("monitorImage_off.png")
                    self.monitor_frames_dimness[i].set_image("monitorImage_on.png")
                else:
                    self.monitor_frames_manual[i].set_image("monitorImage_on.png")
                    self.monitor_frames_dimness[i].set_image("monitorImage_off.png")

    def update_all_frames(self):
        for i in range(len(self.monitor_frames)):
            self.update_frame_brightness(i)
            self.update_frame_dimness(i)

if __name__ == "__main__":
    app = QApplication([])
    window = BrightnessControlApp()
    window.show()
    app.exec()