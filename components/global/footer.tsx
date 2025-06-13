import { Linkedin, Twitter, MessageSquareText } from "lucide-react" // Using MessageSquareText for Discord placeholder
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} clever llm. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              AI-powered financial guidance that helps you make smarter money decisions. Get personalized help on
              savings, investments, and debt management.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="https://linkedin.com/company/cleverllm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="cleverllm on LinkedIn"
            >
              <Linkedin className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link
              href="https://discord.gg/cleverllm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="cleverllm on Discord"
            >
              <MessageSquareText className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="https://x.com/cleverllm" target="_blank" rel="noopener noreferrer" aria-label="cleverllm on X">
              <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
