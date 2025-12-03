Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public class DisplayInfo {
    [DllImport("user32.dll")]
    public static extern bool EnumDisplayDevices(string lpDevice, uint iDevNum, ref DISPLAY_DEVICE lpDisplayDevice, uint dwFlags);
    
    [DllImport("user32.dll")]
    public static extern bool EnumDisplaySettings(string deviceName, int modeNum, ref DEVMODE devMode);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public struct DISPLAY_DEVICE {
        public int cb;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string DeviceName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string DeviceString;
        public int StateFlags;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string DeviceID;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string DeviceKey;
    }

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

    public static string GetAllDisplays() {
        var displays = new List<string>();
        uint id = 0;
        
        while (true) {
            DISPLAY_DEVICE d = new DISPLAY_DEVICE();
            d.cb = Marshal.SizeOf(d);
            
            if (!EnumDisplayDevices(null, id, ref d, 0))
                break;
                
            if ((d.StateFlags & 0x00000001) != 0) { 
                DEVMODE dm = new DEVMODE();
                dm.dmSize = (short)Marshal.SizeOf(dm);
                
                if (EnumDisplaySettings(d.DeviceName, -1, ref dm)) { 
                    bool isPrimary = (d.StateFlags & 0x00000004) != 0;
                    displays.Add(string.Format("{0}|{1}|{2}|{3}|{4}|{5}", 
                        d.DeviceName, d.DeviceString, dm.dmPelsWidth, dm.dmPelsHeight, dm.dmDisplayFrequency, isPrimary));
                }
            }
            
            id++;
        }
        
        return string.Join(";", displays.ToArray());
    }
}
"@

[DisplayInfo]::GetAllDisplays()
