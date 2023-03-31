import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export const Highlighter = ({ children, language }) => {
    if (!language) {
        language = 'javascript'
    }
    return (
        <SyntaxHighlighter style={dark} language={language}>
            {children}
        </SyntaxHighlighter>
    )
}