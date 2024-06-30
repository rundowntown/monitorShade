# -*- coding: utf-8 -*-
"""
Created on Sat Jun 29 15:09:58 2024

@author: dforc
"""

import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider, QLineEdit, QProgressBar, QPushButton, QComboBox, QInputDialog)
from PySide6.QtCore import Qt, QTimer

class SliderWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.initUI()
        self.profiles = {}  # Dictionary to store profiles

    def initUI(self):
        layout = QVBoxLayout()
        
        self.sliders = []
        self.progress_bars = []
        self.edit_boxes = []
        self.labels = []

        for i in range(4):
            slider_layout = QHBoxLayout()
            slider = QSlider(Qt.Horizontal)
            slider.setMinimum(0)
            slider.setMaximum(100)
            slider.setValue(50)
            
            progress = QProgressBar()
            progress.setRange(0, 100)
            progress.setValue(50)
            progress.setOrientation(Qt.Vertical)
            progress.setStyleSheet("QProgressBar {border: none; background: none;} QProgressBar::chunk { background-color: green; }")
            
            edit = QLineEdit("50")
            edit.setFixedWidth(50)
            
            label = QLabel("50")
            label.setFixedWidth(50)
            self.update_colored_label(label, progress, 50)

            # Connect signals and slots
            slider.valueChanged.connect(lambda value, lbl=label, prog=progress, edt=edit: self.update_display(value, lbl, prog, edt))
            edit.textChanged.connect(lambda text, sldr=slider: sldr.setValue(int(text) if text.isdigit() else 0))

            slider_layout.addWidget(slider)
            slider_layout.addWidget(progress)
            slider_layout.addWidget(edit)
            slider_layout.addWidget(label)

            layout.addLayout(slider_layout)

            self.sliders.append(slider)
            self.progress_bars.append(progress)
            self.edit_boxes.append(edit)
            self.labels.append(label)
        
        self.profile_dropdown = QComboBox()
        self.profile_dropdown.addItem("Select Profile")
        layout.addWidget(self.profile_dropdown)

        self.save_button = QPushButton("Save Profile")
        self.save_button.clicked.connect(self.save_profile)
        layout.addWidget(self.save_button)
        
        self.load_button = QPushButton("Load Profile")
        self.load_button.clicked.connect(self.load_profile)
        layout.addWidget(self.load_button)
        
        self.setLayout(layout)

    def update_display(self, value, label, progress, edit):
        label.setText(f"{value}")
        self.update_colored_label(label, progress, value)
        progress.setValue(value)
        edit.setText(f"{value}")

    def update_colored_label(self, label, progress, value):
        if value < 20:
            color = "blue"
        elif value < 40:
            color = "green"
        elif value < 60:
            color = "yellow"
        elif value < 80:
            color = "orange"
        else:
            color = "red"

        label.setStyleSheet(f"color: {color};")
        progress.setStyleSheet(f"QProgressBar {{ border: none; background: none; }} QProgressBar::chunk {{ background-color: {color}; }}")

    def save_profile(self):
        profile_name, ok = QInputDialog.getText(self, "Save Profile", "Enter profile name:")
        if ok and profile_name:
            self.profiles[profile_name] = [slider.value() for slider in self.sliders]
            self.profile_dropdown.addItem(profile_name)

    def load_profile(self):
        profile_name = self.profile_dropdown.currentText()
        if profile_name in self.profiles:
            self.target_values = self.profiles[profile_name]
            self.start_animation()

    def start_animation(self):
        self.animation_timer = QTimer(self)
        self.animation_timer.timeout.connect(self.perform_animation)
        self.animation_timer.start(50)

    def perform_animation(self):
        complete = True
        for slider, target_value in zip(self.sliders, self.target_values):
            current_value = slider.value()
            if current_value != target_value:
                complete = False
                step = 1 if current_value < target_value else -1
                new_value = current_value + step
                slider.setValue(new_value)
        
        if complete:
            self.animation_timer.stop()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = SliderWidget()
    window.setWindowTitle('Custom Sliders with Value Displays and Profiles')
    window.show()
    sys.exit(app.exec())