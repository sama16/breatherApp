import React, { useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { useGateway } from '../api/GatewayContext';
import { useAuth } from '../auth/AuthContext';
import { USE_FIXTURES } from '../config';
import { createSubmitGuard } from '../decisions/submitGuard';
import {
  fmtDate,
  LOCAL_APPROVAL_LABEL,
  type DecisionAction,
  type DecisionRequest,
  type Proposal,
} from '../domain/c1';
import { FAILURE_MESSAGES, isAuthFailure } from '../domain/failures';
import { colors, radii, spacing } from '../theme/branding';
import { AppText } from './AppText';
import { Button } from './Button';

export interface Notice {
  tone: 'info' | 'warning';
  text: string;
}

interface Props {
  proposal: Proposal;
  onNotice: (n: Notice) => void;
  /** Reload the lists (called after a saved decision or a stale conflict). */
  onChanged: () => void;
}

const newRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function confirmLines(a: DecisionAction, p: Proposal): { title: string; lines: string[]; confirmLabel: string } {
  switch (a) {
    case 'accept':
      return {
        title: 'Accept this suggestion?',
        lines: [
          `Move "${p.title}" from ${fmtDate(p.currentDate)} to ${fmtDate(p.proposedDate)}.`,
          `This is saved as: ${LOCAL_APPROVAL_LABEL}.`,
          'The official date in Canvas does not change.',
        ],
        confirmLabel: 'Confirm: approve locally',
      };
    case 'reject':
      return {
        title: 'Reject this suggestion?',
        lines: [`Keep "${p.title}" on ${fmtDate(p.currentDate)}.`, 'Nothing else changes.'],
        confirmLabel: 'Confirm: reject',
      };
    case 'lock':
      return {
        title: 'Lock this date?',
        lines: [`Lock "${p.title}" on ${fmtDate(p.currentDate)}.`, 'Breather will not suggest moving it.'],
        confirmLabel: 'Confirm: lock date',
      };
  }
}

/**
 * Accept / Reject / Lock with a confirmation step.
 * - The request carries the immutable proposal id + revision and the expected assessment version.
 * - Duplicate taps are ignored while a request is in flight (UI guard only; the backend decides atomically).
 * - Success is reported ONLY when the gateway returns ok. Any failure says "Not saved" and shows the reason.
 */
export function DecisionPanel({ proposal, onNotice, onChanged }: Props) {
  const gateway = useGateway();
  const { signOut } = useAuth();
  const guard = useRef(createSubmitGuard()).current;
  const [pending, setPending] = useState<DecisionAction | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (proposal.status !== 'pending') return null;

  const confirm = async () => {
    if (!pending) return;
    const action = pending;
    const req: DecisionRequest = {
      proposalId: proposal.id,
      proposalRevision: proposal.revision,
      expectedVersion: proposal.assessmentVersion,
      action,
      clientRequestId: newRequestId(),
    };
    const res = await guard.run(async () => {
      setSubmitting(true);
      try {
        return await gateway.submitDecision(req);
      } finally {
        setSubmitting(false);
      }
    });
    if (!res.ran) return; // duplicate tap, ignored
    setPending(null);
    const out = res.value;

    if (out.ok) {
      const base =
        action === 'accept'
          ? `${LOCAL_APPROVAL_LABEL}. The official date in Canvas is unchanged.`
          : action === 'reject'
            ? 'Suggestion rejected.'
            : 'Date locked. Breather will not suggest moving it.';
      onNotice({
        tone: 'info',
        text: USE_FIXTURES ? `${base} (Fixture mode only: nothing was sent to the backend.)` : base,
      });
      onChanged();
      return;
    }
    if (isAuthFailure(out.kind)) {
      void signOut(FAILURE_MESSAGES[out.kind]);
      return;
    }
    onNotice({ tone: 'warning', text: `Not saved. ${FAILURE_MESSAGES[out.kind]}` });
    if (out.kind === 'stale') onChanged(); // show the latest state
  };

  const cancel = () => {
    if (!submitting) setPending(null);
  };
  const info = pending ? confirmLines(pending, proposal) : null;

  return (
    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
      <Button label="Accept" onPress={() => setPending('accept')} disabled={submitting} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button label="Reject" variant="outlined" onPress={() => setPending('reject')} disabled={submitting} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Lock date" variant="outlined" onPress={() => setPending('lock')} disabled={submitting} />
        </View>
      </View>

      <Modal visible={pending !== null} transparent animationType="fade" onRequestClose={cancel}>
        <View
          accessibilityViewIsModal
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg }}
        >
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
            {info && (
              <>
                <AppText variant="title" accessibilityRole="header">
                  {info.title}
                </AppText>
                {info.lines.map((l) => (
                  <AppText key={l}>{l}</AppText>
                ))}
                {USE_FIXTURES && (
                  <AppText variant="caption" color={colors.crunchMedium}>
                    Fixture mode: this will not be sent to a backend.
                  </AppText>
                )}
                <Button label={info.confirmLabel} onPress={() => void confirm()} loading={submitting} />
                <Button label="Cancel" variant="outlined" onPress={cancel} disabled={submitting} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
