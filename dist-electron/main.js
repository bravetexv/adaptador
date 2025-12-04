"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const displayService_1 = require("./display/displayService");
let tray = null;
const displayService = new displayService_1.DisplayService();
let previousDisplayCount = 0;
let isChecking = false;
const createTray = () => {
    const icon = electron_1.nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpdM9SwNBEAbgJxdEUMEiFhYiCNqkELGwsBFsbPwBgr9A0N8gWFhZWVj4A0Q7K0EQbBQRBEGwUAQLQRBBUDCJxWZhb3Pvci7ODhzL7rvzzOzN7hJVZYC0MQVgAhuwvNtiAPvow/Y98hDW4AKL+MYWvBzHtbiBF/vwAz9w/Vfgs48e8IU9+EUP/BBucAcf+ATQ8Zc17YG+0bQH+oLHGA6+8Sm0fZ0XjKPrP+hRNp1awjiu0MEk1nGJBg5wilN8xNp1rFQFpPpS6KJpy6lhC1NYwiNm8BxrN7DKVldBVnkX77GyiTW0sYcWRvGKjtvPAnLKu3jBM5YxDAWOMYw3XKFRBiD3oBV4wb5rM20s4Ag3WCoBkHvQIhQ88Ag3gF3MA19woKogr9xS0qJ1vOMBD2jhHBcYKwOQW9Ci5bJyI2n/AH9jWS2Ow0IZAAAAAElFTkSuQmCC');
    tray = new electron_1.Tray(icon);
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: 'Display Adapter', enabled: false },
        { type: 'separator' },
        { label: 'Estado: Monitoreando...', enabled: false },
        { type: 'separator' },
        { label: 'Salir', click: () => electron_1.app.quit() }
    ]);
    tray.setToolTip('Display Adapter - Adaptación automática activa');
    tray.setContextMenu(contextMenu);
};
const checkForNewDisplays = async () => {
    if (isChecking)
        return;
    isChecking = true;
    try {
        const displays = await displayService.getAllDisplays();
        if (displays.length > previousDisplayCount && previousDisplayCount > 0) {
            console.log('Nuevo monitor detectado!');
            const newDisplay = displays[displays.length - 1];
            if (newDisplay.modes.length > 0) {
                const nativeMode = newDisplay.modes[0];
                console.log(`Adaptando ${newDisplay.description} a ${nativeMode.width}x${nativeMode.height}@${nativeMode.frequency}Hz`);
                const success = await displayService.setDisplayMode(newDisplay.name, nativeMode);
                if (success && tray) {
                    console.log('✓ Resolución adaptada exitosamente');
                    tray.displayBalloon({
                        title: 'Monitor Adaptado',
                        content: `${newDisplay.description}\n${nativeMode.width}x${nativeMode.height} @ ${nativeMode.frequency}Hz`
                    });
                }
            }
        }
        previousDisplayCount = displays.length;
    }
    catch (error) {
        console.error('Error checking displays:', error);
    }
    finally {
        isChecking = false;
    }
};
electron_1.app.whenReady().then(async () => {
    const initialDisplays = await displayService.getAllDisplays();
    previousDisplayCount = initialDisplays.length;
    console.log('Display Adapter iniciado');
    console.log(`Monitores detectados: ${previousDisplayCount}`);
    createTray();
    setInterval(checkForNewDisplays, 2000);
});
electron_1.app.on('window-all-closed', () => {
    // Mantener la app corriendo en background
});
electron_1.app.on('activate', () => {
    // No hacer nada
});
