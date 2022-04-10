import React, {useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';
import {setBlockKeyboardInput} from '../../../../redux/settings/settings.actions';

import './TextInput.scss';

const TextInput = ({value, setValue, placeholder}) => {
  const dispatch = useDispatch();
  const inputRef = useRef();

  useEffect(() => {
    const clickFunction = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        inputRef.current.blur();
      }
    };
    window.addEventListener('click', clickFunction);
    return () => {
      window.removeEventListener('click', clickFunction);
    };
  }, [inputRef]);

  return (
    <input
      className="vis-text-input"
      type="text"
      value={value}
      ref={inputRef}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      onFocus={() => dispatch(setBlockKeyboardInput(true))}
      onBlur={() => dispatch(setBlockKeyboardInput(false))}
    />
  );
};

export default TextInput;
