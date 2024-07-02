# -*- coding: utf-8 -*-
"""
Created on Mon Jul  1 14:32:05 2024

@author: dforc
"""

import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton, QSlider, QWidget, QVBoxLayout, QLabel, QCheckBox
from PySide6.QtCore import Qt

########## Overlay Window Class ##########
class OverlayWindow(QWidget):
    def __init__(self, screen_geometry, opacity):
        super().__init__()
        self.setWindowFlags(Qt.WindowStaysOnTopHint | Qt.FramelessWindowHint | Qt.Tool | Qt.WindowTransparentForInput)
        self.setStyleSheet("background-color: rgba(0, 0, 0, 100);")  # Adjust the alpha for transparency
        self.setGeometry(screen_geometry)
        self.setWindowOpacity(opacity)

########## Main Window Class ##########
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()

    ########## Initialize UI ##########
    def initUI(self):
        self.toggle = False
        self.overlay_windows = []
        self.opacity = 0.65  # Default opacity
        self.monitor_checkboxes = []

        self.button = QPushButton('Toggle Overlay', self)
        self.button.clicked.connect(self.toggle_overlay)

        self.opacity_slider = QSlider(Qt.Horizontal, self)
        self.opacity_slider.setMinimum(0)
        self.opacity_slider.setMaximum(100)
        self.opacity_slider.setValue(int(self.opacity * 100))
        self.opacity_slider.valueChanged.connect(self.change_opacity)

        self.opacity_label = QLabel(f'Opacity: {self.opacity:.2f}', self)

        self.detect_screens_button = QPushButton('Detect Screens', self)
        self.detect_screens_button.clicked.connect(self.detect_screens)

        container = QWidget()
        self.layout = QVBoxLayout(container)
        self.layout.addWidget(self.button)
        self.layout.addWidget(self.opacity_slider)
        self.layout.addWidget(self.opacity_label)
        self.layout.addWidget(self.detect_screens_button)

        self.setCentralWidget(container)
        self.setGeometry(100, 100, 300, 200)

        self.detect_screens()

    ########## Detect Screens ##########
    def detect_screens(self):
        # Clear existing overlays and checkboxes
        for overlay in self.overlay_windows:
            overlay.close()
        self.overlay_windows.clear()
        for checkbox in self.monitor_checkboxes:
            self.layout.removeWidget(checkbox)
            checkbox.deleteLater()
        self.monitor_checkboxes.clear()

        for i, screen in enumerate(QApplication.screens()):
            overlay = OverlayWindow(screen.geometry(), self.opacity)
            self.overlay_windows.append(overlay)
            overlay.hide()

            checkbox = QCheckBox(f'Monitor {i + 1}', self)
            checkbox.stateChanged.connect(lambda state, idx=i: self.toggle_monitor(state, idx))
            self.monitor_checkboxes.append(checkbox)
            self.layout.addWidget(checkbox)

    ########## Change Opacity ##########
    def change_opacity(self, value):
        self.opacity = value / 100
        self.opacity_label.setText(f'Opacity: {self.opacity:.2f}')
        for overlay in self.overlay_windows:
            overlay.setWindowOpacity(self.opacity)

    ########## Toggle Monitor ##########
    def toggle_monitor(self, state, index):
        if state == Qt.Checked:
            self.overlay_windows[index].show()
        else:
            self.overlay_windows[index].hide()

    ########## Toggle Overlay ##########
    def toggle_overlay(self):
        self.toggle = not self.toggle
        for i, overlay in enumerate(self.overlay_windows):
            if self.monitor_checkboxes[i].isChecked():
                overlay.setVisible(self.toggle)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    mainWin = MainWindow()
    mainWin.show()
    sys.exit(app.exec())