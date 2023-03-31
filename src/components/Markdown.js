import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

export const Markdown = ({ markdown }) => (
    <ReactMarkdown
        children={markdown}
        remarkPlugins={[remarkGfm]}
    />
)

export const MarkdownMath = ({ markdown }) => (
    <ReactMarkdown
        children={markdown}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
    />
)

