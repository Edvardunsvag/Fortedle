import type { Employee } from './types';
import { mockEmployees } from './mockData';
import { mapHumaUserDetailToEmployee } from './apiMapper';
import type { HumaApiListResponse, HumaApiUserDetail } from './apiTypes';

export type DataSource = 'mock' | 'api';

/**
 * Custom error class for authentication failures (401)
 * This allows the thunk to distinguish auth errors from other errors
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed. Please login again.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const getTokenFromStorage = (): string | null => {
  try {
    const token = localStorage.getItem('huma:accessToken');
    if (!token) return null;
    
    const parsed = JSON.parse(token);
    // Handle array format: ["token"] -> extract first element
    if (Array.isArray(parsed) && parsed.length > 0) {
      return typeof parsed[0] === 'string' ? parsed[0] : null;
    }
    // Handle string format
    if (typeof parsed === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchEmployees = async (
  dataSource: DataSource = 'mock',
  accessToken?: string | null
): Promise<Employee[]> => {
  // Use mock data if requested
  if (dataSource === 'mock') {
    console.log('Using mock employee data');
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEmployees;
  }

  // Use Huma API
  let token = accessToken || getTokenFromStorage();
  
  if (!token) {
    throw new Error('No access token available. Please login first.');
  }

  // Remove any existing "Bearer " prefix from the token
  token = token.replace(/^Bearer\s+/i, '').trim();

  // Debug logging
  console.log('Token retrieved:', token.substring(0, 20) + '...');
  console.log('Token length:', token.length);

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log('Authorization header:', headers.Authorization?.substring(0, 30) + '...');

    // API is capped at 50 records per request, so we need to make 3 calls:
    // offset=0 (0-50), offset=50 (50-100), offset=100 (100-150)
    const paginationParams = [
      { offset: 0, limit: 50 },
      { offset: 50, limit: 50 },
      { offset: 100, limit: 50 },
    ];

    const baseUrl = import.meta.env.DEV
      ? '/api/huma/users'
      : 'https://api.humahr.com/users';

    // Fetch all pages in parallel
    const listDataPromises = paginationParams.map(async ({ offset, limit }) => {
      const apiUrl = `${baseUrl}?limit=${limit}&offset=${offset}&orderBy=name&orderDirection=asc`;
      console.log(`Making request to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Authentication failed. Please login again.');
        }
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
      }

      return await response.json() as HumaApiListResponse;
    });

    // Wait for all paginated requests to complete
    const listDataResults = await Promise.all(listDataPromises);
    
    // Combine all items from all pages
    const allItems = listDataResults.flatMap((result) => result.items);
    
    // Filter active users and get their IDs
    const activeUserIds = allItems
      .filter((user) => user.status?.active !== false)
      .map((user) => user.id);

    console.log(`Fetching details for ${activeUserIds.length} users...`);

    // Fetch detailed information for each user
    const userDetailPromises = activeUserIds.map(async (userId) => {
      const detailUrl = import.meta.env.DEV
        ? `/api/huma/users/${userId}`
        : `https://api.humahr.com/users/${userId}`;

      try {
        const detailResponse = await fetch(detailUrl, {
          method: 'GET',
          headers,
        });

        if (!detailResponse.ok) {
          if (detailResponse.status === 401) {
            throw new AuthenticationError('Authentication failed. Please login again.');
          }
          console.warn(`Failed to fetch details for user ${userId}: ${detailResponse.status}`);
          return null;
        }

        const userDetail: HumaApiUserDetail = await detailResponse.json();
        return userDetail;
      } catch (error) {
        console.warn(`Error fetching details for user ${userId}:`, error);
        return null;
      }
    });

    // Wait for all user details to be fetched
    const userDetails = await Promise.all(userDetailPromises);
    
    // Filter out any failed requests and map to Employee format
    const employees = userDetails
      .filter((user): user is HumaApiUserDetail => user !== null)
      .map(mapHumaUserDetailToEmployee);

    console.log(`Successfully loaded ${employees.length} employees`);
    return employees;
  } catch (error) {
    // Re-throw AuthenticationError as-is so it can be handled by the thunk
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch employees from API'
    );
  }
};

