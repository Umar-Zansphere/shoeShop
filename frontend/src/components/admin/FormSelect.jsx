'use client';

import CustomDropdown from './CustomDropdown';

export default function FormSelect({
  label,
  error,
  options = [],
  required = false,
  searchable = false,
  ...props
}) {
  return (
    <CustomDropdown
      label={label}
      error={error}
      options={options}
      required={required}
      searchable={searchable}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      disabled={props.disabled}
      className={props.className}
    />
  );
}
