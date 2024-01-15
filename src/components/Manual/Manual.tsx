import { useParams } from 'react-router-dom';
import ManualBase from './ManualBase';

export default function Manual() {
  const { index } = useParams();

  if (index === 'start') {
    return (
      <ManualBase
        imageSource='/manual/1_search.png'
        buttonText='次へ進む'
        jumpTo='/manual/search_engine'
      />
    );
  }

  if (index === 'search_engine') {
    return (
      <ManualBase
        imageSource='/manual/2_search_engine.png'
        buttonText='次へ進む'
        jumpTo='/manual/preferences'
      />
    );
  }

  if (index === 'preferences') {
    return (
      <ManualBase
        imageSource='/manual/3_preferences.png'
        buttonText='はじめる'
        jumpTo='/'
      />
    );
  }

  return '[PAGE_NOT_FOUND]';
}
