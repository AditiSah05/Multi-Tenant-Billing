import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const DEFAULT_BRANDS = [
  'Dell',
  'HP',
  'Logitech',
  'Zebronics',
  'Canon',
  'LG',
  'SanDisk',
  'boAt',
  'Innova',
  'Patanjali',
  'jpi',
  'Samsung',
  'Apple',
  'Sony',
  'Lenovo',
  'Asus',
];

const BrandSelectInput = ({
  value = '',
  onChange,
  brandsList = [],
  label = 'BRAND',
  placeholder = 'Enter brand name',
  required = false,
  className = '',
}) => {
  const toast = useToast();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  // Keep inputValue synced with value prop when value prop changes from outside
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Persistent stored custom brands
  const [customBrands, setCustomBrands] = useState(() => {
    try {
      const saved = localStorage.getItem('softfyr_custom_brands');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Combine default, passed props, and custom added brands (unique)
  const allBrands = Array.from(
    new Set(
      [...DEFAULT_BRANDS, ...brandsList, ...customBrands]
        .map((b) => (typeof b === 'string' ? b.trim() : ''))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  // If input matches selected value or is empty, show all brands; otherwise filter
  const isSelectedValue = inputValue.trim().toLowerCase() === (value || '').trim().toLowerCase();
  const filteredBrands = (!inputValue.trim() || isSelectedValue)
    ? allBrands
    : allBrands.filter((b) => b.toLowerCase().includes(inputValue.trim().toLowerCase()));

  const isExactMatch = allBrands.some(
    (b) => b.toLowerCase() === inputValue.trim().toLowerCase()
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
      onChange({ target: { name: 'brand', value: val } });
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    triggerChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectBrand = (brandName) => {
    setInputValue(brandName);
    triggerChange(brandName);
    setIsOpen(false);
  };

  const handleAddNewBrand = (brandNameToAdd) => {
    const trimmed = (brandNameToAdd || inputValue).trim();
    if (!trimmed) {
      if (toast) toast.error('Please type a brand name first.');
      return;
    }

    const exists = allBrands.some((b) => b.toLowerCase() === trimmed.toLowerCase());

    if (!exists) {
      const updated = [...customBrands, trimmed];
      setCustomBrands(updated);
      try {
        localStorage.setItem('softfyr_custom_brands', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save brand to localStorage', err);
      }
      if (toast) {
        toast.success(`Brand "${trimmed}" added and selected!`);
      }
    } else {
      if (toast) {
        toast.success(`Brand "${trimmed}" selected!`);
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
        handleAddNewBrand(inputValue.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Clean Label */}
      <div className="flex items-center justify-between mb-1">
        <label className="block uppercase text-[11px] font-extrabold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {inputValue.trim() && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleAddNewBrand();
            }}
            onClick={() => handleAddNewBrand()}
            className="text-[11px] text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
            title="Add or select typed brand"
          >
            <Plus size={13} className="text-indigo-600" />
            <span>Add Brand</span>
          </button>
        )}
      </div>

      {/* Input box with simple + and arrow buttons */}
      <div className="relative">
        <input
          type="text"
          name="brand"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
          required={required}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleAddNewBrand();
            }}
            onClick={() => handleAddNewBrand()}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Add brand (+)"
          >
            <Plus size={16} />
          </button>
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
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clean Light Scrollable Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn p-1.5 space-y-1">
          {/* Scrollable list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((b) => {
                const isSelected = (value || '').toLowerCase() === b.toLowerCase();
                return (
                  <button
                    key={b}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectBrand(b);
                    }}
                    onClick={() => handleSelectBrand(b)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{b}</span>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 italic">
                No matching brands found
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
                  handleAddNewBrand(inputValue);
                }}
                onClick={() => handleAddNewBrand(inputValue)}
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

export default BrandSelectInput;
