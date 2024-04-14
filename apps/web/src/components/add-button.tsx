import { TbCirclePlus } from 'react-icons/tb';
import { Button, ButtonProps, createPolymorphicComponent } from '@mantine/core';

type Props = Omit<ButtonProps, 'leftSection'>;

function _AddButton(rest: Props) {
  return <Button radius='sm' leftSection={<TbCirclePlus size='1.4rem' />} {...rest} />;
}

const AddButton = createPolymorphicComponent<'button', Props>(_AddButton);

export default AddButton;
