import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { useTheme } from "@mui/material/styles";

export interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  label?: string;
}

const FileUpload = ({
  maxFiles = 5,
  maxSize = 10485760, // 10MB default
  onFilesSelected,
  label = "UPLOAD DOCUMENT",
}: FileUploadProps): React.ReactElement => {
  const theme = useTheme();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles,
    maxSize,
    onDrop,
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${theme.palette.grey[400]}`,
          borderRadius: '2px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#F3F2F1' : '#FFFFFF',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: '#F3F2F1',
            '& .upload-icon': {
              color: theme.palette.primary.main,
            },
            '& .upload-text': {
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUploadOutlinedIcon
          className="upload-icon"
          sx={{
            fontSize: '48px',
            color: theme.palette.primary.main,
            marginBottom: '12px',
            transition: 'color 0.2s ease',
          }}
        />
        
        <Typography
          className="upload-text"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: theme.palette.primary.main,
            letterSpacing: '0.5px',
            marginBottom: '8px',
            transition: 'color 0.2s ease',
          }}
        >
          {label}
        </Typography>
        
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: theme.palette.text.secondary,
          }}
        >
          Only JPG, PNG, and PDF files are accepted & the maximum file size is{' '}
          {(maxSize / 1048576).toFixed(0)}MB.
        </Typography>
      </Box>

      {acceptedFiles.length > 0 && (
        <Box sx={{ marginTop: '16px' }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
              marginBottom: '8px',
            }}
          >
            Selected Files:
          </Typography>
          {acceptedFiles.map((file) => (
            <Box
              key={file.name}
              sx={{
                padding: '8px 12px',
                backgroundColor: '#F3F2F1',
                borderRadius: '2px',
                marginBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: theme.palette.text.primary,
                }}
              >
                {file.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                }}
              >
                {(file.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;