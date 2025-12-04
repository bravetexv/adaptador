param(
    [string]$deviceName
)

Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class DisplayModes {
    [DllImport("user32.dll")]
    public static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE devMode);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public struct DEVMODE {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmDeviceName;
        public short dmSpecVersion;
        public short dmDriverVersion;
        public short dmSize;
        public short dmDriverExtra;
        public int dmFields;
        public int dmPositionX;
        public int dmPositionY;
        public int dmDisplayOrientation;
        public int dmDisplayFixedOutput;
        public short dmColor;
        public short dmDuplex;
        public short dmYResolution;
        public short dmTTOption;
        public short dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmFormName;
        public short dmLogPixels;
        public int dmBitsPerPel;
        public int dmPelsWidth;
        public int dmPelsHeight;
        public int dmDisplayFlags;
        public int dmDisplayFrequency;
        public int dmICMMethod;
        public int dmICMIntent;
        public int dmMediaType;
        public int dmDitherType;
        public int dmReserved1;
        public int dmReserved2;
        public int dmPanningWidth;
        public int dmPanningHeight;
    }

    public static List<string> GetModes(string deviceName) {
        var modes = new List<string>();
        DEVMODE vDevMode = new DEVMODE();
        vDevMode.dmSize = (short)Marshal.SizeOf(vDevMode);
        int i = 0;
        
        while (EnumDisplaySettings(deviceName, i, ref vDevMode)) {
            modes.Add(string.Format("{0}x{1}@{2}Hz", vDevMode.dmPelsWidth, vDevMode.dmPelsHeight, vDevMode.dmDisplayFrequency));
            i++;
        }
        return modes;
    }
}
"@

[DisplayModes]::GetModes($deviceName) | Select-Object -Unique
