// Types for the Huma API response (list endpoint)
export interface HumaApiUserListItem {
  id: string;
  givenName: string;
  familyName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  jobTitle?: {
    id: string;
    name: string;
  };
  teams?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  locations?: Array<{
    id: string;
    name: string;
    address?: {
      line1: string;
      line2?: string;
      line3?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    type: string;
  }>;
  companies?: Array<{
    id: string;
    name: string;
    organizationNumber: string;
    invalidOrganizationNumber: boolean;
    address?: {
      line1: string;
      line2?: string;
      line3?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    type: string;
  }>;
  groups?: Array<unknown>;
  type: string;
  status?: {
    active: boolean;
  };
}

export interface HumaApiListResponse {
  total: number;
  items: HumaApiUserListItem[];
}

// Types for the detailed user endpoint (individual user)
export interface ValueField<T> {
  value: T;
  editable?: boolean;
  completeness?: string;
  showBirthday?: boolean;
}

export interface HumaApiUserDetail {
  id: string;
  givenName: ValueField<string>;
  familyName: ValueField<string>;
  preferredName?: ValueField<string>;
  email: ValueField<string>;
  phone?: ValueField<string>;
  avatarUrl?: ValueField<string>;
  avatarImage?: ValueField<{
    url: string;
    width: number;
    height: number;
  }>;
  coverImageUrl?: ValueField<string>;
  birthDate?: ValueField<string>; // Format: "YYYY-MM-DD"
  interests?: ValueField<string[]>;
  funfacts?: ValueField<string>;
  teams?: ValueField<Array<{
    id: string;
    name: string;
    type: string;
  }>>;
  locations?: ValueField<Array<{
    id: string;
    name: string;
    address?: {
      line1: string;
      line2?: string;
      line3?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    type: string;
  }>>;
  companies?: ValueField<Array<{
    id: string;
    name: string;
    organizationNumber: string;
    invalidOrganizationNumber: boolean;
    address?: {
      line1: string;
      line2?: string;
      line3?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    type: string;
  }>>;
  jobTitle?: ValueField<{
    id: string;
    name: string;
  }>;
  supervisor?: ValueField<{
    id: string;
    givenName: string;
    familyName: string;
    preferredName?: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    type: string;
    status?: {
      active: boolean;
    };
  }>;
}

// Legacy type alias for backward compatibility
export type HumaApiUser = HumaApiUserListItem;
export type HumaApiResponse = HumaApiListResponse;

