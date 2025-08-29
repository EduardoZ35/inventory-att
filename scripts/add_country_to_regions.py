#!/usr/bin/env python3
"""
Script para agregar 'country: "Chile"' a todas las regiones existentes
y luego agregar las regiones de Perú
"""

import re

# Leer el archivo actual
with open('inventory-att/src/data/chileRegionsCommunes.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Agregar country: "Chile" a todas las regiones que no lo tengan
def add_country_to_region(match):
    full_match = match.group(0)
    if 'country:' not in full_match:
        # Insertar country: "Chile" después de name
        lines = full_match.split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(line)
            if 'name:' in line and 'country:' not in full_match:
                indent = len(line) - len(line.lstrip())
                new_lines.append(' ' * indent + 'country: "Chile",')
        return '\n'.join(new_lines)
    return full_match

# Pattern para encontrar cada región
pattern = r'  \{\s*\n\s*id:\s*"[^"]+",\s*\n\s*name:[^}]+?\n\s*\}'

# Reemplazar todas las regiones
content = re.sub(pattern, add_country_to_region, content, flags=re.DOTALL)

print("Script completado. Por favor, aplica manualmente los cambios.")




