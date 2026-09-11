import { quizQuestions } from '../content/courses';
import type { QuizStreamId } from '../content/types';

export const STREAM_IDS: QuizStreamId[] = ['science', 'management', 'humanities'];

export const STREAM_NAMES: Record<QuizStreamId, string> = {
  science: 'Science',
  management: 'Management',
  humanities: 'Humanities',
};

export type Reason = { questionId: string; prompt: string; answer: string; weight: number };

export type RankedStream = {
  streamId: QuizStreamId;
  score: number;
  /** Proportional bar width, 0–100, relative to the leading stream. */
  share: number;
  reasons: Reason[];
};

export type QuizResult = {
  ranked: RankedStream[];
  answered: number;
  total: number;
  complete: boolean;
};

/**
 * Weighted scoring with full attribution. The result screen has to be able to
 * say which answers pushed each stream up, otherwise it is a verdict rather
 * than guidance. Answers are held in component state and never transmitted.
 */
export function scoreQuiz(answers: Record<string, string>): QuizResult {
  const totals: Record<QuizStreamId, number> = { science: 0, management: 0, humanities: 0 };
  const why: Record<QuizStreamId, Reason[]> = { science: [], management: [], humanities: [] };

  for (const [qid, oid] of Object.entries(answers)) {
    const q = quizQuestions.find((x) => x.id === qid);
    const o = q?.options.find((x) => x.id === oid);
    if (!q || !o) continue;
    for (const sid of STREAM_IDS) {
      const w = o.weights[sid] ?? 0;
      totals[sid] += w;
      if (w > 0) why[sid].push({ questionId: qid, prompt: q.prompt, answer: o.label, weight: w });
    }
  }

  const max = Math.max(...STREAM_IDS.map((sid) => totals[sid]));
  const denom = max > 0 ? max : 1;

  const ranked = STREAM_IDS.map((sid) => ({
    streamId: sid,
    score: totals[sid],
    share: Math.round((totals[sid] / denom) * 100),
    reasons: why[sid].slice().sort((a, b) => b.weight - a.weight),
  })).sort((a, b) => b.score - a.score || a.streamId.localeCompare(b.streamId));

  const answered = Object.keys(answers).filter((qid) =>
    quizQuestions.some((q) => q.id === qid && q.options.some((o) => o.id === answers[qid])),
  ).length;

  return { ranked, answered, total: quizQuestions.length, complete: answered === quizQuestions.length };
}
