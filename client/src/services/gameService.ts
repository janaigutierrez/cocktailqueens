import api from './api';
import type { Game, Team } from '../types';

export const gameService = {
  get: () => api.get<Game>('/game').then((r) => r.data),
  create: () => api.post<Game>('/game').then((r) => r.data),
  delete: (id: string) => api.delete(`/game/${id}`),
  getRanking: (id: string) => api.get<Team[]>(`/game/${id}/ranking`).then((r) => r.data),
};
