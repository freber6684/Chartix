import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

export interface ReviewComment {
  id: string;
  author: string;
  body: string;
  target?: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface ConfigDifference {
  path: string;
  before: unknown;
  after: unknown;
}

export type ReviewStatus = 'draft' | 'changes-requested' | 'approved';

function compare(before: unknown, after: unknown, path: string, output: ConfigDifference[]): void {
  if (Object.is(before, after)) return;
  if (
    before &&
    after &&
    typeof before === 'object' &&
    typeof after === 'object' &&
    Array.isArray(before) === Array.isArray(after)
  ) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach((key) =>
      compare(
        (before as Record<string, unknown>)[key],
        (after as Record<string, unknown>)[key],
        `${path}/${key}`,
        output,
      ),
    );
    return;
  }
  output.push({
    path: path || '/',
    before: structuredClone(before),
    after: structuredClone(after),
  });
}

/** Produce a deterministic path-based comparison between two chart versions. */
export function compareChartVersions(before: ChartConfig, after: ChartConfig): ConfigDifference[] {
  const output: ConfigDifference[] = [];
  compare(normalizeConfig(before), normalizeConfig(after), '', output);
  return output.sort((left, right) => left.path.localeCompare(right.path));
}

/** Create an independent configuration suitable for a fork/remix workflow. */
export function forkChart(config: ChartConfig): ChartConfig {
  return normalizeConfig(config);
}

/** Local review state that can later be synchronized by any application backend. */
export class ChartReview {
  private readonly comments = new Map<string, ReviewComment>();
  private status: ReviewStatus = 'draft';

  public addComment(author: string, body: string, target?: string): ReviewComment {
    const comment: ReviewComment = {
      id: crypto.randomUUID(),
      author,
      body,
      ...(target ? { target } : {}),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return structuredClone(comment);
  }

  public resolveComment(id: string): boolean {
    const comment = this.comments.get(id);
    if (!comment) return false;
    comment.status = 'resolved';
    return true;
  }

  public listComments(status?: ReviewComment['status']): ReviewComment[] {
    return [...this.comments.values()]
      .filter((comment) => !status || comment.status === status)
      .map((comment) => structuredClone(comment));
  }

  public setStatus(status: ReviewStatus): void {
    this.status = status;
  }

  public getStatus(): ReviewStatus {
    return this.status;
  }
}
