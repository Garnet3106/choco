import { CSSProperties } from 'react';
import './Button.css';

export type ButtonProps = {
  text: string,
  style?: CSSProperties,
  onClick?: () => void,
};

export default function Button(props: ButtonProps) {
  return (
    <div
      className='button'
      style={props.style}
      onClick={props.onClick}
    >
      {props.text}
    </div>
  );
}
