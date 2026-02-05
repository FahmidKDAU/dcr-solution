import Box from "@mui/material/Box";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export interface FileUploadProps {
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
}

const FileUpload = ({ maxFiles = 1, onFilesSelected }: FileUploadProps): React.ReactElement => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected],
  );

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles,
    onDrop,
  });

  const acceptedFile = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <Box>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{acceptedFile}</ul>
      </aside>
    </Box>
  );
};

export default FileUpload;
