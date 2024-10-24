import { Errory } from '@/general/src/other/errory.js'
import { trackError } from '@/webapp/src/lib/sentry.js'
import { toast } from '@/webapp/src/lib/toaster.js'
import {
  Checkbox,
  Checkboxes,
  FormItem,
  Radiobutton,
  Radiobuttons,
  Textarea,
  Textfield,
} from '@/webapp/src/lib/uninty.components.js'
import type { SingleValue } from 'react-select'
import Select from 'react-select'
import { createFormyThings } from 'svag-formy'
import type { FormyInputPropsGeneral } from 'svag-formy/dist/utils.js'

export const { useFormy, useFormyField } = createFormyThings({
  useFormyProps: {
    Errory,
    toast,
    trackError,
    validationErrorMessage: 'Some fields are invalid',
  },
})

export const Textfieldy = ({
  label,
  formy,
  name,
  hint,
  ...restProps
}: FormyInputPropsGeneral & React.ComponentProps<typeof FormItem> & React.ComponentProps<typeof Textfield>) => {
  const { error, value } = useFormyField({ formy, name })
  return (
    <FormItem label={label} hint={hint} error={error}>
      <Textfield
        {...restProps}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value
          void formy.setFieldValue(name, newValue)
          restProps.onChange?.(e)
        }}
        onBlur={() => {
          void formy.setFieldTouched(name, true)
          restProps.onBlur?.()
        }}
      />
    </FormItem>
  )
}

export const Textary = ({
  label,
  formy,
  name,
  hint,
  ...restProps
}: FormyInputPropsGeneral & React.ComponentProps<typeof FormItem> & React.ComponentProps<typeof Textarea>) => {
  const { error, value } = useFormyField({ formy, name })
  return (
    <FormItem label={label} hint={hint} error={error}>
      <Textarea
        {...restProps}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value
          void formy.setFieldValue(name, newValue)
          restProps.onChange?.(e)
        }}
        onBlur={() => {
          void formy.setFieldTouched(name, true)
          restProps.onBlur?.()
        }}
      />
    </FormItem>
  )
}

export const Radiobuttonsy = ({
  label,
  formy,
  name,
  hint,
  options,
  ...restProps
}: FormyInputPropsGeneral &
  React.ComponentProps<typeof FormItem> &
  React.ComponentProps<typeof Radiobuttons> & {
    options: Array<{ value: string; label: string }>
  }) => {
  const { error, value } = useFormyField({ formy, name })
  return (
    <FormItem label={label} hint={hint} error={error}>
      <Radiobuttons direction={restProps.direction}>
        {options.map((option) => (
          <Radiobutton
            key={option.value}
            checked={option.value === value}
            onChange={() => {
              void formy.setFieldValue(name, option.value)
            }}
            label={option.label}
          />
        ))}
      </Radiobuttons>
    </FormItem>
  )
}

export const Checkboxesy = ({
  label,
  formy,
  name,
  hint,
  options,
  ...restProps
}: FormyInputPropsGeneral &
  React.ComponentProps<typeof FormItem> &
  React.ComponentProps<typeof Checkboxes> & {
    options: Array<{ value: string; label: string }>
  }) => {
  const { error, value } = useFormyField<string[]>({ formy, name })
  return (
    <FormItem label={label} hint={hint} error={error}>
      <Checkboxes direction={restProps.direction}>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={(e) => {
              const newValue = e.target.checked ? [...value, option.value] : value.filter((v) => v !== option.value)
              void formy.setFieldValue(name, newValue)
            }}
            label={option.label}
          />
        ))}
      </Checkboxes>
    </FormItem>
  )
}

export const Switchy = ({
  label,
  optionLabel,
  formy,
  name,
  hint,
  ...restProps
}: FormyInputPropsGeneral &
  React.ComponentProps<typeof FormItem> &
  React.ComponentProps<typeof Checkbox> & {
    optionLabel: string
    disabled?: boolean
  }) => {
  const { error, value } = useFormyField<boolean>({ formy, name })
  return (
    <FormItem label={label} hint={hint} error={error}>
      <Checkbox
        checked={value}
        onChange={(e) => {
          const newValue = e.target.checked
          void formy.setFieldValue(name, newValue)
        }}
        label={optionLabel}
        {...restProps}
      />
    </FormItem>
  )
}

export const Selecty = ({
  label,
  formy,
  name,
  hint,
  options,
  disabled,
  ...restProps
}: FormyInputPropsGeneral &
  React.ComponentProps<typeof FormItem> & {
    disabled?: boolean
    options: Array<{ value: string; label: string }>
    onChange?: (selectedOption: SingleValue<{ value: string; label: string }>) => any
    onBlur?: () => any
  }) => {
  const { error, value } = useFormyField({ formy, name })

  return (
    <FormItem label={label} hint={hint} error={error}>
      <Select
        {...restProps}
        isDisabled={disabled}
        options={options}
        value={options.find((option) => option.value === value)}
        onChange={(selectedOption) => {
          void formy.setFieldValue(name, selectedOption ? selectedOption.value : null)
          restProps.onChange?.(selectedOption)
        }}
        onBlur={() => {
          void formy.setFieldTouched(name, true)
          restProps.onBlur?.()
        }}
      />
    </FormItem>
  )
}
