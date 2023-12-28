import ModalContent from './modal-content';
import ModalFooter from './modal-footer';
import ModalForm from './modal-form';
import ModalHeader from './modal-header';
import ModalRoot, { ModalRootProps } from './modal-root';

export type ModalFormProps = { onClose: VoidFunction };

function generateFormModal<TProps extends ModalFormProps = ModalFormProps>(
  Component: (props: TProps) => JSX.Element,
  defaultProps?: Pick<ModalRootProps, 'size' | 'fullScreen'>,
) {
  return ({ modalProps, ...rest }: Omit<TProps, 'onClose'> & { modalProps: ModalRootProps }) => (
    <ModalRoot {...defaultProps} {...modalProps}>
      <Component {...(rest as any)} onClose={modalProps.onClose} />
    </ModalRoot>
  );
}

export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Footer: ModalFooter,
  Content: ModalContent,
  Form: ModalForm,
  generateFormModal,
};

export { default as ModalContent } from './modal-content';
export { default as ModalFooter } from './modal-footer';
export { default as ModalForm } from './modal-form';
export { default as ModalHeader } from './modal-header';
export { default as ModalRoot, type ModalRootProps } from './modal-root';
