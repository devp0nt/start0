/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@cross/app/constants/theme'
import { useColorScheme } from '@cross/app/hooks/use-color-scheme'

export function useThemeColor(
  props: { light?: string; dark?: string },
  // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? 'light'
  const colorFromProps = props[theme]

  if (colorFromProps) {
    return colorFromProps
  } else {
    return Colors[theme][colorName]
  }
}
