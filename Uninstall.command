#!/bin/zsh
set -eu
task_script_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
/usr/bin/python3 "$task_script_dir/install.py" --language en --uninstall
read -r '?Press Return to close this window…'
