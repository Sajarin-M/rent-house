import ModalRoot, { ModalRootProps } from './modal-root';

export type ModalWrapperProps<TProps> = Omit<TProps, 'onClose'> &
  Partial<Pick<ModalRootProps, 'size' | 'fullScreen'>> & {
    component: (props: TProps) => JSX.Element;
    modalProps: ModalRootProps;
  };

export type GenerateModalWrapperProps<TProps> = Omit<ModalWrapperProps<TProps>, 'component'>;

export default function ModalWrapper<TProps>({
  component: Component,
  modalProps,
  fullScreen,
  size,
  ...rest
}: ModalWrapperProps<TProps>) {
  return (
    <ModalRoot size={size} fullScreen={fullScreen} {...modalProps}>
      <Component {...(rest as any)} onClose={modalProps.onClose} />
    </ModalRoot>
  );
}
