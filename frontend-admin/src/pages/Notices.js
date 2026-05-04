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
  Switch,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  ReloadOutlined,
  PushpinOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Notices = () => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentNotice, setCurrentNotice] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/notices', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setNotices(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
      message.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/notice', {
        ...values,
        status: values.status ? 1 : 0,
        is_top: values.is_top ? 1 : 0
      });
      if (res.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchNotices();
      } else {
        message.error(res.msg || '创建失败');
      }
    } catch (error) {
      message.error('创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentNotice(record);
    editForm.setFieldsValue({
      title: record.title,
      content: record.content || '',
      status: record.status === 1,
      is_top: record.is_top === 1,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/admin/notice/${currentNotice.id}`, {
        ...values,
        status: values.status ? 1 : 0,
        is_top: values.is_top ? 1 : 0
      });
      if (res.code === 200) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchNotices();
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/api/admin/notice/status/${id}`, {
        status: newStatus
      });
      if (res.code === 200) {
        message.success(`已${newStatus === 1 ? '发布' : '下架'}该公告`);
        fetchNotices();
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 250,
      render: (text, record) => (
        <Space>
          {record.is_top === 1 && <PushpinOutlined style={{ color: '#f5222d' }} />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '是否置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      width: 100,
      render: (isTop) => (
        <Tag color={isTop === 1 ? 'red' : 'default'}>
          {isTop === 1 ? '置顶' : '普通'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '已发布' : '已下架'}
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定要${record.status === 1 ? '下架' : '发布'}该公告吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small"
              danger={record.status === 1}
            >
              {record.status === 1 ? '下架' : '发布'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">公告管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>
            新增公告
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchNotices}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={notices}
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
        title="新增公告"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ status: true, is_top: false }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入公告标题" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea placeholder="请输入公告内容" rows={8} maxLength={5000} />
          </Form.Item>

          <Form.Item
            name="is_top"
            label="是否置顶"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="发布" unCheckedChildren="下架" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setCreateModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑公告"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入公告标题" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea placeholder="请输入公告内容" rows={8} maxLength={5000} />
          </Form.Item>

          <Form.Item
            name="is_top"
            label="是否置顶"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="发布" unCheckedChildren="下架" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setEditModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notices;