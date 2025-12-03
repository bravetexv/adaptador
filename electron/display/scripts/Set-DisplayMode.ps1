param(
    [int]$width,
    [int]$height,
    [int]$frequency
)

$code = @"
using System;
using System.Runtime.InteropServices;

public class DisplayChanger {
    [DllImport("user32.dll")]
    public static extern int ChangeDisplaySettings(ref DEVMODE devMode, int flags);

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

    public const int DM_PELSWIDTH = 0x00080000;
    public const int DM_PELSHEIGHT = 0x00100000;
    public const int DM_DISPLAYFREQUENCY = 0x00400000;
    public const int CDS_UPDATEREGISTRY = 0x01;
    public const int CDS_TEST = 0x02;

    public static string SetDisplay(int width, int height, int frequency) {
        DEVMODE dm = new DEVMODE();
        dm.dmSize = (short)Marshal.SizeOf(dm);
        
        // Find the mode first to get other parameters right
        DEVMODE tempDm = new DEVMODE();
        int i = 0;
        bool found = false;
        while (EnumDisplaySettings(null, i, ref tempDm)) {
            if (tempDm.dmPelsWidth == width && tempDm.dmPelsHeight == height && tempDm.dmDisplayFrequency == frequency) {
                dm = tempDm;
                found = true;
                break;
            }
            i++;
        }

        if (!found) {
            return "Mode not supported";
        }

        int iRet = ChangeDisplaySettings(ref dm, CDS_UPDATEREGISTRY);
        return iRet.ToString();
    }
}
"@

Add-Type -TypeDefinition $code
[DisplayChanger]::SetDisplay($width, $height, $frequency)
