#!/bin/bash
# Generate Tauri icons from a source image (1024x1024 PNG recommended)
# Usage: ./generate.sh source.png
#
# Requires: cargo install tauri-cli
# Then run: cargo tauri icon path/to/your-icon.png
#
# This will generate all required icon sizes automatically:
# - 32x32.png, 128x128.png, 128x128@2x.png
# - icon.ico (Windows)
# - icon.icns (macOS)
# - icon.png (Linux/tray)
#
# For now, use placeholder icons or run:
#   cd frontend && cargo tauri icon path/to/your-1024x1024-icon.png

echo "Run from frontend/: cargo tauri icon <path-to-1024x1024.png>"
