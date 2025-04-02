'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { sparkSavings } from '@/data/constants';

interface SparkSelectionProps {
  onSelectionChange?: (selections: number[]) => void;
  maxSelections?: number;
  showUpdateButton?: boolean;
  className?: string;
}

const SparkSelection: React.FC<SparkSelectionProps> = ({
  onSelectionChange,
  maxSelections = 2,
  showUpdateButton = true,
  className = '',
}) => {
  const { user } = useAuth();
  const [selectedSparks, setSelectedSparks] = useState<number[]>([]);
  const [tempSelections, setTempSelections] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUserSelections = async () => {
      if (!user) {
        const savedSelections = localStorage.getItem('visitorSelections');
        const selections = savedSelections ? JSON.parse(savedSelections) : [];
        setSelectedSparks(selections);
        setTempSelections(selections);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_selections')
          .select('selections')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        const selections = data?.selections || [];
        setSelectedSparks(selections);
        setTempSelections(selections);
      } catch (error) {
        console.error('Error fetching user selections:', error);
      }
    };

    fetchUserSelections();
  }, [user]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const showSuccess = () => {
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleSparkSelection = (sparkId: number) => {
    let newSelections: number[];

    if (tempSelections.includes(sparkId)) {
      newSelections = tempSelections.filter((id) => id !== sparkId);
    } else {
      if (tempSelections.length >= maxSelections) {
        showError(`You can only select up to ${maxSelections} sparks`);
        return;
      }
      newSelections = [...tempSelections, sparkId];
    }

    setTempSelections(newSelections);

    if (!user) {
      localStorage.setItem('visitorSelections', JSON.stringify(newSelections));
      setSelectedSparks(newSelections);
    }

    if (onSelectionChange) {
      onSelectionChange(newSelections);
    }
  };

  const handleUpdateSparks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('user_selections').upsert(
        {
          user_id: user.id,
          selections: tempSelections,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) throw error;

      setSelectedSparks(tempSelections);
      showSuccess();
    } catch (error) {
      console.error('Error updating selections:', error);
      showError('Failed to update selections');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>Spark selections updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sparkSavings.map((spark) => {
          const isSelected = tempSelections.includes(spark.id);

          return (
            <button
              key={spark.id}
              onClick={() => handleSparkSelection(spark.id)}
              className={`
                relative p-6 sm:p-8 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.01] group
                min-h-[160px] sm:min-h-[200px] flex flex-col
                ${
                  isSelected
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'border-gray-200 bg-white/10 hover:border-gray-300'
                }
              `}
            >
              <div className="relative flex-1">
                <div className="transition-all duration-300 group-hover:opacity-0">
                  <h3
                    className={`text-lg sm:text-xl font-semibold font-display pr-6 mb-2 ${
                      isSelected ? 'text-white' : 'text-white'
                    }`}
                  >
                    {spark.name}
                  </h3>
                </div>
                <div
                  className={`
                  absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg p-4
                  overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                  ${isSelected ? 'bg-primary-600 text-white' : 'bg-white/15 '}
                `}
                >
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isSelected ? 'text-white' : 'text-white'
                    }`}
                  >
                    {spark.description}
                  </p>
                </div>
              </div>
              {isSelected && (
                <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </button>
          );
        })}
      </div>

      {showUpdateButton && user && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpdateSparks}
            disabled={loading}
            className={`
              bg-primary-600 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-bold 
              hover:bg-primary-700 transition-all duration-300 font-display group hover:scale-105 
              shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 flex items-center space-x-3 
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
            ) : (
              <span>Update Sparks</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SparkSelection;
