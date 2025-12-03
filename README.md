# 🖥️ Display Adapter

Aplicación Electron multiplataforma para gestión y adaptación automática de resoluciones de múltiples monitores.

## ✨ Características

- 🖥️ **Soporte para múltiples monitores** - Detecta y gestiona todos los monitores conectados
- 🔄 **Auto-detección** - Detecta automáticamente nuevos monitores conectados
- ⚡ **Adaptación automática** - Aplica la mejor resolución disponible automáticamente
- 🎯 **Selector de monitor** - Cambia fácilmente entre monitores conectados
- 🎨 **Interfaz moderna** - Diseño atractivo con animaciones suaves
- 🐧🪟 **Multiplataforma** - Funciona en Windows y Linux

## 🔧 Requisitos Previos

### Para Linux 🐧

1. **Node.js y npm** (versión 18 o superior):
```bash
# Debian/Ubuntu
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

2. **xrandr** (utilidad de gestión de pantallas):
```bash
# Verificar si está instalado
which xrandr

# Instalación si es necesario:
# Debian/Ubuntu
sudo apt install x11-xserver-utils

# Fedora
sudo dnf install xorg-x11-server-utils

# Arch
sudo pacman -S xorg-xrandr
```

### Para Windows 🪟

1. **Node.js y npm** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/

2. **PowerShell** (viene preinstalado en Windows)

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd adaptador
```

### 2. Instalar dependencias

```bash
npm install
```

## 🚀 Uso

### Modo Desarrollo

```bash
npm run electron:dev
```

Este comando:
- Inicia el servidor de desarrollo Vite
- Abre la aplicación Electron con hot-reload

### Compilar la Aplicación

```bash
npm run build
```

## 🎮 Funcionalidades

### 🖥️ Selector de Monitores
- Visualiza todos los monitores conectados
- Muestra información detallada:
  - Nombre del monitor
  - Resolución actual
  - Frecuencia de actualización
  - Indicador de monitor principal

### ⚡ Adaptación Automática
- Un clic para aplicar la mejor resolución disponible
- Detección automática de nuevos monitores cada 3 segundos
- Aplicación automática de resolución óptima al conectar nuevo monitor

### ⚙️ Selección Manual
- Lista de todas las resoluciones disponibles
- Indicador visual de resolución actual
- Aplicación de resolución con un clic

### 🔄 Auto-Detección
- Toggle para activar/desactivar la detección automática
- Notificaciones cuando se detecta un nuevo monitor

## 🛠️ Estructura del Proyecto

```
adaptador/
├── electron/
│   ├── main.ts                    # Proceso principal de Electron
│   ├── preload.ts                 # Script de preload
│   └── display/
│       ├── displayService.ts      # Servicio multiplataforma
│       └── scripts/
│           ├── Get-AllDisplays.ps1
│           ├── Get-DisplayModes.ps1
│           └── Set-Display.ps1
├── src/
│   ├── App.tsx                    # Componente principal
│   ├── index.css                  # Estilos Tailwind
│   └── main.tsx                   # Punto de entrada React
└── package.json
```

## 🐧 Cómo Funciona en Linux

La aplicación utiliza **xrandr**, una utilidad estándar de X11 para:
- Listar todos los monitores conectados
- Obtener resoluciones y frecuencias disponibles
- Cambiar la resolución y frecuencia de actualización

Ejemplo de comando usado internamente:
```bash
# Listar monitores
xrandr

# Cambiar resolución
xrandr --output HDMI-1 --mode 1920x1080 --rate 60
```

## 🪟 Cómo Funciona en Windows

La aplicación utiliza **PowerShell** con APIs de Windows para:
- Enumerar monitores mediante `EnumDisplaySettings`
- Cambiar resoluciones mediante `ChangeDisplaySettingsEx`

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto.

## 🐛 Solución de Problemas

### Linux: "xrandr: command not found"
```bash
sudo apt install x11-xserver-utils
```

### Linux: La aplicación no detecta monitores
- Verifica que estés usando X11 (no Wayland)
- Ejecuta `xrandr` manualmente para verificar que funciona

### Windows: Error de PowerShell
- Verifica que PowerShell esté instalado
- Ejecuta como administrador si es necesario

## 💡 Tecnologías Utilizadas

- **Electron** - Framework para aplicaciones de escritorio
- **React** - Biblioteca de UI
- **TypeScript** - Lenguaje de programación
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS
- **xrandr** (Linux) - Gestión de pantallas
- **PowerShell** (Windows) - Scripts de sistema
