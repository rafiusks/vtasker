import React from 'react'
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'

export type Option = {
  value: string
  label: string
}

interface SelectProps {
  id?: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: Option[]
  badge?: number
  multiple?: boolean
  size?: number
  className?: string
  isIconOnly?: boolean
}

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  badge,
  multiple = false,
  size = 4,
  className = '',
  isIconOnly = false,
}: SelectProps) {
  if (isIconOnly) {
    return (
      <button
        onClick={() => onChange([value[0] === 'asc' ? 'desc' : 'asc'])}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <ChevronUpDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${
            value[0] === 'asc' ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <Listbox
      as="div"
      className={`relative ${className}`}
      value={value}
      onChange={onChange}
      multiple={multiple}
    >
      <div className="flex items-center gap-1">
        <Listbox.Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="ml-1 text-xs text-blue-600 font-medium">({badge})</span>
          )}
        </Listbox.Label>
        <div className="relative flex-1">
          <Listbox.Button className="w-full cursor-default rounded-md bg-white py-1 pl-2.5 pr-7 text-left text-sm border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <span className="block truncate">
              {value.length === 0
                ? 'Select...'
                : value.length === 1
                ? options.find(opt => opt.value === value[0])?.label
                : `${value.length} selected`}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5">
              <ChevronUpDownIcon
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }: { active: boolean }) =>
                  `relative cursor-default select-none py-1 pl-7 pr-2 ${
                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  }`
                }
                value={option.value}
              >
                {({ selected, active }: { selected: boolean; active: boolean }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                          active ? 'text-blue-600' : 'text-blue-600'
                        }`}
                      >
                        <svg 
                          className="h-3.5 w-3.5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                          aria-hidden="true"
                          role="img"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </div>
    </Listbox>
  )
} 