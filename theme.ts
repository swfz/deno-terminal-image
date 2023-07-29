const defaultTheme = {
  topStatusLine: {
    itemColors: ["#6797e8", "#a4e083", "#efb24a", "#ec7563"],
    textColor: "#555555",
    bgColor: "#333333",
  },
  bottomStatusLine: {
    itemColors: ["#6797e8", "#a4e083", "#efb24a", "#ec7563"],
    textColor: "#555555",
    bgColor: "#333333",
  },
  bgColor: "#313d4f",
  promptColor: "#efb24a",
  commandColor: "#888888",
  titleColor: "#FFFFFF",
  cursorColor: "#ec80f7",
};

const solarizedDark = {
  topStatusLine: {
    itemColors: ["#278bd2", "#2aa198", "#b58901", "#6c71c4"],
    textColor: "#002834",
    bgColor: "#073642",
  },
  bottomStatusLine: {
    itemColors: ["#278bd2", "#2aa198", "#b58901", "#6c71c4"],
    textColor: "#002834",
    bgColor: "#073642",
  },
  bgColor: "#002834",
  promptColor: "#d33682",
  commandColor: "#93a1a1",
  titleColor: "#ffffff",
  cursorColor: "#fdf6e3",
};

const solarizedLight = {
  topStatusLine: {
    itemColors: ["#278bd2", "#2aa198", "#b58901", "#6c71c4"],
    textColor: "#fdf6e3",
    bgColor: "#eee8d5",
  },
  bottomStatusLine: {
    itemColors: ["#278bd2", "#2aa198", "#b58901", "#6c71c4"],
    textColor: "#fdf6e3",
    bgColor: "#eee8d5",
  },
  bgColor: "#fdf6e3",
  promptColor: "#b58900",
  commandColor: "#93a1a1",
  titleColor: "#586e75",
  cursorColor: "#fdf6e3",
};

const monochromeMonitor = {
  topStatusLine: {
    itemColors: ["#6fe252", "#54ae3f", "#2f6624", "#133311"],
    textColor: "#000000",
    bgColor: "#071b06",
  },
  bottomStatusLine: {
    itemColors: ["#133311", "#2f6624", "#54ae3f", "#6fe252"],
    textColor: "#000000",
    bgColor: "#071b06",
  },
  bgColor: "#000000",
  promptColor: "#75ed57",
  commandColor: "#75ed57",
  titleColor: "#75ed57",
  cursorColor: "#75ed57",
};

const themes = {
  default: defaultTheme,
  solarizedDark: solarizedDark,
  solarizedLight: solarizedLight,
  monochromeMonitor: monochromeMonitor,
};

export { defaultTheme, solarizedDark, solarizedLight, themes };
