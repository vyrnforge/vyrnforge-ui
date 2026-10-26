import { FileUploaderDropzone, FileUploaderInput, FileUploaderList, FileUploaderRoot } from '@vyrnforge/react/file-uploader';
export function Example(){return <FileUploaderRoot><FileUploaderDropzone>Choose or drop a file</FileUploaderDropzone><FileUploaderInput aria-label="Choose files"/><FileUploaderList/></FileUploaderRoot>;}
