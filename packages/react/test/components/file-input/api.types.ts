import { FileInput, type FileInputProps } from '@vyrnforge/react/file-input';
const props: FileInputProps = { accept: 'image/*', multiple: true, name: 'files' };
const control: typeof FileInput = FileInput;
void [props, control];
