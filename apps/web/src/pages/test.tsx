'use client';

import { Box } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';

export function GettingStartedExample() {
  return (
    <DataTable
      withTableBorder
      borderRadius='sm'
      withColumnBorders
      highlightOnHover
      // fetching
      loaderSize='sm'
      loaderType='bars'
      classNames={{
        header: 'bg-[#ccc]',
      }}
      height='calc(100vh - 500px)'
      // provide data
      className='m-10'
      records={[
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        { id: 1, name: 'Joe Biden', bornIn: 1942, party: 'Democratic' },
        // more records...
      ]}
      // define columns
      columns={[
        {
          accessor: 'id',
          // this column has a custom title
          title: '#',
          // right-align column
          textAlign: 'right',
        },
        { accessor: 'name' },
        {
          accessor: 'party',
          // this column has custom cell data rendering
          render: ({ party }) => (
            <Box fw={700} c={party === 'Democratic' ? 'blue' : 'red'}>
              {party.slice(0, 3).toUpperCase()}
            </Box>
          ),
        },
        { accessor: 'bornIn' },
      ]}
      // execute this callback when a row is clicked
      onRowClick={({ record: { name, party, bornIn } }) =>
        showNotification({
          title: `Clicked on ${name}`,
          message: `You clicked on ${name}, a ${party.toLowerCase()} president born in ${bornIn}`,
          withBorder: true,
        })
      }
    />
  );
}
