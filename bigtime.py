# -*- coding: utf-8 -*-
"""
Created on Thu Jun 27 16:45:43 2024

@author: dforc
"""
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QCheckBox, QSlider, QLabel, QFrame, QPlainTextEdit, QSplitter, QGroupBox, QSizePolicy, QSpacerItem, QComboBox
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
import screen_brightness_control as sbc

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

class BrightnessControlApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Screen Brightness Control")
        self.setGeometry(100, 100, 800, 600)

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        self.layout = QVBoxLayout(self.central_widget)

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

        self.create_profile_section()

        self.console_output = QPlainTextEdit()
        self.console_output.setReadOnly(True)
        self.console_output.setFixedHeight(100)
        self.layout.addWidget(self.console_output)

        self.create_left_side_menu()
        self.create_main_screen()
        self.create_toggle_mode_screen()

        self.manual_mode = False
        self.selected_monitors = []
        self.all_monitors_control = False
        self.brightness_values = [100] * 8  # Only 8 monitors
        self.dimness_values = [50] * 8  # Separate dimness for the bottom row
        self.current_brightness_state = [False] * 8  # Track which brightness state is active
        self.toggle_manual_mode()

    def create_profile_section(self):
        profile_section = QVBoxLayout()

        profile_layout = QHBoxLayout()
        self.profile_combo_box = QComboBox()
        self.add_profile_button = self.create_styled_button("Add Profile")
        self.delete_profile_button = self.create_styled_button("Delete Profile")
        self.make_profile_active_button = self.create_styled_button("Make Profile Active")

        profile_layout.addWidget(QLabel("Profile:"))
        profile_layout.addWidget(self.profile_combo_box)
        profile_layout.addWidget(self.add_profile_button)
        profile_layout.addWidget(self.delete_profile_button)
        profile_layout.addWidget(self.make_profile_active_button)

        profile_section.addLayout(profile_layout)

        self.main_content_layout.addLayout(profile_section)

    def create_left_side_menu(self):
        self.left_menu = QVBoxLayout()
        self.left_menu.setAlignment(Qt.AlignTop)

        self.refresh_button = self.create_styled_button("Refresh Monitors")
        self.save_settings_button = self.create_styled_button("Save Settings")

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

        control_all_button = self.create_styled_button("Control All Monitors", checkable=True)
        control_all_button.setFixedSize(180, 40)
        control_all_button.clicked.connect(self.control_all_monitors)
        self.auto_mode_layout.addWidget(control_all_button, alignment=Qt.AlignCenter)

        brightness_layout = QHBoxLayout()
        brightness_layout.addWidget(brightness_label)
        brightness_layout.addWidget(self.brightness_slider)
        self.auto_mode_layout.addLayout(brightness_layout)

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

        dimness_label_manual = QLabel("Dimness")
        self.dimness_slider_manual = QSlider(Qt.Horizontal)
        self.dimness_slider_manual.setRange(0, 100)
        self.dimness_slider_manual.setValue(50)
        self.dimness_slider_manual.setTickPosition(QSlider.TicksBelow)
        self.dimness_slider_manual.setTickInterval(10)
        self.dimness_slider_manual.valueChanged.connect(self.update_dimness)

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
        self.manual_mode_layout.addLayout(brightness_layout_manual)

        dimness_layout_manual = QHBoxLayout()
        dimness_layout_manual.addWidget(dimness_label_manual)
        dimness_layout_manual.addWidget(self.dimness_slider_manual)
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
        self.auto_mode_widget.setVisible(not self.manual_mode)
        self.manual_mode_widget.setVisible(self.manual_mode)
        self.selected_monitors = []  # Clear selection when toggling mode
        self.update_monitor_display()

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
                self.monitor_frames[i].set_image("monitorImage_off_2.png")
                self.monitor_frames_manual[i].set_image("monitorImage_off_2.png")
                self.monitor_frames_dimness[i].set_image("monitorImage_off_2.png")
            else:
                self.monitor_frames[i].clear_image()
                self.monitor_frames_manual[i].clear_image()
                self.monitor_frames_dimness[i].clear_image()
            self.update_frame_brightness(i)
            self.update_frame_dimness(i)
        self.update_brightness_slider()

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
                self.brightness_slider_manual.blockSignals(False)
                self.dimness_slider_manual.blockSignals(True)
                self.dimness_slider_manual.setValue(self.dimness_values[monitor_id])
                self.dimness_slider_manual.blockSignals(False)
            else:
                self.brightness_slider.blockSignals(True)
                self.brightness_slider.setValue(self.brightness_values[monitor_id])
                self.brightness_slider.blockSignals(False)
        elif self.all_monitors_control:
            self.brightness_slider.blockSignals(True)
            self.brightness_slider.setValue(self.brightness_values[0])
            self.brightness_slider.blockSignals(False)
            if self.manual_mode:
                self.dimness_slider_manual.blockSignals(True)
                self.dimness_slider_manual.setValue(self.dimness_values[0])
                self.dimness_slider_manual.blockSignals(False)

    def update_brightness(self):
        if self.manual_mode:
            return  # Don't update in real-time in manual mode

        brightness_value = self.brightness_slider.value()
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
                    sbc.set_brightness(brightness_value, display=i)
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

        self.update_all_frames()

    def toggle_brightness(self):
        for i in range(8):  # Assuming 8 monitors
            if self.monitor_checkboxes[i].isChecked():
                if self.current_brightness_state[i]:
                    sbc.set_brightness(self.brightness_values[i], display=i)
                else:
                    sbc.set_brightness(self.dimness_values[i], display=i)
                self.current_brightness_state[i] = not self.current_brightness_state[i]

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

    def update_all_frames(self):
        for i in range(len(self.monitor_frames)):
            self.update_frame_brightness(i)
            self.update_frame_dimness(i)

if __name__ == "__main__":
    app = QApplication([])
    window = BrightnessControlApp()
    window.show()
    app.exec()