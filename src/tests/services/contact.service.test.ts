import { contactService } from '@features/landing/api/contact.service';
import { apiClient } from '@services/api';

jest.mock('@services/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockedApiClient = jest.mocked(apiClient);

describe('contactService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits a contact payload', async () => {
    mockedApiClient.post.mockResolvedValue({ data: { message: 'ok' } });

    const payload = { name: 'A', email: 'a@b.com', topic: 'general', message: 'hello' };
    await contactService.submitContact(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(expect.stringContaining('contact'), payload);
  });
});
