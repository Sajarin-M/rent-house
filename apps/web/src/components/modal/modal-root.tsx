import { Modal as MModal, ModalProps as MModalProps, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { cn } from '@/utils/fns';

type ModalPropNames =
  | 'classNames'
  | 'withCloseButton'
  | 'padding'
  | 'title'
  | 'transitionProps'
  | 'overlayProps';

export type ModalRootProps = Omit<MModalProps, ModalPropNames>;

export type ModalCommonProps = { onClose: VoidFunction };

const fullScreenOnlyProps: Pick<MModalProps, 'transitionProps' | 'overlayProps'> = {
  transitionProps: {
    duration: 80,
    transition: {
      in: { opacity: 1, transform: 'scale(1)' },
      out: { opacity: 0, transform: 'scale(0.989)' },
      common: { transformOrigin: '392px 380.8px' },
      transitionProperty: 'opacity transform',
    },
    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  overlayProps: {
    backgroundOpacity: 0.2,
  },
};

export default function ModalRoot({ fullScreen, ...props }: ModalRootProps) {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const isFullScreen = isSmallScreen || fullScreen;

  const fullHeightModalProps: Pick<MModalProps, ModalPropNames> = {
    padding: 0,
    withCloseButton: false,
    title: undefined,
    ...(isFullScreen ? fullScreenOnlyProps : undefined),
    classNames: {
      body: 'flex grow flex-col',
      content: cn('flex max-h-full', { 'rounded-none': isFullScreen }),
    },
  } as const;

  return <MModal fullScreen={isFullScreen} {...props} {...fullHeightModalProps} />;
}
