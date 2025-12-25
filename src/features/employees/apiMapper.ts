import type { Employee } from './types';
import type { HumaApiUser, HumaApiUserDetail, ValueField } from './apiTypes';

/**
 * Helper to extract value from ValueField
 */
const getValue = <T>(field: ValueField<T> | undefined): T | undefined => {
  return field?.value;
};

/**
 * Derives skills from job title and teams
 * Returns empty array if no skills can be determined
 */
const deriveSkills = (jobTitle?: { name: string }, teams?: Array<{ name: string }>): string[] => {
  const skills: string[] = [];
  
  if (jobTitle) {
    const title = jobTitle.name.toLowerCase();
    
    // Technology skills
    if (title.includes('developer') || title.includes('engineer') || title.includes('architect')) {
      if (title.includes('react') || title.includes('frontend') || title.includes('experience platform')) {
        skills.push('React', 'TypeScript', 'JavaScript');
      }
      if (title.includes('cloud') || title.includes('platform')) {
        skills.push('Cloud', 'DevOps', 'Kubernetes');
      }
      if (title.includes('dynamics')) {
        skills.push('Dynamics', 'Microsoft', 'CRM');
      }
    }
    
    // Design skills
    if (title.includes('designer') || title.includes('ux') || title.includes('ui')) {
      skills.push('Figma', 'UI/UX', 'Design');
    }
    
    // Product skills
    if (title.includes('product')) {
      skills.push('Product Management', 'Analytics', 'Strategy');
    }
    
    // Business skills
    if (title.includes('business design')) {
      skills.push('Business Design', 'Strategy', 'Consulting');
    }
    
    // HR skills
    if (title.includes('hr')) {
      skills.push('HR', 'Recruitment', 'People Management');
    }
  }
  
  // Add team-based skills
  if (teams) {
    teams.forEach((team) => {
      const teamName = team.name.toLowerCase();
      if (teamName.includes('technology')) {
        if (!skills.includes('Technology')) skills.push('Technology');
      }
      if (teamName.includes('experience')) {
        if (!skills.includes('Experience Design')) skills.push('Experience Design');
      }
      if (teamName.includes('product')) {
        if (!skills.includes('Product')) skills.push('Product');
      }
    });
  }
  
  // Return empty array if no skills found (don't add default)
  return skills;
};

/**
 * Calculates age from birth date
 * Returns '-' if no birth date
 */
const calculateAge = (birthDate?: string): number | string => {
  if (!birthDate) {
    return '-';
  }

  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return '-';
  }
};

/**
 * Maps Huma API detailed user response to Employee type
 */
export const mapHumaUserDetailToEmployee = (user: HumaApiUserDetail): Employee => {
  const givenName = getValue(user.givenName) || '';
  const familyName = getValue(user.familyName) || '';
  const preferredName = getValue(user.preferredName);
  const name = preferredName || `${givenName} ${familyName}`;
  
  // Prefer avatarImage.url over avatarUrl
  const avatarImage = getValue(user.avatarImage);
  const avatarUrl = getValue(user.avatarUrl);
  const avatarImageUrl = avatarImage?.url || avatarUrl;
  
  const teams = getValue(user.teams) || [];
  const department = teams[0]?.name || '-';
  
  const locations = getValue(user.locations) || [];
  const office = locations[0]?.name || '-';
  
  const jobTitle = getValue(user.jobTitle);
  const skills = deriveSkills(jobTitle, teams);
  
  const birthDate = getValue(user.birthDate);
  const age = calculateAge(birthDate);
  
  // Supervisor - extract from API response
  const supervisorData = getValue(user.supervisor);
  let supervisor = '-';
  if (supervisorData) {
    supervisor = supervisorData.preferredName || `${supervisorData.givenName} ${supervisorData.familyName}`;
  }

  return {
    id: user.id,
    name,
    firstName: givenName,
    surname: familyName,
    avatarImageUrl,
    department,
    office,
    skills,
    age,
    supervisor,
  };
};

/**
 * Maps Huma API user list item to Employee type (legacy, for backward compatibility)
 */
export const mapHumaUserToEmployee = (user: HumaApiUser): Employee => {
  const givenName = user.givenName || '';
  const familyName = user.familyName || '';
  const name = user.preferredName || `${givenName} ${familyName}`;
  const avatarImageUrl = user.avatarUrl;
  const department = user.teams?.[0]?.name || '-';
  const office = user.locations?.[0]?.name || '-';
  const skills = deriveSkills(user.jobTitle, user.teams);
  const age = '-';
  const supervisor = '-';

  return {
    id: user.id,
    name,
    firstName: givenName,
    surname: familyName,
    avatarImageUrl,
    department,
    office,
    skills,
    age,
    supervisor,
  };
};

