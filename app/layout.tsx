import { Suspense, ReactNode } from 'react'
import Navbar from '@/components/layout/navbar'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </head>
            <body className="body">
                <Suspense>
                    <main>{children}</main>
                </Suspense>
            </body>
        </html>
    )
}
