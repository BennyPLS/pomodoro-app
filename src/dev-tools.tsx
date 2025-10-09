import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { FormDevtoolsPlugin } from '@tanstack/react-form-devtools'

export default function Devtools() {
  return (
    <>
      <TanStackDevtools
        plugins={[
          FormDevtoolsPlugin(),
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
