import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface DisplayMode {
    width: number;
    height: number;
    frequency: number;
}

export interface Display {
    name: string;
    description: string;
    currentWidth: number;
    currentHeight: number;
    currentFrequency: number;
    isPrimary: boolean;
    modes: DisplayMode[];
}

export class DisplayService {
    private isWindows = process.platform === 'win32';
    private isLinux = process.platform === 'linux';

    async getAllDisplays(): Promise<Display[]> {
        if (this.isWindows) {
            return this.getWindowsDisplays();
        } else if (this.isLinux) {
            return this.getLinuxDisplays();
        }
        return [];
    }

    async getDisplayModes(displayName: string): Promise<DisplayMode[]> {
        if (this.isWindows) {
            return this.getWindowsModesForDisplay(displayName);
        } else if (this.isLinux) {
            return this.getLinuxModesForDisplay(displayName);
        }
        return [];
    }

    async setDisplayMode(displayName: string, mode: DisplayMode): Promise<boolean> {
        if (this.isWindows) {
            return this.setWindowsMode(displayName, mode);
        } else if (this.isLinux) {
            return this.setLinuxMode(displayName, mode);
        }
        return false;
    }

    private async getWindowsDisplays(): Promise<Display[]> {
        const scriptPath = path.join(__dirname, 'scripts', 'Get-AllDisplays.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
            const displaysData = stdout.trim();

            if (!displaysData) return [];

            const displays: Display[] = [];
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
        } catch (error) {
            console.error('Error getting Windows displays:', error);
            return [];
        }
    }

    private async getWindowsModesForDisplay(deviceName: string): Promise<DisplayMode[]> {
        const scriptPath = path.join(__dirname, 'scripts', 'Get-DisplayModes.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -deviceName "${deviceName}"`);
            const lines = stdout.trim().split('\n');
            const modes: DisplayMode[] = [];

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
        } catch (error) {
            console.error('Error getting Windows modes:', error);
            return [];
        }
    }

    private async setWindowsMode(deviceName: string, mode: DisplayMode): Promise<boolean> {
        const scriptPath = path.join(__dirname, 'scripts', 'Set-Display.ps1');
        try {
            const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}" -deviceName "${deviceName}" -width ${mode.width} -height ${mode.height} -frequency ${mode.frequency}`);
            return stdout.trim() === '0';
        } catch (error) {
            console.error('Error setting Windows mode:', error);
            return false;
        }
    }

    private async getLinuxDisplays(): Promise<Display[]> {
        try {
            const { stdout } = await execAsync('xrandr');
            const displays: Display[] = [];
            const lines = stdout.split('\n');

            let currentDisplay: Partial<Display> | null = null;

            for (const line of lines) {
                if (line.includes(' connected')) {
                    // Save previous display
                    if (currentDisplay && currentDisplay.name) {
                        const modes = await this.getLinuxModesForDisplay(currentDisplay.name);
                        displays.push(currentDisplay as Display);
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
                } else if (currentDisplay && line.trim().match(/^\d+x\d+/)) {
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
                displays.push(currentDisplay as Display);
            }

            return displays;
        } catch (error) {
            console.error('Error getting Linux displays:', error);
            return [];
        }
    }

    private async getLinuxModesForDisplay(outputName: string): Promise<DisplayMode[]> {
        try {
            const { stdout } = await execAsync(`xrandr | grep -A 50 "^${outputName} connected"`);
            const modes: DisplayMode[] = [];
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
        } catch (error) {
            console.error('Error getting Linux modes:', error);
            return [];
        }
    }

    private async setLinuxMode(outputName: string, mode: DisplayMode): Promise<boolean> {
        try {
            await execAsync(`xrandr --output ${outputName} --mode ${mode.width}x${mode.height} --rate ${mode.frequency}`);
            return true;
        } catch (error) {
            console.error('Error setting Linux mode:', error);
            return false;
        }
    }
}
