import React, {useState, forwardRef, useImperativeHandle} from 'react';

import './FileUpload.scss';

const FileUpload = forwardRef(({id, labelText, onFileLoaded}, ref) => {
  const [fileName, setFileName] = useState();

  useImperativeHandle(ref, () => ({
    reset() {
      setFileName(undefined);
    }
  }));

  const onFileUpload = (e) => {
    setFileName(e.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.onload = () => onFileLoaded(JSON.parse(fileReader.result));
    fileReader.readAsText(e.target.files[0]);
  };

  return (
    <div className="file-upload-wrapper">
      <label htmlFor={id}>{labelText}</label>
      <input id={id} type="file" onChange={onFileUpload} className="file-upload"/>
      <p className="file-name">{fileName || 'No file selected'}</p>
    </div>
  );
});

export default FileUpload;
