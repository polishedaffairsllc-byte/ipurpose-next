const assert = require('node:assert/strict');
const { test } = require('node:test');
const { harness, React, act, render } = require('./helpers/native-harness.cjs');

test('Compass compact, Home and signup headers use the approved mark at their reference sizes', async () => {
  const h = harness();
  h.native.Image = 'Image';
  h.native.ImageBackground = 'ImageBackground';
  const approvedLogo = 1;
  h.mocks['../../assets/release/adaptive-icon-foreground.png'] = approvedLogo;
  h.mocks['../../assets/brand/welcome-atmosphere.jpg'] = 2;
  h.mocks['expo-blur'] = { BlurView: 'BlurView' };
  h.mocks['expo-linear-gradient'] = { LinearGradient: 'LinearGradient' };
  h.mocks['expo-status-bar'] = { StatusBar: 'StatusBar' };

  const { BrandHeader } = h.load('components/BrandHeader.tsx');
  const { AuthScaffold } = h.load('components/AuthScaffold.tsx');
  const cases = [
    [React.createElement(BrandHeader), 72],
    [React.createElement(BrandHeader, { size: 'hero' }), 116],
    [React.createElement(AuthScaffold, { variant: 'signup', title: 'Create your account.', eyebrow: 'Begin' }), 186],
  ];
  for (const [screen, size] of cases) {
    const tree = await render(screen);
    const mark = tree.root.findByType('Image').props;
    assert.equal(mark.source, approvedLogo);
    assert.deepEqual(mark.style, { width: size, height: size });
    await act(async () => tree.unmount());
  }
});
