import React, { useState } from 'react';
import {
  CHANGE_WORD,
  compareWorkload,
  crunchWord,
  fmtDate,
  formatCount,
  formatExposure,
  proposalStatusLabel,
  type Proposal,
  type WorkloadWeek,
} from '../domain/c1';
import { colors, spacing } from '../theme/branding';
import { AppText } from './AppText';
import { Banner } from './Banner';
import { Button } from './Button';
import { Card } from './Card';
import { DecisionPanel, type Notice } from './DecisionPanel';
import { Table } from './Table';

const cell = (w: WorkloadWeek | null) => (w ? `${crunchWord(w.crunch)}, ${formatCount(w.assessmentCount)}` : 'No data');

/** One optimizer suggestion: explanation, same-input before/after table, and the decision buttons. */
export function ProposalCard({
  proposal: p,
  onNotice,
  onChanged,
}: {
  proposal: Proposal;
  onNotice: (n: Notice) => void;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const cmp = open ? compareWorkload(p.before, p.after) : null;

  return (
    <Card variant="outlined" style={{ gap: spacing.xs }}>
      <AppText variant="subtitle">
        {p.title} · {p.courseCode}
      </AppText>
      <AppText accessibilityLabel={`Current official date ${fmtDate(p.currentDate)}. Proposed date ${fmtDate(p.proposedDate)}.`}>
        {fmtDate(p.currentDate)} to {fmtDate(p.proposedDate)}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {p.explanation}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        Overlap reduction: {formatExposure(p.overlapReduction)}
      </AppText>
      <AppText variant="caption" color={colors.primarySoft}>
        {proposalStatusLabel(p.status)}
      </AppText>

      <Button
        label={open ? 'Hide comparison' : 'Compare before and after'}
        variant="outlined"
        onPress={() => setOpen((o) => !o)}
      />
      {cmp &&
        (cmp.comparable ? (
          <>
            <AppText variant="caption" color={colors.textMuted}>
              Same input: {cmp.inputVersion}
            </AppText>
            <Table
              columns={[
                { title: 'Week', flex: 1 },
                { title: 'Before', flex: 1.3 },
                { title: 'After', flex: 1.3 },
                { title: 'Change', flex: 1 },
              ]}
              rows={cmp.rows.map((r) => [fmtDate(r.weekStart), cell(r.before), cell(r.after), CHANGE_WORD[r.change]])}
            />
          </>
        ) : (
          <Banner tone="warning" text={cmp.reason} />
        ))}

      <DecisionPanel proposal={p} onNotice={onNotice} onChanged={onChanged} />
    </Card>
  );
}
