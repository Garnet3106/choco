import './TextInput.css';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

export type TextInputProps = {
  inputProps?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
};

export default function TextInput(props: TextInputProps) {
  return (
    <input
      type='text'
      {...props.inputProps}
      className={`text-input ${props.inputProps?.className ?? ''}`}
    />
  );
}
