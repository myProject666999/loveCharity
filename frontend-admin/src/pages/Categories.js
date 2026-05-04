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
  Select,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/categories', {
        params: {
          page,
          page_size: pageSize
        }
      });
      if (res.code === 200) {
        setCategories(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/admin/category', values);
      if (res.code === 200) {
        message.success('创建成功');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchCategories();
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
    setCurrentCategory(record);
    editForm.setFieldsValue({
      name: record.name,
      type: record.type,
      description: record.description || '',
      sort: record.sort,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await api.put(`/api/admin/category/${currentCategory.id}`, values);
      if (res.code === 200) {
        message.success('更新成功');
        setEditModalVisible(false);
        fetchCategories();
      } else {
        message.error(res.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/api/admin/category/${id}`);
      if (res.code === 200) {
        message.success('删除成功');
        fetchCategories();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'news': return '新闻';
      case 'activity': return '活动';
      case 'forum': return '论坛';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'news': return 'blue';
      case 'activity': return 'green';
      case 'forum': return 'orange';
      default: return 'default';
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
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {getTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
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
      width: 160,
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
            title="确定要删除该分类吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">分类管理</h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>
            新增分类
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories}>
            刷新
          </Button>
        </Space>
      </div>

      <Card className="table-container">
        <Table
          columns={columns}
          dataSource={categories}
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
        title="新增分类"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="type"
            label="分类类型"
            rules={[{ required: true, message: '请选择分类类型' }]}
          >
            <Select placeholder="请选择分类类型">
              <Option value="news">新闻</Option>
              <Option value="activity">活动</Option>
              <Option value="forum">论坛</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
            initialValue={0}
          >
            <Input.Number style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea placeholder="请输入分类描述（可选）" rows={3} maxLength={200} />
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
        title="编辑分类"
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
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="type"
            label="分类类型"
            rules={[{ required: true, message: '请选择分类类型' }]}
          >
            <Select placeholder="请选择分类类型">
              <Option value="news">新闻</Option>
              <Option value="activity">活动</Option>
              <Option value="forum">论坛</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序"
          >
            <Input.Number style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea placeholder="请输入分类描述（可选）" rows={3} maxLength={200} />
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

export default Categories;