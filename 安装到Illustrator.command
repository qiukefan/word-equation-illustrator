#!/bin/zsh
set -eu
task_script_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
/usr/bin/python3 "$task_script_dir/install.py"
read -r '?按回车关闭此窗口…'
