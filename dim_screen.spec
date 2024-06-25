# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['screen_dim.py'],
    pathex=['C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim'],
    binaries=[],
    datas=[
        ('C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim\\icon.png', '.'),
        ('C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim\\monitor_brightness_state.json', '.'),
        ('C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim\\logo_2.png', '.'),
        ('C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim\\icon.ico', '.')
    ],
    hiddenimports=[],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ScreenDim',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Enable console output
    icon='C:\\Users\\dforc\\Desktop\\Core Documents\\GT_Projects\\ScreenDim\\icon.ico'
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ScreenDim'
)