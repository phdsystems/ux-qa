export type RunStatus = "passed" | "failed" | "unstable";

export interface TestRun {
  id: string;
  appId: string;
  suite: string;
  environment: string;
  status: RunStatus;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  coverage?: number;
  commit?: string;
  artifactUrl?: string;
  createdAt: string;
}

export interface CreateRunPayload {
  appId: string;
  suite: string;
  environment: string;
  status: RunStatus;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  coverage?: number;
  commit?: string;
  artifactUrl?: string;
}
