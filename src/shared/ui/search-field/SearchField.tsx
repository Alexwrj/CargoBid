import { forwardRef } from 'react';

import { TextField, type TextFieldProps } from '../text-field/TextField';

export type SearchFieldProps = Omit<TextFieldProps, 'type'>;

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(props, ref) {
    return (
      <TextField
        ref={ref}
        startAdornment={
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" />
            <path
              d="m10.5 10.5 3 3"
              stroke="currentColor"
              strokeLinecap="round"
            />
          </svg>
        }
        type="search"
        {...props}
      />
    );
  },
);
