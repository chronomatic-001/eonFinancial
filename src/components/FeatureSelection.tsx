import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Feature } from '../types';

interface FeatureSelectionProps {
  title: string;
  features: Feature[];
  selectedFeatures: number[];
  onFeatureClick: (id: number) => void;
}

const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  title,
  features,
  selectedFeatures,
  onFeatureClick,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
          {title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const isSelected = selectedFeatures.includes(feature.id);
          
          return (
            <button
              key={feature.id}
              onClick={() => onFeatureClick(feature.id)}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02]
                ${isSelected 
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-600/10' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
              `}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-display">
                {feature.name}
              </h3>
              {isSelected && (
                <CheckCircle2 className="absolute top-4 right-4 h-6 w-6 text-primary-600" />
              )}
            </button>
          );
        })}
      </div>

      {selectedFeatures.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFeatures.length} pain{selectedFeatures.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default FeatureSelection;