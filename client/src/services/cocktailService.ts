import api from './api';
import type { Cocktail } from '../types';

export const cocktailService = {
  getAll: () => api.get<Cocktail[]>('/cocktails').then((r) => r.data),
  create: (data: { name: string; ingredients: string[] }) =>
    api.post<Cocktail>('/cocktails', data).then((r) => r.data),
  update: (id: string, data: Partial<Cocktail>) =>
    api.put<Cocktail>(`/cocktails/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/cocktails/${id}`),
};
