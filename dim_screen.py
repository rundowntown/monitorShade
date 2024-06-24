# -*- coding: utf-8 -*-
"""
Created on Sun Jun 23 00:09:56 2024

This script dims monitors of your choice to the desired dimness.

- 1. Set DIM_LEVEL for dimness.  0 is the darkest, 100 is the brightest,
     you can select number between to run.
- 2. Set which monitors you would like to dim with MONITOR_INDICES.  
     the monitors selected will be dimmed.

@author: dforc
"""

import screen_brightness_control as sbc
import os

# =============================================================================
# ## User Configuration - Adjust the settings below as needed
# =============================================================================

## Set the default and dim brightness levels.
## Range for both: 0 (darkest) to 100 (brightest).
DEFAULT_LEVEL = 100
DIM_LEVEL = 30

## List the monitors you want to control by their index
## (0 is the first monitor)
## Example: To control the first three monitors, set [0, 1, 2].
MONITOR_INDICES = [0, 1, 2, 3]

## File name where the brightness levels are saved.
## No need to change this unless necessary.
BRIGHTNESS_FILE = 'brightness_levels.txt'

## ///////////////////////////////////////////////////////////////////////////

# =============================================================================
# ## Define Paths and Ensure Current Script Runs in its Directory
# =============================================================================
## Set working directory to the script's directory to ensure relative paths work
abs_path = os.path.abspath(__file__)          # Absolute path of the script
dir_path = os.path.dirname(abs_path)          # Directory path of the script
os.chdir(dir_path)                            # Set the current directory to the script's directory

# =============================================================================
# ## Function to Save Brightness Levels to a File
# =============================================================================
def save_brightness(dim_levels, default_levels):
    levels = {'dim': dim_levels, 'default': default_levels}
    with open(BRIGHTNESS_FILE, 'w') as file:
        file.write(str(levels))

# =============================================================================
# ## Function to Load Saved Brightness Levels from a File
# =============================================================================
def load_brightness():
    try:
        with open(BRIGHTNESS_FILE, 'r') as file:
            levels = eval(file.read().strip())
            return levels
    except FileNotFoundError:
        # Return None if the file does not exist
        return None

# =============================================================================
# ## Function to Toggle Brightness on Specified Monitors
# =============================================================================
def toggle_brightness():
    current_levels = sbc.get_brightness()  # Get current brightness levels of all monitors
    saved_levels = load_brightness()       # Load previously saved brightness levels

    if saved_levels is None or 'dim' not in saved_levels or 'default' not in saved_levels:
        # If no saved state or the keys aren't present, save current state as default and set dim levels
        default_levels = current_levels
        dim_levels = [DIM_LEVEL if i in range(len(current_levels)) and i in MONITOR_INDICES else level for i, level in enumerate(current_levels)]
        save_brightness(dim_levels, default_levels)
        brightness_to_set = dim_levels
    else:
        # Determine if we should dim or restore based on the first available monitor in the list
        first_monitor_index = next((i for i in MONITOR_INDICES if i < len(current_levels)), None)
        if first_monitor_index is not None and current_levels[first_monitor_index] == saved_levels['dim'][first_monitor_index]:
            # Currently dimmed, restore original brightness
            brightness_to_set = saved_levels['default']
        else:
            # Not currently dimmed, dim the monitors
            brightness_to_set = saved_levels['dim']

    # Apply the new brightness levels to available monitors
    for i in MONITOR_INDICES:
        if i < len(current_levels):
            sbc.set_brightness(brightness_to_set[i], display=i)

# =============================================================================
# ## Main Execution Block
# =============================================================================
if __name__ == '__main__':
    toggle_brightness()