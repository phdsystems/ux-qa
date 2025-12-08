import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 mb-2 inline-block">
          &larr; Back to Dashboard
        </Link>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">UX.QA</p>
        <h1 className="text-3xl font-semibold">Tools</h1>
        <p className="text-slate-400 text-sm mt-2">
          Download and use these tools to enhance your Playwright testing workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Tool Card */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">@ux.qa/scanner</h2>
              <p className="text-slate-400 text-sm">UI Scanner & Test Generator</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm">
            Scan your React/Vue projects to analyze test coverage, detect interactive elements,
            and auto-generate Playwright test scaffolds.
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-200">Features:</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                Component coverage analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                data-testid suggestions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                Test scaffold generation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                JSON/CLI reporting
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-700 space-y-3">
            <h3 className="text-sm font-medium text-slate-200">Installation:</h3>
            <div className="bg-slate-900 rounded p-3 font-mono text-sm">
              <code className="text-green-400">npm install -D @ux.qa/scanner</code>
            </div>

            <h3 className="text-sm font-medium text-slate-200 pt-2">Usage:</h3>
            <div className="bg-slate-900 rounded p-3 font-mono text-sm space-y-2">
              <div>
                <span className="text-slate-500"># Scan project</span>
                <br />
                <code className="text-cyan-400">npx uxqa-scanner scan --root ./src</code>
              </div>
              <div>
                <span className="text-slate-500"># Generate tests</span>
                <br />
                <code className="text-cyan-400">npx uxqa-scanner generate --write</code>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/phdsystems/ux-qa/tree/main/packages/scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            >
              View on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@ux.qa/scanner"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
              View on npm
            </a>
          </div>
        </div>

        {/* Reporter Tool Card */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Custom Reporter</h2>
              <p className="text-slate-400 text-sm">Publish Results to Hub</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm">
            A custom Playwright reporter that publishes test run results to your
            UX.QA dashboard for centralized monitoring.
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-200">Features:</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                Automatic result publishing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                Git commit tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                CI/local environment detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">&#10003;</span>
                API key authentication
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-700 space-y-3">
            <h3 className="text-sm font-medium text-slate-200">Configuration:</h3>
            <div className="bg-slate-900 rounded p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-slate-300">{`// playwright.config.ts
reporter: [
  ['html'],
  ['./reporter.ts', {
    hubUrl: 'http://localhost:3000',
    appId: 'my-app',
    suite: 'e2e',
  }]
]`}</pre>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="/help"
              className="flex-1 text-center py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* CLI Reference */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Scanner CLI Reference</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="py-2 pr-4 text-slate-400 font-medium">Command</th>
                <th className="py-2 pr-4 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-cyan-400">uxqa-scanner scan</td>
                <td className="py-2">Analyze project and show coverage report</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-cyan-400">uxqa-scanner generate</td>
                <td className="py-2">Generate test scaffolds for untested components</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-cyan-400">uxqa-scanner init</td>
                <td className="py-2">Create configuration file</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium mt-6 mb-3">Options</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="py-2 pr-4 text-slate-400 font-medium">Option</th>
                <th className="py-2 pr-4 text-slate-400 font-medium">Default</th>
                <th className="py-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-yellow-400">--root, -r</td>
                <td className="py-2 pr-4 text-slate-500">./src</td>
                <td className="py-2">Root directory to scan</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-yellow-400">--out, -o</td>
                <td className="py-2 pr-4 text-slate-500">./tests/e2e</td>
                <td className="py-2">Output directory for tests</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-yellow-400">--framework, -f</td>
                <td className="py-2 pr-4 text-slate-500">auto</td>
                <td className="py-2">Framework: react, vue, html, auto</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-yellow-400">--write, -w</td>
                <td className="py-2 pr-4 text-slate-500">false</td>
                <td className="py-2">Write generated tests to files</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-2 pr-4 font-mono text-yellow-400">--json</td>
                <td className="py-2 pr-4 text-slate-500">false</td>
                <td className="py-2">Output JSON report</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
