import { icons } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import { memo, useMemo } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'

export type IconName = keyof typeof icons
type IconProps = {
  name: IconName
  className?: string
  style?: any
  onPress?: () => void
}

/**
 * Mục đích: Icon component wrapper cho lucide-react-native + NativeWind
 * Tham số đầu vào: name (tên icon), className, style (optional), onPress (optional)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Mọi nơi cần hiển thị icon trong app
 */
const Icon: React.FC<IconProps> = memo(({ name, className, style, onPress }) => {
  const CustomIcon = useMemo(() => {
    const LucideIcon = icons[name]

    return cssInterop(LucideIcon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          width: true,
          height: true,
        },
      },
    })
  }, [name])

  const iconElement = <CustomIcon className={className} style={style} />

  // Nếu có onPress, bọc trong Pressable
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {iconElement}
      </Pressable>
    )
  }

  return iconElement
})

export default Icon

