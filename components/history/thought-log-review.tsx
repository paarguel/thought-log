"use client";

import type { ThoughtLogEntry } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";
import { exportEntryAsText, printEntryWorksheet } from "@/lib/local-store/export";

type ThoughtLogReviewProps = {
  entry: ThoughtLogEntry;
  onClose: () => void;
};

export function ThoughtLogReview({ entry, onClose }: ThoughtLogReviewProps) {
  return (
    <section className="worksheet-review section-gap" aria-label="Saved worksheet review">
      <div className="split-row">
        <div>
          <p className="step-kicker">Review</p>
          <h2 className="review-title">{entry.title}</h2>
          <p className="muted">{new Date(entry.createdAt).toLocaleString()}</p>
        </div>
        <button className="text-button" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="review-block">
        <h3>Situation</h3>
        <p>{entry.situation || "No situation entered."}</p>
      </div>

      <div className="review-block">
        <h3>Feeling</h3>
        <p>{entry.feelings.join(", ") || "No feelings selected."}</p>
      </div>

      <div className="review-block">
        <h3>Thought passage</h3>
        <p>{entry.thoughtText || "No thought passage entered."}</p>
      </div>

      <div className="review-block">
        <h3>Marked thoughts and labels</h3>
        {entry.extractedThoughts.length === 0 && <p className="muted">No thoughts marked yet.</p>}
        <div className="review-thought-list">
          {entry.extractedThoughts.map((thought, index) => {
            const labels = entry.labelAssignments.find((assignment) => assignment.thoughtId === thought.id)?.distortionIds ?? [];

            return (
              <article className="review-thought" key={thought.id}>
                <span className="thought-number">{index + 1}</span>
                <div>
                  <strong>{thought.text}</strong>
                  <div className="pattern-list">
                    {labels.length === 0 && <span className="muted">Unlabeled</span>}
                    {labels.map((id) => {
                      const distortion = getDistortion(id);
                      return (
                        <span className="pattern-pill" key={id} title={distortion?.definition}>
                          {distortion?.shortLabel ?? id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="review-block">
        <h3>Realistic / rational thought</h3>
        <p>
          {entry.rationalThought ||
            ((entry.rationalResponses?.length ?? 0) > 0 ? "See one-by-one responses below." : "No rational thought entered.")}
        </p>
        {(entry.rationalResponses?.length ?? 0) > 0 && (
          <div className="review-thought-list">
            {entry.extractedThoughts.map((thought, index) => {
              const response = entry.rationalResponses?.find((item) => item.thoughtId === thought.id)?.text;
              if (!response) {
                return null;
              }

              return (
                <article className="review-thought" key={`response-${thought.id}`}>
                  <span className="thought-number">{index + 1}</span>
                  <div>
                    <strong>{thought.text}</strong>
                    <p>{response}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="action-row">
        <button className="secondary-button" type="button" onClick={() => printEntryWorksheet(entry)}>
          Print worksheet / save PDF
        </button>
        <button className="secondary-button" type="button" onClick={() => exportEntryAsText(entry)}>
          Download readable copy
        </button>
      </div>
    </section>
  );
}
