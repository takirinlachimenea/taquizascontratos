#!/bin/bash
cd "$(dirname "$0")"
if which open >/dev/null 2>&1; then
  open Contratos_Takirin.html || open index.html
elif which xdg-open >/dev/null 2>&1; then
  xdg-open Contratos_Takirin.html || xdg-open index.html
else
  python3 server.py
fi
