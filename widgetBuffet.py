# -*- coding: utf-8 -*-
"""
Created on Sat Jun 29 13:10:14 2024

@author: dforc
"""

import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QCheckBox, QRadioButton, QLabel, QSlider, QComboBox, QDial, QSpinBox,
    QProgressBar, QTabWidget, QToolTip
)
from PySide6.QtCore import Qt, QPropertyAnimation, QRect, QTimer, QEasingCurve, QParallelAnimationGroup
from PySide6.QtGui import QFont

class WidgetGallery(QWidget):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("PySide6 Widget Gallery")
        self.setGeometry(100, 100, 800, 600)

        # Main layout
        main_layout = QVBoxLayout()

        # Tab Widget
        tab_widget = QTabWidget()

        # Tab 1: Buttons and Toggles
        tab1 = QWidget()
        tab1_layout = QVBoxLayout()

        buttons_layout = QHBoxLayout()
        buttons_layout.addWidget(QPushButton("Button"))
        buttons_layout.addWidget(QPushButton("Disabled Button", enabled=False))
        buttons_layout.addWidget(QPushButton("Default Button"))

        flat_button = QPushButton("Flat Button")
        flat_button.setFlat(True)
        buttons_layout.addWidget(flat_button)
        
        toggles_layout = QHBoxLayout()
        toggles_layout.addWidget(QCheckBox("CheckBox"))
        tri_state_check_box = QCheckBox("TriState")
        tri_state_check_box.setTristate(True)
        toggles_layout.addWidget(tri_state_check_box)
        toggles_layout.addWidget(QRadioButton("RadioButton"))

        tab1_layout.addLayout(buttons_layout)
        tab1_layout.addLayout(toggles_layout)
        tab1.setLayout(tab1_layout)

        # Tab 2: Sliders, Dial, SpinBox, ComboBox
        tab2 = QWidget()
        tab2_layout = QVBoxLayout()

        sliders_combobox_layout = QHBoxLayout()
        slider = QSlider(Qt.Horizontal)
        slider.setMinimum(0)
        slider.setMaximum(100)
        sliders_combobox_layout.addWidget(slider)

        dial = QDial()
        dial.setMinimum(0)
        dial.setMaximum(100)
        sliders_combobox_layout.addWidget(dial)

        spin_box = QSpinBox()
        spin_box.setMinimum(0)
        spin_box.setMaximum(100)
        sliders_combobox_layout.addWidget(spin_box)

        combo_box = QComboBox()
        combo_box.addItems(["Option 1", "Option 2", "Option 3"])
        sliders_combobox_layout.addWidget(combo_box)

        tab2_layout.addLayout(sliders_combobox_layout)
        tab2.setLayout(tab2_layout)

        # Tab 3: Sliders
        tab3 = QWidget()
        tab3_layout = QVBoxLayout()

        slider1 = QSlider(Qt.Horizontal)
        slider1.setMinimum(0)
        slider1.setMaximum(100)
        slider1.setValue(50)
        slider1.setStyleSheet("QSlider { border: 1px solid black; }")
        tab3_layout.addWidget(slider1)

        slider2 = QSlider(Qt.Vertical)
        slider2.setMinimum(0)
        slider2.setMaximum(100)
        slider2.setValue(50)
        slider2.setStyleSheet("QSlider { border: 2px solid red; }")
        tab3_layout.addWidget(slider2)

        slider3 = QSlider(Qt.Horizontal)
        slider3.setMinimum(0)
        slider3.setMaximum(100)
        slider3.setValue(50)
        slider3.setStyleSheet("""
            QSlider::groove:horizontal {
                border: 1px solid #999999;
                height: 8px;
                background: #b0c4de;
            }
            QSlider::handle:horizontal {
                background: #6495ed;
                border: 1px solid #5c5c5c;
                width: 18px;
                margin: -2px 0;
                border-radius: 3px;
            }
        """)
        tab3_layout.addWidget(slider3)

        slider4 = QSlider(Qt.Vertical)
        slider4.setMinimum(0)
        slider4.setMaximum(100)
        slider4.setValue(50)
        slider4.setStyleSheet("""
            QSlider::groove:vertical {
                border: 1px solid #999999;
                width: 8px;
                background: #b0c4de;
            }
            QSlider::handle:vertical {
                background: #6495ed;
                border: 1px solid #5c5c5c;
                height: 18px;
                margin: 0 -2px;
                border-radius: 3px;
            }
        """)
        tab3_layout.addWidget(slider4)

        tab3.setLayout(tab3_layout)

        # Tab 4: Progress Bar and Animation
        tab4 = QWidget()
        tab4_layout = QVBoxLayout()

        progress_layout = QVBoxLayout()
        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(100)
        progress_layout.addWidget(self.progress_bar)

        start_progress_button = QPushButton("Start Progress")
        start_progress_button.clicked.connect(self.start_progress)
        progress_layout.addWidget(start_progress_button)

        animation_layout = QVBoxLayout()
        self.animated_label = QLabel("Animated Label")
        self.animated_label.setGeometry(100, 150, 200, 40)
        animation_layout.addWidget(self.animated_label)

        start_animation_button = QPushButton("Start Animation")
        start_animation_button.clicked.connect(self.start_animation)
        animation_layout.addWidget(start_animation_button)

        tab4_layout.addLayout(progress_layout)
        tab4_layout.addLayout(animation_layout)
        tab4.setLayout(tab4_layout)

        # Add tabs to TabWidget
        tab_widget.addTab(tab1, "Buttons and Toggles")
        tab_widget.addTab(tab2, "Sliders and Others")
        tab_widget.addTab(tab3, "Sliders")
        tab_widget.addTab(tab4, "Progress and Animation")

        main_layout.addWidget(tab_widget)
        self.setLayout(main_layout)

        # Set tooltips
        flat_button.setToolTip("This is a flat button")
        slider.setToolTip("This is a slider")
        dial.setToolTip("This is a dial")
        spin_box.setToolTip("This is a spin box")
        combo_box.setToolTip("This is a combo box")
        start_progress_button.setToolTip("Start the progress bar")
        start_animation_button.setToolTip("Start the animation")

        # Set styles
        self.setStyleSheet("""
            QPushButton {
                font-size: 14px;
                padding: 6px;
            }
            QLabel {
                font-size: 16px;
                color: blue;
            }
            QProgressBar {
                height: 20px;
            }
        """)

    def start_animation(self):
        self.animation_group = QParallelAnimationGroup()

        geometry_animation = QPropertyAnimation(self.animated_label, b"geometry")
        geometry_animation.setDuration(2000)
        geometry_animation.setStartValue(QRect(100, 150, 200, 40))
        geometry_animation.setEndValue(QRect(300, 150, 200, 40))
        geometry_animation.setEasingCurve(QEasingCurve.OutBounce)

        opacity_animation = QPropertyAnimation(self.animated_label, b"windowOpacity")
        opacity_animation.setDuration(2000)
        opacity_animation.setStartValue(1)
        opacity_animation.setEndValue(0.1)

        self.animation_group.addAnimation(geometry_animation)
        self.animation_group.addAnimation(opacity_animation)

        self.animation_group.start()

    def start_progress(self):
        self.progress_value = 0
        self.progress_timer = QTimer()
        self.progress_timer.timeout.connect(self.update_progress)
        self.progress_timer.start(100)

    def update_progress(self):
        self.progress_value += 1
        self.progress_bar.setValue(self.progress_value)
        if self.progress_value >= 100:
            self.progress_timer.stop()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    gallery = WidgetGallery()
    gallery.show()
    sys.exit(app.exec())