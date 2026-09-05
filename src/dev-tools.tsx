import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

export default function Devtools() {
  return (
    <>
      <TanStackDevtools
        plugins={[
          formDevtoolsPlugin(),
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
