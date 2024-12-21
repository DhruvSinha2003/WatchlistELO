import { Settings } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const Header = ({ currentTheme, onThemeChange, currentFont, onFontChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const customizeButtonRef = useRef(null);
  const [trayPosition, setTrayPosition] = useState({ top: 0, right: 0 });

  const fontOptions = [
    { value: "modern", label: "Modern (Poppins & DM Sans)" },
    { value: "classic", label: "Classic (Montserrat & Source Sans)" },
    { value: "elegant", label: "Elegant (Raleway & Source Sans)" },
  ];

  const themeOptions = [
    { value: "default", label: "Beige & Orange" },
    { value: "light", label: "White & Blue" },
    { value: "dark", label: "Grey & Cyan" },
  ];

  useEffect(() => {
    if (showCustomize && customizeButtonRef.current) {
      const rect = customizeButtonRef.current.getBoundingClientRect();
      setTrayPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showCustomize]);

  const handleClickOutside = (e) => {
    if (
      !e.target.closest(".customize-tray") &&
      !e.target.closest(".customize-button")
    ) {
      setShowCustomize(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-background p-4 shadow-md relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          WatchlistELO
        </h1>

        <div className="flex items-center gap-4">
          <button
            ref={customizeButtonRef}
            onClick={() => setShowCustomize(!showCustomize)}
            className="customize-button p-2 hover:bg-secondary rounded-full transition-colors"
            title="Customize"
          >
            <Settings className="w-5 h-5 text-primary" />
          </button>

          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="px-4 py-2 bg-button-disabled text-background rounded cursor-not-allowed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Login
            </button>

            {showTooltip && (
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-text text-background text-sm rounded shadow-lg whitespace-nowrap"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Under Development
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-text"></div>
              </div>
            )}
          </div>
        </div>

        {showCustomize && (
          <div
            className="customize-tray fixed w-64 bg-background border border-secondary rounded-lg shadow-lg p-4 z-50"
            style={{
              top: `${trayPosition.top}px`,
              right: `${trayPosition.right}px`,
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  Theme
                </label>
                <select
                  value={currentTheme}
                  onChange={(e) => onThemeChange(e.target.value)}
                  className="w-full bg-background text-text border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                >
                  {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">
                  Font Style
                </label>
                <select
                  value={currentFont}
                  onChange={(e) => onFontChange(e.target.value)}
                  className="w-full bg-background text-text border border-secondary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                >
                  {fontOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
