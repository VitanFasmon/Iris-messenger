import { useUiStore } from "../store/uiStore";
import { getTheme } from "../lib/theme";

export const useTheme = () => {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const colors = getTheme(theme);

  return { theme, setTheme, colors };
};
