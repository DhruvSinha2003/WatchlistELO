import { Github, Linkedin, Moon, Sun, Type } from "lucide-react";
import React from "react";

const Header = ({ currentTheme, onThemeChange, currentFont, onFontChange }) => {
  const getNextTheme = () => {
    const themes = ["dark", "beige", "light"];
    const currentIndex = themes.indexOf(currentTheme);
    return themes[(currentIndex + 1) % themes.length];
  };

  const getNextFont = () => {
    const fonts = ["modern", "classic", "elegant"];
    const currentIndex = fonts.indexOf(currentFont);
    return fonts[(currentIndex + 1) % fonts.length];
  };

  const getFontLabel = () => {
    const labels = {
      modern: "Modern",
      classic: "Classic",
      elegant: "Elegant",
    };
    return labels[currentFont];
  };

  const getThemeIcon = () => {
    return currentTheme === "dark" ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    );
  };

  return (
    <header className="w-full bg-background p-4 shadow-md relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            WatchlistELO
          </a>

          <div className="flex items-center gap-4 text-text-secondary">
            <span
              className="text-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              by Dhruv Sinha
            </span>
            <a
              href="https://github.com/DhruvSinha2003/WatchlistELO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/dhruvsinha2003/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onFontChange(getNextFont())}
            className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
            title="Change Font Style"
          >
            <Type className="w-5 h-5 text-primary" />
            <span className="text-sm text-text-secondary">
              {getFontLabel()}
            </span>
          </button>

          <button
            onClick={() => onThemeChange(getNextTheme())}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Toggle Theme"
          >
            <span className="text-primary">{getThemeIcon()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
