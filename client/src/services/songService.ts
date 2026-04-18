import api from './api';
import type { Song } from '../types';

export const songService = {
  getAll: () => api.get<Song[]>('/songs').then((r) => r.data),
  create: (data: { title: string; artist: string }) =>
    api.post<Song>('/songs', data).then((r) => r.data),
  bulkCreate: (songs: { title: string; artist: string }[]) =>
    api.post<Song[]>('/songs/bulk', { songs }).then((r) => r.data),
  update: (id: string, data: Partial<Song>) =>
    api.put<Song>(`/songs/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/songs/${id}`),
  getCount: () => api.get<{ count: number }>('/songs/count').then((r) => r.data.count),
};
