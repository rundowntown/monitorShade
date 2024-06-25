# -*- coding: utf-8 -*-
"""
Created on Mon Jun 24 18:45:45 2024

@author: dforc
"""

import screen_brightness_control as sbc

def print_monitor_info():
    try:
        monitors = sbc.list_monitors_info()
        for i, monitor in enumerate(monitors):
            print(f"Monitor {i}: {monitor}")
    except Exception as e:
        print(f"Failed to retrieve monitor information: {e}")

if __name__ == "__main__":
    print_monitor_info()