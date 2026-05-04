import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, message } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  HeartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Footer } = Layout;

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/');
  };

  const getUserMenuItems = () => {
    const items = [
      {
        key: '1',
        icon: <UserOutlined />,
        label: <Link to="/profile">个人中心</Link>,
      },
      {
        key: '2',
        icon: <HeartOutlined />,
        label: <Link to="/favorites">我的收藏</Link>,
      },
      {
        key: '3',
        icon: <CalendarOutlined />,
        label: <Link to="/my-applies">我的报名</Link>,
      },
      {
        key: '4',
        icon: <BellOutlined />,
        label: <Link to="/messages">我的留言</Link>,
      },
      {
        key: 'divider',
        type: 'divider',
      },
      {
        key: '5',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ];
    return items;
  };

  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/news',
      icon: <FileTextOutlined />,
      label: <Link to="/news">新闻资讯</Link>,
    },
    {
      key: '/activities',
      icon: <CalendarOutlined />,
      label: <Link to="/activities">志愿服务</Link>,
    },
    {
      key: '/forums',
      icon: <TeamOutlined />,
      label: <Link to="/forums">论坛交流</Link>,
    },
    {
      key: '/notices',
      icon: <BellOutlined />,
      label: <Link to="/notices">公告资讯</Link>,
    },
  ];

  const selectedKey = navItems.find(item => 
    item.key === location.pathname || location.pathname.startsWith(item.key + '/')
  )?.key || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          marginRight: '24px'
        }}>
          <HeartOutlined style={{ marginRight: '8px' }} />
          爱心公益服务系统
        </div>
        
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems}
          style={{ 
            flex: 1, 
            minWidth: 0,
            borderBottom: 'none'
          }}
        />

        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <Dropdown 
              menu={{ items: getUserMenuItems() }} 
              placement="bottomRight"
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span>{user.nickname || user.username}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button type="link" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div className="site-layout-content">
          {children}
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        爱心公益服务系统 ©2024 Created with React & Ant Design
      </Footer>
    </Layout>
  );
};

export default AppLayout;
