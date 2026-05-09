import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = ({ title, children }) => (
  <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0">
      <Topbar title={title} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);
