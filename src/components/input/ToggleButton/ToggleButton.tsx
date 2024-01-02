import './ToggleButton.css';

export type ToggleButtonProps = {
  enabled: boolean,
  onClick?: () => void,
};

export default function ToggleButton(props: ToggleButtonProps) {
  return (
    <div
      className={`toggle-button ${props.enabled ? '' : 'toggle-button-disabled'}`}
      onClick={props.onClick}
    >
      <div className='toggle-button-circle' />
    </div>
  );
}
