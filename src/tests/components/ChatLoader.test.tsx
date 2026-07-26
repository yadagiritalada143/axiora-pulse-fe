import { render } from '@testing-library/react';

import { ChatLoader } from '@components/chat/ChatLoader';

describe('ChatLoader', () => {
  it('renders three alternating skeleton rows', () => {
    const { container } = render(<ChatLoader />);

    const rows = container.querySelectorAll(':scope > div > div');
    expect(rows).toHaveLength(3);

    rows.forEach((row, index) => {
      const expectedDirection = index % 2 ? 'row-reverse' : 'row';
      expect(row).toHaveStyle({ flexDirection: expectedDirection });
    });
  });
});
