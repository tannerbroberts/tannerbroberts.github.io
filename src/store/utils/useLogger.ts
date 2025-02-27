import { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';
export default function useLogger<T>(name: string, values?: T ) {
  if (!name) throw new Error('No name provided to useLogger');
  if (typeof name !== 'string') throw new Error('Name must be a string');

  // Log green text of the name
  console.log(`%c${name}`, 'color: green; font-weight: bold;');
  
  const refs = useRef(values);
  useEffect(() => {
    for(const key in values) {
      if (refs.current[key] !== values[key]) {
        console.log(`%c${key}`, 'color: blue; font-weight: bold;', isEqual(refs.current[key], values[key]) ? 'same' : 'changed', values[key]);
        refs.current[key] = values[key];
      }
    }
  }, [values]);
}
// Usage:
// useLogger('App', { items, focusedItemId });