import type { EntityState } from '@/store/state';

export function createEmptyEntityState<TModel, TId extends string = string>(): EntityState<TModel, TId> {
  return {
    byId: {} as Record<TId, TModel>,
    allIds: [],
  };
}

export function upsertEntity<TModel extends { id: TId }, TId extends string>(
  entityState: EntityState<TModel, TId>,
  model: TModel,
): EntityState<TModel, TId> {
  const alreadyExists = entityState.allIds.includes(model.id);

  return {
    byId: {
      ...entityState.byId,
      [model.id]: model,
    },
    allIds: alreadyExists ? entityState.allIds : [...entityState.allIds, model.id],
  };
}

export function removeEntity<TModel, TId extends string>(
  entityState: EntityState<TModel, TId>,
  id: TId,
): EntityState<TModel, TId> {
  const nextById = { ...entityState.byId };
  delete nextById[id];

  return {
    byId: nextById,
    allIds: entityState.allIds.filter((existingId) => existingId !== id),
  };
}

export function patchEntity<TModel extends { id: TId }, TId extends string>(
  entityState: EntityState<TModel, TId>,
  id: TId,
  patch: Partial<Omit<TModel, 'id'>>,
): EntityState<TModel, TId> {
  const existingEntity = entityState.byId[id];

  if (!existingEntity) {
    return entityState;
  }

  return {
    byId: {
      ...entityState.byId,
      [id]: {
        ...existingEntity,
        ...patch,
      },
    },
    allIds: entityState.allIds,
  };
}
