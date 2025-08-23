import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="font-sans antialiased text-gray-900 bg-white min-h-screen">
      {children}
    </div>
  );
};

export default Layout;