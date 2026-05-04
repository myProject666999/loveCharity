import React, { useEffect, useState } from 'react';
import { Card, Button, message, Spin, Form, Input, Tabs, Avatar, Upload, Space, Select } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const { TabPane } = Tabs;
const { Password } = Input;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [infoForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/user/info');
      if (res.code === 200) {
        const userData = res.data;
        infoForm.setFieldsValue({
          nickname: userData.nickname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender !== undefined ? String(userData.gender) : '',
        });
        updateUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (values) => {
    setInfoLoading(true);
    try {
      const data = {
        nickname: values.nickname,
        email: values.email,
        phone: values.phone,
        gender: values.gender !== undefined ? parseInt(values.gender) : 0,
      };

      const res = await api.put('/api/user/info', data);
      if (res.code === 200) {
        message.success('个人信息更新成功');
        updateUser(res.data);
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/api/user/password', {
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>个人中心</h2>
      </div>

      <Card>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ margin: 0 }}>{user?.nickname || user?.username || '用户'}</h3>
            <p style={{ color: '#999', marginTop: '4px' }}>用户名: {user?.username}</p>
          </div>
        </div>

        <Tabs defaultActiveKey="info" type="card">
          <TabPane tab="个人信息" key="info">
            <Form
              form={infoForm}
              layout="vertical"
              onFinish={handleInfoSubmit}
              style={{ maxWidth: '500px', margin: '0 auto' }}
            >
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" maxLength={50} />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" maxLength={100} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" maxLength={11} />
              </Form.Item>

              <Form.Item
                name="gender"
                label="性别"
              >
                <Select placeholder="请选择性别" allowClear>
                  <Select.Option value="0">保密</Select.Option>
                  <Select.Option value="1">男</Select.Option>
                  <Select.Option value="2">女</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Button type="primary" size="large" htmlType="submit" loading={infoLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="修改密码" key="password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
              style={{ maxWidth: '500px', margin: '0 auto' }}
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