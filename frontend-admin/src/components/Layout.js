import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, theme, message } from 'antd';
import { 
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  TagOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: '1',
      icon: <SettingOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: '2',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">用户管理</Link>,
    },
    {
      key: '/admins',
      icon: <TeamOutlined />,
      label: <Link to="/admins">管理员管理</Link>,
    },
    {
      key: '/categories',
      icon: <TagOutlined />,
      label: <Link to="/categories">分类管理</Link>,
    },
    {
      key: 'content',
      icon: <FileTextOutlined />,
      label: '内容管理',
      children: [
        {
          key: '/news',
          label: <Link to="/news">新闻管理</Link>,
        },
        {
          key: '/notices',
          label: <Link to="/notices">公告管理</Link>,
        },
        {
          key: '/banners',
          label: <Link to="/banners">轮播图管理</Link>,
        },
      ],
    },
    {
      key: '/activities',
      icon: <CalendarOutlined />,
      label: <Link to="/activities">活动管理</Link>,
    },
    {
      key: '/applies',
      icon: <FileTextOutlined />,
      label: <Link to="/applies">报名审核</Link>,
    },
    {
      key: '/forums',
      icon: <MessageOutlined />,
      label: <Link to="/forums">论坛管理</Link>,
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: <Link to="/messages">留言管理</Link>,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    for (const item of menuItems) {
      if (item.key === path) return item.key;
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) return child.key;
        }
      }
    }
    return '/';
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) return [item.key];
        }
      }
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        className="admin-sider"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? '16px' : '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? '公益' : '爱心公益管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="logo">
            {!collapsed && '爱心公益服务系统管理后台'}
          </div>
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
              <span style={{ color: '#fff' }}>{admin?.username}</span>
              <DownOutlined style={{ marginLeft: '8px', fontSize: '12px' }} />
            </div>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          {children}
        </Content>
        <Footer className="admin-footer">
          爱心公益服务系统 ©2024 Created with React & Ant Design
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;