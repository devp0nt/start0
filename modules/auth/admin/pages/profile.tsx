import { authClient } from '@auth/admin-base/utils'
import { Card, Form, Input, Button, message, Space } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useState } from 'react'

export const ProfilePage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleChangePassword = (values: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
    revokeOtherSessions?: boolean
  }) => {
    setLoading(true)
    authClient
      .changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions ?? false,
      })
      .then(({ error }) => {
        if (error) {
          message.error(error.message || 'Failed to change password')
        } else {
          message.success('Password changed successfully')
          form.resetFields()
        }
      })
      .catch(() => {
        message.error('An error occurred while changing password')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Password Change Section */}
        <Card title="Change Password" variant="outlined">
          <Form form={form} layout="vertical" onFinish={handleChangePassword} autoComplete="off">
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" size="large" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  async validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      await Promise.resolve()
                      return
                    }
                    return await Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
            </Form.Item>

            <Form.Item name="revokeOtherSessions" valuePropName="checked" tooltip="Log out from all other devices">
              <input type="checkbox" /> Revoke other sessions
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Future Settings Section */}
        <Card title="Account Settings" variant="outlined">
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
            Additional account settings will be available here
          </div>
        </Card>
      </Space>
    </div>
  )
}
