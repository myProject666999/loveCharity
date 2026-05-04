import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Spin, 
  message, 
  Popconfirm,
  Modal,
  Form,
  Input,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const Admins = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/list', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setAdmins(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      message.error('获取管理员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/api/admin/create', {
        username: values.username,
        password: values.password,
      });
      if (res.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchAdmins();
      } else {
        message.error(res.msg || '创建失败');
      }
    } catch (error) {
      message.error(error.response?.data?.msg || '创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/api/admin/status/${id}`, {
        status: newStatus
      });
      if (res.code === 200) {
        message.success(`已${newStatus === 1 ? '启用' : '禁用'}该管理员`);
        fetchAdmins();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title={`确定要${record.status === 1 ? '禁用' : '启用'}该管理员吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small"
              danger={record.status === 1}
            >
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">管理员管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>
            新增管理员
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchAdmins}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (p) => setPage(p),
          }}
        />
      </Card>

      <Modal
        title="新增管理员"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={450}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3位' }
            ]}
          >
            <Input placeholder="请输入用户名" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={creating}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;