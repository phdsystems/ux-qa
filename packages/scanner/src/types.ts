export interface ScannerConfig {
  /** Root directory to scan */
  rootDir: string;
  /** Output directory for generated tests */
  outDir: string;
  /** File patterns to include */
  include: string[];
  /** File patterns to exclude */
  exclude: string[];
  /** Framework to analyze (react, vue, html) */
  framework: 'react' | 'vue' | 'html' | 'auto';
  /** Generate data-testid suggestions */
  suggestTestIds: boolean;
  /** Existing test directory to check coverage */
  testDir?: string;
  /** Base URL for generated tests */
  baseUrl: string;
}

export interface ComponentInfo {
  /** File path relative to root */
  filePath: string;
  /** Component name */
  name: string;
  /** Detected framework */
  framework: 'react' | 'vue' | 'html';
  /** Interactive elements found */
  elements: ElementInfo[];
  /** Props that affect rendering */
  props: PropInfo[];
  /** Routes/paths this component handles */
  routes: string[];
  /** Whether component has existing tests */
  hasTests: boolean;
  /** Test file path if exists */
  testFilePath?: string;
}

export interface ElementInfo {
  /** Element type (button, input, link, form, etc.) */
  type: ElementType;
  /** Existing data-testid if present */
  testId?: string;
  /** Suggested data-testid if missing */
  suggestedTestId: string;
  /** Text content or label */
  label?: string;
  /** Line number in source */
  line: number;
  /** Associated event handlers */
  handlers: string[];
  /** For inputs: input type */
  inputType?: string;
  /** For links: href value */
  href?: string;
}

export type ElementType =
  | 'button'
  | 'link'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'form'
  | 'modal'
  | 'dropdown'
  | 'tab'
  | 'accordion'
  | 'other';

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface ScanResult {
  /** All components found */
  components: ComponentInfo[];
  /** Routes/pages detected */
  routes: RouteInfo[];
  /** Coverage statistics */
  coverage: CoverageStats;
  /** Warnings during scan */
  warnings: string[];
}

export interface RouteInfo {
  /** Route path */
  path: string;
  /** Component handling this route */
  component: string;
  /** Has existing tests */
  hasTests: boolean;
}

export interface CoverageStats {
  /** Total components */
  totalComponents: number;
  /** Components with tests */
  testedComponents: number;
  /** Total interactive elements */
  totalElements: number;
  /** Elements with data-testid */
  elementsWithTestId: number;
  /** Total routes */
  totalRoutes: number;
  /** Routes with tests */
  testedRoutes: number;
}

export interface GeneratedTest {
  /** Output file path */
  filePath: string;
  /** Test file content */
  content: string;
  /** Component being tested */
  componentName: string;
  /** Number of test cases generated */
  testCount: number;
}

export interface TestGeneratorOptions {
  /** Include visibility tests */
  includeVisibility: boolean;
  /** Include interaction tests */
  includeInteractions: boolean;
  /** Include navigation tests */
  includeNavigation: boolean;
  /** Include form submission tests */
  includeForms: boolean;
  /** Include accessibility checks */
  includeA11y: boolean;
  /** Add TODO comments for manual completion */
  addTodos: boolean;
}
