export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type StoryStatus = 'Backlog' | 'In Progress' | 'Review' | 'Done';
export type ReviewDecision = 'approved' | 'changes_requested' | null;
export type MemberRole = 'admin' | 'member';

export interface UserStory {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;
  points?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  title?: string;
  avatar?: string;
  isOnline?: boolean;
  totalPoints?: number;
  password?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  assigneeAvatar?: string;
  createdById: string;
  createdByName: string;
  priority: Priority;
  points?: number;
  status: Status;
  storyId?: string;
  dueDate?: string;
  createdAt: string;
  acceptedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewDecision?: ReviewDecision;
  reviewComment?: string;
}

export interface ProjectDeadline {
  id: string;
  projectId: string;
  projectName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  title: string;
  dueDate: string;
  note?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  ownerId: string;
  ownerEmail: string;
  dueDate?: string;
  theme: string;
  members: TeamMember[];
  tasks: Task[];
  stories: UserStory[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  isOnline?: boolean;
  totalPoints?: number;
}
