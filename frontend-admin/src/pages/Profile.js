import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Button, 
  Spin, 
  message, 
  Form,
  Input,
  Tabs,
  Avatar,
  Descriptions,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Password } = Input;

const Profile = () => {
  const { admin, updateAdmin } = useAuth();
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/api/admin/password', {
        old_password: values.old_password,
        new_password: values.new_password,
      });
      if (res.code === 200) {
        message.success('密码修改成功');
        passwordForm.resetFields();
      } else {
        message.error(res.msg || '密码修改失败');
      }
    } catch (error) {
      message.error(error.response?.data?.msg || '密码修改失败，请稍后重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">个人中心</h2>
      </div>

      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ margin: 0 }}>{admin?.username}</h3>
          </div>
        </div>

        <Tabs defaultActiveKey="info">
          <TabPane tab="基本信息" key="info">
            <Descriptions column={1} bordered size="large">
              <Descriptions.Item label="用户名">{admin?.username || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{admin?.id || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={admin?.status === 1 ? 'green' : 'red'}>
                  {admin?.status === 1 ? '正常' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {admin?.created_at ? dayjs(admin.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新时间">
                {admin?.updated_at ? dayjs(admin.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="修改密码" key="password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
              style={{ maxWidth: '400px', margin: '0 auto' }}
            >
              <Form.Item
                name="old_password"
                label="原密码"
                rules={[
                  { required: true, message: '请输入原密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Password placeholder="请输入原密码" />
              </Form.Item>

              <Form.Item
                name="new_password"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="确认新密码"
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Password placeholder="请再次输入新密码" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Button type="primary" size="large" htmlType="submit" loading={passwordLoading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;