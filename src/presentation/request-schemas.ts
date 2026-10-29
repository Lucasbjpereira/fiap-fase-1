import { t } from 'elysia';

export const MAX_DATABASE_INTEGER = 2_147_483_647;

export const nonNegativeInteger = t.Integer({ minimum: 0, maximum: MAX_DATABASE_INTEGER });
export const positiveInteger = t.Integer({ minimum: 1, maximum: MAX_DATABASE_INTEGER });
export const priceCents = nonNegativeInteger;

export const idParams = t.Object({
  id: t.Number({ minimum: 1, maximum: MAX_DATABASE_INTEGER, multipleOf: 1 })
});

export const paginationQueryFields = {
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, multipleOf: 1 })),
  offset: t.Optional(t.Number({ minimum: 0, maximum: MAX_DATABASE_INTEGER, multipleOf: 1 }))
};

export const paginationQuery = t.Object(paginationQueryFields);
