import { create } from "zustand";

interface useImageDropzoneProps {
  files: File[];
  addFiles: (newFiles: File[]) => void;
  removeFiles: (file: File) => void;
}

const useImageDropzone = create<useImageDropzoneProps>((set, get) => ({
  files: [],
  addFiles: (newFiles: File[]) => {
    set((state) => ({
      ...state,
      files: [...state.files, ...newFiles],
    }));
  },
  removeFiles: (file: File) => {
    set((state) => ({
      ...state,
      files: state.files.filter((f) => f.name !== file.name),
    }));
  },
}));

export default useImageDropzone;
