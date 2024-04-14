import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok || response.status >= 400) {
    const error = await response.json();
    throw new Error(error);
  }

  const data = await response.json();

  return data;
}

export function getImageUrl(name: string) {
  return `/api/images/${name}`;
}

export function isImageCached(src: string) {
  var image = new Image();
  image.src = src;

  return image.complete;
}

type UseImageUploadProps = {
  initialValues: (string | null)[];
  required?: (index: number) => boolean;
};

function getInitialState(initialValues: (string | null)[]) {
  return {
    files: initialValues.map(() => null),
    imageNames: initialValues.map((value) => value || ''),
    errors: initialValues.map(() => ''),
    cleared: initialValues.map(() => false),
    uploadRef: initialValues.map(() => null),
  };
}

export function useImageUpload({ initialValues, required }: UseImageUploadProps) {
  const initialState = getInitialState(initialValues);

  const [cleared, setCleared] = useState(initialState.cleared);
  const [files, setFiles] = useState<(File | null)[]>(initialState.files);
  const [imageNames, setImageNames] = useState(initialState.imageNames);
  const [errors, setErrors] = useState(initialState.errors);
  const uploadRef = useRef<(HTMLButtonElement | null)[]>(initialState.uploadRef);

  useEffect(() => {
    if (initialValues) {
      const state = getInitialState(initialValues);
      setCleared(state.cleared);
      setFiles(state.files);
      setImageNames(state.imageNames);
      setErrors(state.errors);
    }
  }, [JSON.stringify(initialValues)]);

  const resetRefs = useRef<(VoidFunction | null)[]>([]);

  const { mutateAsync, isError, isPending } = useMutation({
    mutationFn: uploadImage,
  });

  function getImageProps(index: number) {
    let url: string | undefined = undefined;
    let revokeUrl: VoidFunction | undefined = undefined;

    if (cleared[index]) {
      url = undefined;
      revokeUrl = undefined;
    } else {
      const currentFile = files[index];
      if (currentFile) {
        const objectUrl = URL.createObjectURL(currentFile);
        url = objectUrl;
        revokeUrl = () => URL.revokeObjectURL(objectUrl);
      } else {
        const currentImage = imageNames[index];
        if (currentImage) {
          url = getImageUrl(currentImage);
          revokeUrl = undefined;
        }
      }
    }

    const setUploadRef = (ref: HTMLButtonElement | null) => {
      if (ref) uploadRef.current[index] = ref;
    };

    const _onChange = (file: File | null) => {
      if (file) {
        onChange(index, file);
      }
    };

    const _onClear = () => onClear(index);

    const _onDelete = () => deleteImage(index);

    return {
      url,
      revokeUrl,
      setUploadRef,
      onChange: _onChange,
      onClear: _onClear,
      onDelete: _onDelete,
    };
  }

  async function uploadAll() {
    const newImageNames: string[] = [];
    for (const [index, file] of files.entries()) {
      if (file && file.type.startsWith('image')) {
        const name = await mutateAsync(file);
        newImageNames[index] = name;
      } else {
        newImageNames[index] = imageNames[index];
      }
    }
    return newImageNames;
  }

  function validateAll() {
    for (const [index, file] of files.entries()) {
      if (!file) {
        const isRequired = required?.(index) ?? false;
        if (isRequired) {
          setErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = 'Please select a image';
            return newErrors;
          });
          uploadRef.current[index]?.focus?.();
          return false;
        }
      } else if (!file.type.startsWith('image')) {
        setErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = 'File format is not supported';
          return newErrors;
        });
        uploadRef.current[index]?.focus?.();
        return false;
      }
    }
    return true;
  }

  function onClear(index: number) {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles[index] = null;
      return newFiles;
    });
    setCleared((prev) => {
      const newCleared = [...prev];
      newCleared[index] = true;
      return newCleared;
    });
    setImageNames((prev) => {
      const newImageNames = [...prev];
      newImageNames[index] = '';
      return newImageNames;
    });
    setErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = '';
      return newErrors;
    });
    resetRefs.current[index]?.();
  }

  function onChange(index: number, file: File | null) {
    if (!file || file.type.startsWith('image')) {
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file;
        return newFiles;
      });
      setCleared((prev) => {
        const newCleared = [...prev];
        newCleared[index] = false;
        return newCleared;
      });
      if (errors[index]) {
        setErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = '';
          return newErrors;
        });
      }
    } else {
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = null;
        return newFiles;
      });
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = 'File format is not supported';
        return newErrors;
      });
    }
  }

  function deleteImage(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setImageNames((prev) => prev.filter((_, i) => i !== index));
    setCleared((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }

  function addImage(file: File | null = null) {
    setFiles((prev) => [...prev, file]);
    setImageNames((prev) => [...prev, '']);
    setCleared((prev) => [...prev, false]);
    setErrors((prev) => [...prev, '']);
  }

  const isDirty = true;

  return {
    files,
    imageNames,
    errors,
    isError,
    isPending,
    isDirty,
    getImageProps,
    uploadAll,
    validateAll,
    clearImage: onClear,
    deleteImage,
    addImage,
    onChange,
    cleared,
  };
}
