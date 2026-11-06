import React from 'react';
import { StyleSheet } from 'react-native';
import { act, create } from 'react-test-renderer';
import { Button, MIN_TOUCH_TARGET } from '../components/Button';
import { CrunchChip } from '../components/CrunchChip';
import { StateView } from '../components/StateView';

// react-test-renderer needs this flag in React 19 test environments.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function render(el: React.ReactElement) {
  let r!: ReturnType<typeof create>;
  act(() => {
    r = create(el);
  });
  return r;
}

describe('Button accessibility', () => {
  it('has button role, label, and a touch target of at least 48dp', () => {
    const r = render(<Button label="Log out" onPress={() => {}} />);
    const node = r.root.findByProps({ accessibilityRole: 'button' });
    expect(node.props.accessibilityLabel).toBe('Log out');
    const flat = StyleSheet.flatten(node.props.style({ pressed: false }));
    expect(flat.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
  it('reports disabled/busy state while loading', () => {
    const r = render(<Button label="Go" onPress={() => {}} loading />);
    const node = r.root.findByProps({ accessibilityRole: 'button' });
    expect(node.props.accessibilityState).toEqual({ disabled: true, busy: true });
  });
});

describe('CrunchChip', () => {
  it('carries a spoken label, not just a color', () => {
    const r = render(<CrunchChip level="high" />);
    expect(r.root.findByProps({ accessibilityLabel: 'High crunch' })).toBeTruthy();
  });
});

describe('StateView', () => {
  it('shows children only when ready', () => {
    const { Text } = require('react-native');
    const ready = render(
      <StateView state="ready" emptyText="none" onRetry={() => {}}>
        <Text>content</Text>
      </StateView>,
    );
    expect(JSON.stringify(ready.toJSON())).toContain('content');

    const empty = render(
      <StateView state="empty" emptyText="Nothing here" onRetry={() => {}}>
        <Text>content</Text>
      </StateView>,
    );
    expect(JSON.stringify(empty.toJSON())).toContain('Nothing here');
    expect(JSON.stringify(empty.toJSON())).not.toContain('content');
  });
  it('offers a retry on error', () => {
    const onRetry = jest.fn();
    const r = render(
      <StateView state="error" message="Boom" emptyText="" onRetry={onRetry}>
        {null}
      </StateView>,
    );
    act(() => r.root.findByProps({ accessibilityLabel: 'Try again' }).props.onPress());
    expect(onRetry).toHaveBeenCalled();
  });
});
