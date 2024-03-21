'use client'
import Markdown from '@/components/layout/markdown'

export default function Home() {
    const mdContent = `
# Hello 👋
`
    return (
        <main>
            <Markdown className="markdown">{mdContent}</Markdown>
        </main>
    )
}
