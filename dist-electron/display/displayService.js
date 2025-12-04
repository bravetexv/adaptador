"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayService = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class DisplayService {
    isWindows = process.platform === 'win32';
    isLinux = process.platform === 'linux';
    async getAllDisplays() {
        if (this.isWindows) {
            return this.getWindowsDisplays();
        }
        else if (this.isLinux) {
            return this.getLinuxDisplays();
        }
        return [];
    }
    async getDisplayModes(displayName) {
        if (this.isWindows) {
            return this.getWindowsModesForDisplay(displayName);
        }
        else if (this.isLinux) {
            return this.getLinuxModesForDisplay(displayName);
        }
        return [];
    }
    async setDisplayMode(displayName, mode) {
        if (this.isWindows) {
            return this.setWindowsMode(displayName, mode);
        }
        else if (this.isLinux) {
            return this.setLinuxMode(displayName, mode);
        }
        return false;
    }
    async getWindowsDisplays() {
        const scriptPath = path_1.default.join(__dirname, 'scripts', 'Get-AllDisplays.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
            const displaysData = stdout.trim();
            if (!displaysData)
                return [];
            const displays = [];
            const displayItems = displaysData.split(';');
            for (const item of displayItems) {
                const parts = item.trim().split('|');
                if (parts.length >= 6) {
                    const [name, description, width, height, frequency, isPrimary] = parts;
                    // Get modes for this display
                    const modes = await this.getWindowsModesForDisplay(name);
                    displays.push({
                        name,
                        description,
                        currentWidth: parseInt(width),
                        currentHeight: parseInt(height),
                        currentFrequency: parseInt(frequency),
                        isPrimary: isPrimary === 'True',
                        modes
                    });
                }
            }
            return displays;
        }
        catch (error) {
            console.error('Error getting Windows displays:', error);
            return [];
        }
    }
    async getWindowsModesForDisplay(deviceName) {
        const scriptPath = path_1.default.join(__dirname, 'scripts', 'Get-DisplayModes.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -deviceName "${deviceName}"`);
            const lines = stdout.trim().split('\n');
            const modes = [];
            for (const line of lines) {
                const match = line.trim().match(/(\d+)x(\d+)@(\d+)Hz/);
                if (match) {
                    modes.push({
                        width: parseInt(match[1]),
                        height: parseInt(match[2]),
                        frequency: parseInt(match[3])
                    });
                }
            }
            return modes;
        }
        catch (error) {
            console.error('Error getting Windows modes:', error);
            return [];
        }
    }
    async setWindowsMode(deviceName, mode) {
        const scriptPath = path_1.default.join(__dirname, 'scripts', 'Set-Display.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -deviceName "${deviceName}" -width ${mode.width} -height ${mode.height} -frequency ${mode.frequency}`);
            return stdout.trim() === '0';
        }
        catch (error) {
            console.error('Error setting Windows mode:', error);
            return false;
        }
    }
    async getLinuxDisplays() {
        try {
            const { stdout } = await execAsync('xrandr');
            const displays = [];
            const lines = stdout.split('\n');
            let currentDisplay = null;
            for (const line of lines) {
                if (line.includes(' connected')) {
                    // Save previous display
                    if (currentDisplay && currentDisplay.name) {
                        const modes = await this.getLinuxModesForDisplay(currentDisplay.name);
                        displays.push(currentDisplay);
                    }
                    const parts = line.split(' ');
                    const name = parts[0];
                    const isPrimary = line.includes('primary');
                    currentDisplay = {
                        name,
                        description: name,
                        isPrimary,
                        modes: []
                    };
                }
                else if (currentDisplay && line.trim().match(/^\d+x\d+/)) {
                    const parts = line.trim().split(/\s+/);
                    const res = parts[0];
                    const [width, height] = res.split('x').map(Number);
                    for (let i = 1; i < parts.length; i++) {
                        let rateStr = parts[i].replace('*', '').replace('+', '');
                        const rate = parseFloat(rateStr);
                        if (!isNaN(rate)) {
                            if (parts[i].includes('*')) {
                                currentDisplay.currentWidth = width;
                                currentDisplay.currentHeight = height;
                                currentDisplay.currentFrequency = Math.round(rate);
                            }
                        }
                    }
                }
            }
            // Add last display
            if (currentDisplay && currentDisplay.name) {
                const modes = await this.getLinuxModesForDisplay(currentDisplay.name);
                currentDisplay.modes = modes;
                displays.push(currentDisplay);
            }
            return displays;
        }
        catch (error) {
            console.error('Error getting Linux displays:', error);
            return [];
        }
    }
    async getLinuxModesForDisplay(outputName) {
        try {
            const { stdout } = await execAsync(`xrandr | grep -A 50 "^${outputName} connected"`);
            const modes = [];
            const lines = stdout.split('\n');
            for (const line of lines) {
                if (line.trim().match(/^\d+x\d+/)) {
                    const parts = line.trim().split(/\s+/);
                    const res = parts[0];
                    const [width, height] = res.split('x').map(Number);
                    for (let i = 1; i < parts.length; i++) {
                        let rateStr = parts[i].replace('*', '').replace('+', '');
                        const rate = parseFloat(rateStr);
                        if (!isNaN(rate)) {
                            modes.push({ width, height, frequency: Math.round(rate) });
                        }
                    }
                }
            }
            return modes;
        }
        catch (error) {
            console.error('Error getting Linux modes:', error);
            return [];
        }
    }
    async setLinuxMode(outputName, mode) {
        try {
            await execAsync(`xrandr --output ${outputName} --mode ${mode.width}x${mode.height} --rate ${mode.frequency}`);
            return true;
        }
        catch (error) {
            console.error('Error setting Linux mode:', error);
            return false;
        }
    }
}
exports.DisplayService = DisplayService;
