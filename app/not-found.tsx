import Link from 'next/link'
import Markdown from '@/components/layout/markdown'

export default function NotFound() {
    const mdContent = `
# Page Not found 😔

Could not find requested resource
`
    return (
        <div>
            <Markdown className="markdown">{mdContent}</Markdown>
            <Link href="/">Return Home</Link>
        </div>
    )
}
