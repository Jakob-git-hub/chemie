import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      placeholder,
      value = '',
      onChange,
      onSubmit,
      suggestions,
      onSuggestionSelect,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSubmit && value) {
        e.preventDefault();
        onSubmit(value);
        setShowSuggestions(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
      setShowSuggestions(suggestions ? suggestions.length > 0 : false);
    };

    const handleSuggestionClick = (suggestion: string) => {
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
      inputRef.current?.blur();
    };

    const filteredSuggestions = React.useMemo(() => {
      if (!suggestions || !value) return [];
      const lowerValue = value.toLowerCase();
      return suggestions.filter(s => s.toLowerCase().includes(lowerValue));
    }, [suggestions, value]);

    return (
      <div className="relative w-full">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }
              inputRef.current = node;
            }}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(suggestions ? filteredSuggestions.length > 0 : false)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className={cn('pl-9', className)}
            disabled={disabled}
            aria-label={props['aria-label'] || placeholder}
            role="searchbox"
            {...(props as Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onKeyDown' | 'onFocus' | 'onBlur' | 'placeholder' | 'className' | 'disabled' | 'aria-label' | 'ref' | 'type'>)}
          />
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border bg-background shadow-lg"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm hover:bg-muted"
                role="option"
                aria-selected={false}
              >
                <Search className="mr-2 h-3 w-3 text-muted-foreground" aria-hidden="true" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';

export default SearchBar;
