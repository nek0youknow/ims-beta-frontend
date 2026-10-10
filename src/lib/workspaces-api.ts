import { apiRequest } from '@/lib/api';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type WorkspaceListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: Array<{ role: MemberRole }>;
  _count: {
    members: number;
    projects: number;
  };
};

export type WorkspaceDetail = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: MemberRole;
    user: { id: string; email: string; name: string };
  }>;
  _count: {
    projects: number;
  };
};

export type CreateWorkspacePayload = {
  name: string;
  description?: string;
};

export type UpdateWorkspacePayload = {
  name?: string;
  description?: string;
};

export function listWorkspaces() {
  return apiRequest<WorkspaceListItem[]>('/workspaces');
}

export function getWorkspace(workspaceId: string) {
  return apiRequest<WorkspaceDetail>(`/workspaces/${workspaceId}`);
}

export function createWorkspace(payload: CreateWorkspacePayload) {
  return apiRequest<WorkspaceDetail>('/workspaces', {
    method: 'POST',
    body: payload,
  });
}

export function updateWorkspace(workspaceId: string, payload: UpdateWorkspacePayload) {
  return apiRequest<{ id: string; name: string; description: string | null }>(
    `/workspaces/${workspaceId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function deleteWorkspace(workspaceId: string) {
  return apiRequest<{ success: boolean }>(`/workspaces/${workspaceId}`, {
    method: 'DELETE',
  });
}
