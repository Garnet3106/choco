import { useNavigate } from 'react-router-dom';
import Button from '../input/Button/Button';
import './ManualBase.css';

export type ManualBaseProps = {
  imageSource: string,
  buttonText: string,
  jumpTo: string,
};

export default function ManualBase(props: ManualBaseProps) {
  const navigate = useNavigate();

  return (
    <div className='manual'>
      <img src={props.imageSource} className='manual-image' />
      <Button
        text={props.buttonText}
        className='manual-button'
        onClick={() => navigate(props.jumpTo)}
      />
    </div>
  );
}
