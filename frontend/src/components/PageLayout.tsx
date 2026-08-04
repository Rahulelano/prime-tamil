import { ReactNode } from 'react';
import AdDisplay from './AdDisplay';

interface PageLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
  fullWidth?: boolean;
  page?: string;
}

export default function PageLayout({ children, sidebarContent, fullWidth = false, page = 'all' }: PageLayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className={`${fullWidth ? 'w-full' : 'w-full lg:w-2/3'}`}>
            {children}
          </div>

          {/* Sidebar - Only show if not fullWidth */}
          {!fullWidth && (
            <div className="w-full lg:w-1/3 space-y-6">
              {/* If custom sidebar content is provided, use it */}
              {sidebarContent ? (
                sidebarContent
              ) : (
                // Default sidebar content
                <>
                  {/* Ad Space */}
                  <AdDisplay position="sidebar-top" page={page} size="300x250" className="bg-white p-4 rounded-lg shadow" />

                  {/* Advertisement Section */}
                  <AdDisplay position="sidebar-middle" page={page} size="300x250" className="bg-white p-4 rounded-lg shadow" />

                  {/* More Ad Space */}
                  <AdDisplay position="sidebar-bottom" page={page} size="300x600" className="bg-white p-4 rounded-lg shadow" />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
