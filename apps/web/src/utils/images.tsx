import {
  ComponentPropsWithoutRef,
  Dispatch,
  forwardRef,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaImage, FaUpload } from 'react-icons/fa6';
import {
  ActionIcon,
  ActionIconProps,
  CloseButtonProps,
  CloseIcon,
  FileButton,
  FileButtonProps,
  Group,
  Input,
  Stack,
  Tooltip,
} from '@mantine/core';
import { useMutation } from '@tanstack/react-query';

function Preview({ src }: ComponentPropsWithoutRef<'img'>) {
  return (
    <div className='border-default-border dark:bg-dark-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-md border'>
      {src ? <img className='h-full w-full object-cover' src={src} /> : <FaImage size='3.2rem' />}
    </div>
  );
}

const SelectButton = forwardRef<HTMLButtonElement, Omit<FileButtonProps, 'children'>>(
  (props, ref) => {
    return (
      <FileButton accept='image/*' {...props}>
        {(props) => (
          <Tooltip label='Select' withArrow position='right'>
            <ActionIcon
              {...props}
              ref={ref}
              size='md'
              radius='md'
              variant='default'
              className='text-blue-filled'
            >
              <FaUpload size='0.8rem' />
            </ActionIcon>
          </Tooltip>
        )}
      </FileButton>
    );
  },
);

function ClearButton(
  props: ActionIconProps & Omit<ComponentPropsWithoutRef<'button'>, keyof CloseButtonProps>,
) {
  return (
    <Tooltip label='Clear' withArrow position='right'>
      <ActionIcon
        {...props}
        color='red'
        size='md'
        radius='md'
        variant='default'
        className='text-red-7'
      >
        <CloseIcon size='1rem' />
      </ActionIcon>
    </Tooltip>
  );
}

type WrapperProps = {
  label?: string;
  withAsterisk?: boolean;
  preview: ReactNode;
  select: ReactNode;
  clear: ReactNode;
  error?: string;
};

function Wrapper({ label, withAsterisk, clear, preview, select, error }: WrapperProps) {
  return (
    <Input.Wrapper withAsterisk={withAsterisk} className='space-y-1'>
      {label && <Input.Label required={withAsterisk}>{label}</Input.Label>}

      <Group>
        {preview}
        <Stack gap='xs'>
          {select}
          {clear}
        </Stack>
      </Group>
      <Input.Error>{error}</Input.Error>
    </Input.Wrapper>
  );
}

export const ImageUpload = {
  Preview,
  SelectButton,
  ClearButton,
  Wrapper,
};

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
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
  return `${import.meta.env.VITE_API_URL}/api/images/${name}`;
}

export function isImageCached(src: string) {
  var image = new Image();
  image.src = src;

  return image.complete;
}

type Api = {
  props: UseImageUploadProps;
  file: File | null;
  isError: boolean;
  isLoading: boolean;
  upload: VoidFunction;
  failureCount: number;
  revokeUrl: VoidFunction;
  previewUrl: string | undefined;
  resetRef: MutableRefObject<VoidFunction>;
  setFile: Dispatch<SetStateAction<File | null>>;
  clearImage: VoidFunction;
  imageName: string | null;
  setImageName: Dispatch<SetStateAction<string>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
};

type UseImageUploadProps = {
  required?: boolean;
  initialValue?: string | null;
};

export function useImageUpload(props: UseImageUploadProps = {}) {
  const { initialValue = '', required = false } = props;

  const [cleared, setCleared] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState(initialValue ?? '');
  const [error, setError] = useState('');
  const uploadRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (initialValue) {
      setImageName(initialValue);
    }
  }, [initialValue]);

  const resetRef = useRef<VoidFunction>(() => {});

  const { mutateAsync, isError, isLoading, failureCount } = useMutation(uploadImage);

  const remoteUrl = imageName ? getImageUrl(imageName) : undefined;

  const localUrl = useMemo(
    () => (file && file.type.startsWith('image') ? URL.createObjectURL(file) : undefined),
    [file],
  );

  const previewUrl = cleared ? '' : localUrl || remoteUrl;

  async function upload() {
    if (file && file.type.startsWith('image')) {
      const name = await mutateAsync(file);
      return name;
    }
    return imageName;
  }

  function validate() {
    if (file) {
      if (file.type.startsWith('image')) {
        return true;
      } else {
        uploadRef.current?.focus();
        setError('File format is not supported');
        return false;
      }
    } else if (required) {
      uploadRef.current?.focus();
      setError('Please select a image');
      return false;
    }
    return true;
  }

  function revokeUrl() {
    if (localUrl) URL.revokeObjectURL(localUrl);
  }

  function clearImage() {
    setFile(null);
    setCleared(true);
    resetRef.current?.();
    setImageName('');
  }

  useEffect(() => {
    if (file) {
      setCleared(false);
    }

    return () => {
      revokeUrl();
    };
  }, [file]);

  const Preview = useMemo(
    () => () => {
      const { previewUrl, revokeUrl } = (Preview as any).api as Api;

      return <ImageUpload.Preview src={previewUrl} onLoad={revokeUrl} />;
    },
    [],
  );

  const ClearButton = useMemo(
    () => () => {
      const { clearImage, setError } = (ClearButton as any).api as Api;
      return (
        <ImageUpload.ClearButton
          onClick={() => {
            clearImage();
            setError('');
          }}
        />
      );
    },
    [],
  );

  const SelectButton = useMemo(
    () => () => {
      const { resetRef, setFile, error, setError } = (SelectButton as any).api as Api;
      return (
        <ImageUpload.SelectButton
          ref={uploadRef}
          resetRef={resetRef}
          onChange={(file) => {
            if (file) {
              if (file.type.startsWith('image')) {
                setFile(file);
                if (error) {
                  setError('');
                }
              } else {
                setError('File format not supported');
              }
            }
          }}
        />
      );
    },
    [],
  );

  const api: Api = {
    file,
    error,
    setFile,
    clearImage,
    upload,
    isError,
    resetRef,
    isLoading,
    revokeUrl,
    previewUrl,
    failureCount,
    imageName,
    props,
    setImageName,
    setError,
  };

  (Preview as any).api = api;
  (ClearButton as any).api = api;
  (SelectButton as any).api = api;

  return {
    ...api,
    upload,
    validate,
    Preview,
    ClearButton,
    SelectButton,
    isDirty: file !== null,
  };
}
