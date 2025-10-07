import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

export default function Devtools() {
  return (
    <>
      <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
      <TanStackDevtools
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
