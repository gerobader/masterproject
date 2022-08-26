import React from 'react';

import './FileUpload.scss';

const FileUpload = ({
  id, labelText, onFileLoaded, fileName, setFileName
}) => {
  /**
   * creates a file reader, that ready the uploaded file as text
   * @param e - the change event
   */
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
};

export default FileUpload;
