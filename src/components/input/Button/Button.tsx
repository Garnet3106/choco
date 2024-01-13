import { CSSProperties } from 'react';
import './Button.css';

export type ButtonProps = {
  text: string,
  className?: string,
  style?: CSSProperties,
  onClick?: () => void,
};

export default function Button(props: ButtonProps) {
  return (
    <div
      className={`button ${props.className ?? ''}`}
      style={props.style}
      onClick={props.onClick}
    >
      {props.text}
    </div>
  );
}
