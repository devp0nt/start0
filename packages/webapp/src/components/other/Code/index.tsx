import css from './styles.module.scss'

export const Code = ({ data }: { data: Record<string, any> }) => (
  <code className={css.code}>
    <pre className={css.pre}>{JSON.stringify(data, null, 2)}</pre>
  </code>
)
