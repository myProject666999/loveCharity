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
  Space,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  ReloadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const Banners = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, [page]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/banners', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setBanners(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      message.error('获取轮播图列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/banner', {
        ...values,
        status: values.status ? 1 : 0
      });
      if (res.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchBanners();
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
    setCurrentBanner(record);
    editForm.setFieldsValue({
      title: record.title || '',
      image: record.image,
      link: record.link || '',
      sort: record.sort || 0,
      status: record.status === 1,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/admin/banner/${currentBanner.id}`, {
        ...values,
        status: values.status ? 1 : 0
      });
      if (res.code === 200) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchBanners();
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
      const res = await api.put(`/api/admin/banner/status/${id}`, {
        status: newStatus
      });
      if (res.code === 200) {
        message.success(`已${newStatus === 1 ? '启用' : '禁用'}该轮播图`);
        fetchBanners();
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
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (image) => (
        image ? (
          <Image
            width={80}
            height={50}
            src={image}
            style={{ objectFit: 'cover' }}
            fallback="https://picsum.photos/80/50"
          />
        ) : (
          <Tag color="default">无图片</Tag>
        )
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
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
            title={`确定要${record.status === 1 ? '禁用' : '启用'}该轮播图吗？`}
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
        <h2 className="page-title">轮播图管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>
            新增轮播图
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchBanners}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={banners}
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
        title="新增轮播图"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ status: true, sort: 0 }}
        >
          <Form.Item
            name="title"
            label="标题"
          >
            <Input placeholder="请输入标题（可选）" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="image"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="请输入图片URL" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="link"
            label="跳转链接"
          >
            <Input placeholder="请输入跳转链接（可选）" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
          >
            <Input.Number style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
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
        title="编辑轮播图"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
          >
            <Input placeholder="请输入标题（可选）" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="image"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="请输入图片URL" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="link"
            label="跳转链接"
          >
            <Input placeholder="请输入跳转链接（可选）" maxLength={255} />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
          >
            <Input.Number style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
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

export default Banners;