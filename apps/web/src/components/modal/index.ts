import ModalContent from './modal-content';
import ModalFooter from './modal-footer';
import ModalForm from './modal-form';
import ModalHeader from './modal-header';
import ModalRoot from './modal-root';
import ModalWrapper from './modal-wrapper';

export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Footer: ModalFooter,
  Content: ModalContent,
  Form: ModalForm,
  Wrapper: ModalWrapper,
};

export { default as ModalContent } from './modal-content';
export { default as ModalFooter } from './modal-footer';
export { default as ModalForm } from './modal-form';
export { default as ModalHeader } from './modal-header';
export { default as ModalRoot, type ModalRootProps, type ModalCommonProps } from './modal-root';
export {
  default as ModalWrapper,
  type ModalWrapperProps,
  type GenerateModalWrapperProps,
} from './modal-wrapper';
