$code = @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class DisplayInfo {
    [DllImport("user32.dll")]
    public static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE devMode);

    [StructLayout(LayoutKind.Sequential)]
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

    public static List<string> GetModes() {
        var modes = new List<string>();
        DEVMODE vDevMode = new DEVMODE();
        int i = 0;
        while (EnumDisplaySettings(null, i, ref vDevMode)) {
            modes.Add($"{vDevMode.dmPelsWidth}x{vDevMode.dmPelsHeight}@{vDevMode.dmDisplayFrequency}Hz");
            i++;
        }
        return modes;
    }
}
"@

Add-Type -TypeDefinition $code
[DisplayInfo]::GetModes() | Select-Object -Unique
