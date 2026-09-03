import { API_ENDPOINTS } from '@constants/api';
import { userService } from '@features/settings/api/user.service';
import { apiClient } from '@services/api';

jest.mock('@services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches current user profile from GET /auth/me', async () => {
    const mockUser = { id: '1', email: 'john@example.com', name: 'John Doe' };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.getCurrentUser();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
    expect(result).toEqual(mockUser);
  });

  it('fetches extended user details from GET /users/me/details', async () => {
    const mockDetails = {
      profile_id: 'PRF-1001',
      user_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      mobile_number: '9876543210',
      profile_status: 'Active',
      communication_preferences: ['Email'],
      created_at: '2025-05-18T10:24:00Z',
      updated_at: '2025-05-18T10:24:00Z',
    };
    mockedApiClient.get.mockResolvedValueOnce({ data: mockDetails });

    const result = await userService.getUserDetails();

    expect(mockedApiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USER.DETAILS);
    expect(result).toEqual(mockDetails);
  });

  it('updates extended user details via POST /users/me/details', async () => {
    const payload = {
      first_name: 'Jane',
      last_name: 'Doe',
      mobile_number: '9876543211',
    };
    const mockDetails = {
      ...payload,
      profile_id: 'PRF-1001',
      user_id: 1,
      email: 'jane@example.com',
      profile_status: 'Active',
      communication_preferences: [],
      created_at: '',
      updated_at: '',
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: mockDetails });

    const result = await userService.updateUserDetails(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.USER.DETAILS, payload);
    expect(result).toEqual(mockDetails);
  });

  it('calls POST /users/me/avatar on uploadAvatar with FormData', async () => {
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const mockUser = {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      avatarUrl: 'http://localhost:8000/api/users/1/avatar',
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: { data: mockUser } });

    const result = await userService.uploadAvatar(mockFile);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.USER.AVATAR,
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    expect(result).toEqual(mockUser);
  });

  it('updates profile via PATCH /users/me and unwraps ApiResponse envelope', async () => {
    const payload = { name: 'Jane', email: 'jane@example.com' };
    const mockUser = { id: '1', email: 'jane@example.com', name: 'Jane' };
    mockedApiClient.patch.mockResolvedValueOnce({ data: { data: mockUser } });

    const result = await userService.updateProfile(payload);

    expect(mockedApiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USER.UPDATE_PROFILE, payload);
    expect(result).toEqual(mockUser);
  });

  it('updates profile via PATCH /users/me when response is raw (no envelope)', async () => {
    const payload = { name: 'Jane', email: 'jane@example.com' };
    const mockUser = { id: '1', email: 'jane@example.com', name: 'Jane' };
    mockedApiClient.patch.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.updateProfile(payload);

    expect(mockedApiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.USER.UPDATE_PROFILE, payload);
    expect(result).toEqual(mockUser);
  });

  it('updates profile with avatarUrl via PATCH /users/me', async () => {
    const payload = {
      name: 'Jane',
      email: 'jane@example.com',
      avatarUrl: 'http://example.com/a.png',
    };
    const mockUser = {
      id: '1',
      email: 'jane@example.com',
      name: 'Jane',
      avatarUrl: 'http://example.com/a.png',
    };
    mockedApiClient.patch.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.updateProfile(payload);

    expect(result).toEqual(mockUser);
  });

  it('uploadAvatar returns raw user when response has no data envelope', async () => {
    const mockFile = new File(['dummy'], 'avatar.png', { type: 'image/png' });
    const mockUser = { id: '1', email: 'john@example.com', name: 'John Doe' };
    mockedApiClient.post.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.uploadAvatar(mockFile);

    expect(result).toEqual(mockUser);
  });

  it('calls POST /v1/auth/change-password on changePassword', async () => {
    const payload = {
      current_password: 'OldPassword123!',
      new_password: 'NewPassword123!',
    };
    const mockResponse = { status: 'success', message: 'Password has been changed successfully.' };
    mockedApiClient.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await userService.changePassword(payload);

    expect(mockedApiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    expect(result).toEqual(mockResponse);
  });
});
