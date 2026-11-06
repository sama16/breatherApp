import React from 'react';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { brand, colors, spacing } from '../theme/branding';

const Item = ({ t, d }: { t: string; d: string }) => (
  <View accessible accessibilityLabel={`${t}. ${d}`} style={{ marginBottom: spacing.sm }}>
    <AppText variant="subtitle">{t}</AppText>
    <AppText variant="caption" color={colors.textSecondary}>
      {d}
    </AppText>
  </View>
);

/** What Breather does and does not do, plus an honest accessibility statement. */
export function AboutPanel() {
  return (
    <>
      <Card variant="highlighted">
        <AppText variant="title">{brand.name}</AppText>
        <AppText>{brand.tagline}</AppText>
      </Card>

      <SectionHeader title="How it works" />
      <Card>
        <Item t="1. Import" d="Assessment dates come from Canvas and syllabi into the Breather backend." />
        <Item t="2. Analyze" d="The backend finds weeks where many assessments overlap (crunch)." />
        <Item t="3. Suggest" d="Professors see suggested date moves and decide. Students see their own official dates." />
      </Card>

      <SectionHeader title="Privacy and safety" />
      <Card variant="outlined">
        <Item t="Canvas is never changed" d="Approving a suggestion is saved as 'Approved locally; not published'. Official dates stay as in Canvas." />
        <Item t="No Canvas password here" d="You sign in through the browser. This app only keeps a temporary Breather session token in the phone's secure storage." />
        <Item t="Your role comes from the server" d="The app never trusts a role stored on the phone. The server checks every request." />
        <Item t="Small groups are hidden" d="If too few students are in a result, it is hidden to protect privacy." />
      </Card>

      <SectionHeader title="Accessibility" />
      <Card>
        <Item t="What is built in" d="Labels for screen readers, 48dp tap targets, text that follows system font size, and charts always repeated as words and a table." />
        <Item t="What is not yet proven" d="Real TalkBack and large-text checks must be recorded on a device. Static checks do not prove accessibility." />
      </Card>
    </>
  );
}
