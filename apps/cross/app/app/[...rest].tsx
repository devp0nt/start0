import { Link, useLocalSearchParams, usePathname, router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, TextInput, View } from 'react-native'

const generateRandomPath = () => {
  return `/random/${Math.random().toString(36).substring(2, 15)}/${Math.random().toString(36).substring(2, 15)}` as const
}

export default function DynamicRestPage() {
  const params = useLocalSearchParams<{ rest: string[] }>()
  const pathname = usePathname()
  const [value, setValue] = useState('')

  const [randomPath, setRandomPath] = useState(() => generateRandomPath())
  useEffect(() => {
    setRandomPath(generateRandomPath())
  }, [pathname])

  return (
    <View>
      <Link href="/">Go to home</Link>
      <Link href={randomPath}>Link to {randomPath}</Link>
      <Link href={randomPath} push>
        Link push to {randomPath}
      </Link>
      <Link href={randomPath} replace>
        Link replace to {randomPath}
      </Link>
      <Text
        onPress={() => {
          router.push(randomPath)
        }}
      >
        Push {randomPath}
      </Text>
      <Text>{JSON.stringify({ params, pathname })}</Text>
      <TextInput value={value} onChangeText={setValue} style={{ borderWidth: 1, borderColor: 'black' }} />
    </View>
  )
}
