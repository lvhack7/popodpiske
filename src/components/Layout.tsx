import React from 'react';
import { Layout} from 'antd';
import { Outlet } from 'react-router-dom';


const MainLayout: React.FC = () => {
  return (
    <Layout 
      className='main-layout'
    >
      <Outlet />
    </Layout>
  );
};

export default MainLayout;