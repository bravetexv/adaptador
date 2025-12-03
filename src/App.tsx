import { useEffect, useState } from 'react';

interface DisplayMode {
  width: number;
  height: number;
  frequency: number;
}

interface Display {
  name: string;
  description: string;
  currentWidth: number;
  currentHeight: number;
  currentFrequency: number;
  isPrimary: boolean;
  modes: DisplayMode[];
}

declare global {
  interface Window {
    electronAPI: {
      getAllDisplays: () => Promise<Display[]>;
      getDisplayModes: (displayName: string) => Promise<DisplayMode[]>;
      setDisplayMode: (displayName: string, mode: DisplayMode) => Promise<boolean>;
    };
  }
}

function App() {
  const [displays, setDisplays] = useState<Display[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);

  useEffect(() => {
    loadDisplays();

    // Auto-detect new displays every 3 seconds
    const interval = setInterval(() => {
      if (autoDetectEnabled) {
        checkForNewDisplays();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoDetectEnabled]);

  const loadDisplays = async () => {
    setIsLoading(true);
    try {
      const allDisplays = await window.electronAPI.getAllDisplays();
      setDisplays(allDisplays);
      if (allDisplays.length > 0 && !selectedDisplay) {
        // Select primary display by default
        const primary = allDisplays.find(d => d.isPrimary) || allDisplays[0];
        setSelectedDisplay(primary);
      }
      setStatus('Monitores cargados');
    } catch (err) {
      console.error(err);
      setStatus('Error al cargar monitores');
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewDisplays = async () => {
    try {
      const allDisplays = await window.electronAPI.getAllDisplays();

      // Check if a new display was added
      if (allDisplays.length > displays.length) {
        const newDisplay = allDisplays[allDisplays.length - 1];
        setDisplays(allDisplays);

        // Auto-adapt to the new display
        if (newDisplay.modes.length > 0) {
          setStatus(`Nuevo monitor detectado: ${newDisplay.description}`);
          await autoAdaptDisplay(newDisplay);
        }
      } else if (allDisplays.length !== displays.length) {
        setDisplays(allDisplays);
      }
    } catch (err) {
      console.error('Error checking displays:', err);
    }
  };

  const autoAdaptDisplay = async (display: Display) => {
    setIsLoading(true);
    setStatus(`Adaptando ${display.description}...`);

    try {
      // Find the best mode (usually the first one, which is the native/highest)
      const bestMode = display.modes[0];

      if (bestMode) {
        const success = await window.electronAPI.setDisplayMode(display.name, bestMode);
        if (success) {
          setStatus(`✓ Adaptado a ${bestMode.width}x${bestMode.height} @ ${bestMode.frequency}Hz`);
          await loadDisplays();
        } else {
          setStatus('✗ Error al aplicar modo');
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('✗ Error al adaptar monitor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyMode = async (mode: DisplayMode) => {
    if (!selectedDisplay) return;

    setIsLoading(true);
    setStatus('Aplicando...');

    try {
      const success = await window.electronAPI.setDisplayMode(selectedDisplay.name, mode);
      if (success) {
        setStatus(`✓ Aplicado: ${mode.width}x${mode.height} @ ${mode.frequency}Hz`);
        await loadDisplays();
      } else {
        setStatus('✗ Error al aplicar modo');
      }
    } catch (err) {
      console.error(err);
      setStatus('✗ Error al aplicar modo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoAdapt = () => {
    if (selectedDisplay) {
      autoAdaptDisplay(selectedDisplay);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Display Adapter
          </h1>
          <p className="text-gray-400">Adaptación automática de resolución</p>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 mb-6 border border-gray-700 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Estado:</p>
              <p className="text-xl font-mono flex items-center gap-2">
                {isLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                )}
                {status || 'Listo'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetectEnabled}
                  onChange={(e) => setAutoDetectEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-500"
                />
                <span className="text-sm text-gray-300">Auto-detectar</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Selector */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 mb-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-400">🖥️</span>
            Salida de Video
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displays.map((display) => (
              <button
                key={display.name}
                onClick={() => setSelectedDisplay(display)}
                className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${selectedDisplay?.name === display.name
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{display.description}</h3>
                    {display.isPrimary && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded mt-1 inline-block">
                        Principal
                      </span>
                    )}
                  </div>
                  {selectedDisplay?.name === display.name && (
                    <span className="text-2xl">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  Actual: {display.currentWidth} × {display.currentHeight} @ {display.currentFrequency}Hz
                </p>
                <p className="text-xs text-gray-500 mt-1">{display.name}</p>
              </button>
            ))}
          </div>

          {displays.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se detectaron monitores
            </div>
          )}
        </div>

        {/* Auto Adapt Button */}
        {selectedDisplay && (
          <button
            onClick={handleAutoAdapt}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-lg mb-6 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="text-2xl">⚡</span>
            Adaptar Automáticamente
          </button>
        )}

        {/* Manual Selection */}
        {selectedDisplay && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-400">⚙️</span>
              Selección Manual
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {selectedDisplay.modes.map((mode, index) => {
                const isCurrent =
                  selectedDisplay.currentWidth === mode.width &&
                  selectedDisplay.currentHeight === mode.height &&
                  selectedDisplay.currentFrequency === mode.frequency;

                return (
                  <button
                    key={index}
                    onClick={() => handleApplyMode(mode)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-lg flex justify-between items-center transition-all duration-300 ${isCurrent
                        ? 'bg-green-600 shadow-lg shadow-green-500/50'
                        : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600 hover:border-gray-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="font-mono text-lg">
                      {mode.width} × {mode.height}
                    </span>
                    <span className="text-gray-300 flex items-center gap-2">
                      {mode.frequency} Hz
                      {isCurrent && <span className="text-xl">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
