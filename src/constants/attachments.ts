export interface SupportedFileTypeOption {
  id: 'pdf' | 'image' | 'doc';
  label: string;
  sublabel: string;
  accept: string;
  extensions: string[];
}

export const BACKEND_SUPPORTED_FILE_TYPES: SupportedFileTypeOption[] = [
  {
    id: 'pdf',
    label: 'PDF Document',
    sublabel: '.pdf',
    accept: 'application/pdf,.pdf',
    extensions: ['pdf'],
  },
  {
    id: 'image',
    label: 'Image',
    sublabel: '.jpg, .jpeg, .png, .webp, .gif, .bmp',
    accept: 'image/jpeg,image/png,image/webp,image/gif,image/bmp,.jpg,.jpeg,.png,.webp,.gif,.bmp',
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'],
  },
  {
    id: 'doc',
    label: 'Document (DOC / DOCX)',
    sublabel: '.docx, .doc, .txt, .md, .rtf, .csv',
    accept:
      '.docx,.doc,.txt,.md,.rtf,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown,application/rtf,text/csv',
    extensions: ['docx', 'doc', 'txt', 'md', 'rtf', 'csv'],
  },
];
