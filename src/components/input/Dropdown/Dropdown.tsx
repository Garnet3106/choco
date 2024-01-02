import { ChangeEvent } from 'react';
import './Dropdown.css';

export type DropdownItem = {
  id: string,
  text: string,
};

export type DropdownProps = {
  selected: string,
  items: DropdownItem[],
  onChange?: (id: string) => void,
};

export default function Dropdown(props: DropdownProps) {
  const selectedItem = props.items.find((v) => v.id === props.selected);

  if (!selectedItem) {
    return;
  }

  const options = props.items.map((eachItem) => (
    <option value={eachItem.id} key={eachItem.id}>
      {eachItem.text}
    </option>
  ));

  return (
    <select className='dropdown' value={selectedItem.id} onChange={onChange}>
      {options}
    </select>
  );

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  }
}
