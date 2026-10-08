import React from 'react';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.icon && (
                  <tab.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                )}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-6">
        {tabs.find((t) => t.key === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;
