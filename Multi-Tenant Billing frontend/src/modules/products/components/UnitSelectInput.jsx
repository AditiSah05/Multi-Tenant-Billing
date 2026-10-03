import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const DEFAULT_UNITS = [
  'Nos',
  'Pcs',
  'Kg',
  'Ltr',
  'Box',
  'Pack',
  'Meter',
  'Set',
  'Gm',
  'Ml',
  'Ream',
  'Dozen',
  'Pair',
  'Bag',
  'Carton',
  'SqFt',
  'CuFt',
];

const UnitSelectInput = ({
  value,
  onChange,
  unitsList = [],
  label = 'UNIT',
  placeholder = 'Select or enter unit',
  required = true,
  className = '',
}) => {
  const toast = useToast();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? 'Nos');

  // Keep inputValue synced with value prop when value prop changes from outside
  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  // Persistent stored custom units
  const [customUnits, setCustomUnits] = useState(() => {
    try {
      const saved = localStorage.getItem('softfyr_custom_units');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Combine default, passed props, and custom added units (unique)
  const allUnits = Array.from(
    new Set(
      [...DEFAULT_UNITS, ...unitsList, ...customUnits]
        .map((u) => (typeof u === 'string' ? u.trim() : ''))
        .filter(Boolean)
    )
  );

  // If input matches selected value or is empty, show all units; otherwise filter
  const isSelectedValue = inputValue.trim().toLowerCase() === (value ?? '').trim().toLowerCase();
  const filteredUnits = (!inputValue.trim() || isSelectedValue)
    ? allUnits
    : allUnits.filter((u) => u.toLowerCase().includes(inputValue.trim().toLowerCase()));

  const isExactMatch = allUnits.some(
    (u) => u.toLowerCase() === inputValue.trim().toLowerCase()
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerChange = (val) => {
    if (onChange) {
      onChange({ target: { name: 'unit', value: val } });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    triggerChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectUnit = (unitName) => {
    setInputValue(unitName);
    triggerChange(unitName);
    setIsOpen(false);
  };

  const handleAddNewUnit = (unitNameToAdd) => {
    const trimmed = (unitNameToAdd || inputValue).trim();
    if (!trimmed) {
      if (toast) toast.error('Please type a unit name.');
      return;
    }

    const exists = allUnits.some((u) => u.toLowerCase() === trimmed.toLowerCase());

    if (!exists) {
      const updated = [...customUnits, trimmed];
      setCustomUnits(updated);
      try {
        localStorage.setItem('softfyr_custom_units', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save unit to localStorage', err);
      }
      if (toast) {
        toast.success(`Unit "${trimmed}" added and selected!`);
      }
    } else {
      if (toast) {
        toast.success(`Unit "${trimmed}" selected!`);
      }
    }

    setInputValue(trimmed);
    triggerChange(trimmed);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddNewUnit(inputValue.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <label className="block uppercase text-[11px] font-extrabold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {inputValue.trim() && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleAddNewUnit();
            }}
            onClick={() => handleAddNewUnit()}
            className="text-[11px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
            title="Add or select typed unit"
          >
            <Plus size={13} className="text-indigo-600" />
            <span>Add Unit</span>
          </button>
        )}
      </div>

      {/* Select / Input field */}
      <div className="relative">
        <input
          type="text"
          name="unit"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm cursor-pointer"
          required={required}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }}
          onClick={(e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Styled Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn p-1.5 space-y-1">
          {/* Scrollable list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredUnits.length > 0 ? (
              filteredUnits.map((u) => {
                const isSelected = (value ?? '').toLowerCase() === u.toLowerCase();
                return (
                  <button
                    key={u}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectUnit(u);
                    }}
                    onClick={() => handleSelectUnit(u)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{u}</span>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 italic">
                No matching units found
              </div>
            )}
          </div>

          {/* Inline Add / Confirm Option */}
          {inputValue.trim() && (
            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAddNewUnit(inputValue);
                }}
                onClick={() => handleAddNewUnit(inputValue)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-extrabold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-100/70 transition-colors text-left cursor-pointer"
              >
                <Plus size={14} />
                <span>+ {isExactMatch ? 'Select' : 'Add'} "{inputValue.trim()}"</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitSelectInput;
