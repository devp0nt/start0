import { GeneralLayout } from '@/webapp/src/components/layout/GeneralLayout/index.js'
import { RichText } from '@/webapp/src/components/other/RichText/index.js'
import { withPageWrapper } from '@/webapp/src/lib/pageWrapper.js'
import { Block, Segment } from '@/webapp/src/lib/uninty.components.js'

export const HomePage = withPageWrapper({
  isTitleExact: true,
  title: 'Svagatron',
  Layout: GeneralLayout,
})(() => {
  return (
    <Block fcnw>
      <Segment title="Welcome!" size="m">
        <RichText>
          <p>Please copy this boilerplate and make your own awesome project!</p>
        </RichText>
      </Segment>
    </Block>
  )
})
