import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { FormDevtoolsPlugin } from '@tanstack/react-form-devtools'

export default function Devtools() {
  return (
    <>
      <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js"></script>
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
