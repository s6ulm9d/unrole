export interface UserProfile {
    id: string;
    name?: string;
    email: string;
    subscriptionPlan: 'FREE' | 'PRO' | 'PREMIUM';
}

export interface JobData {
    id: string;
    platform: string;
    externalJobId: string;
    title: string;
    company: string;
    description: string;
    location: string;
    url: string;
    parsedSkills: string[];
}

export interface ApplicationLog {
    step: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING';
    message?: string;
    timestamp: string;
}
