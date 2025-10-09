import { Alert, Button, Result } from 'antd'

export const ErrorPage = ({ error, message }: { error?: unknown; message?: string }) => {
  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle="An unexpected error occurred while rendering this page."
      extra={[
        <Button
          type="primary"
          onClick={() => {
            window.location.reload()
          }}
          key="reload"
        >
          Reload Page
        </Button>,
      ]}
    >
      {!!error && (
        <div style={{ maxWidth: 600, margin: '16px auto' }}>
          <Alert
            message="Error Details"
            description={
              message ||
              (typeof error === 'object' && 'message' in error && typeof error.message === 'string'
                ? error.message
                : 'Unknown error')
            }
            type="error"
            showIcon
          />
        </div>
      )}
    </Result>
  )
}
