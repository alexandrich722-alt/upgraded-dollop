// NOVA Life OS — Generic CRUD Factory
// Type-safe normalizer interface for entity CRUD operations

export type Normalizer<T> = (input: Partial<T>) => T;

export interface CrudMethods<T> {
  add: (item: Partial<T>) => string;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  getById: (id: string) => T | undefined;
}
