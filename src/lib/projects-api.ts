import { apiRequest } from '@/lib/api';
import type { MemberRole } from '@/lib/workspaces-api';

export type ProjectListItem = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{ role: MemberRole }>;
  _count: {
    members: number;
    issues: number;
  };
};

export type ProjectDetail = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  workspace: { id: string; name: string };
  members: Array<{
    id: string;
    role: MemberRole;
    user: { id: string; email: string; name: string };
  }>;
  _count: {
    issues: number;
  };
};

export type CreateProjectPayload = {
  name: string;
  key: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

export function listProjects(workspaceId: string) {
  return apiRequest<ProjectListItem[]>(`/workspaces/${workspaceId}/projects`);
}

export function getProject(projectId: string) {
  return apiRequest<ProjectDetail>(`/projects/${projectId}`);
}

export function createProject(workspaceId: string, payload: CreateProjectPayload) {
  return apiRequest<ProjectDetail>(`/workspaces/${workspaceId}/projects`, {
    method: 'POST',
    body: payload,
  });
}

export function updateProject(projectId: string, payload: UpdateProjectPayload) {
  return apiRequest<{ id: string; name: string; key: string; description: string | null }>(
    `/projects/${projectId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function deleteProject(projectId: string) {
  return apiRequest<{ success: boolean }>(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}
