import { HttpError } from 'middlewares/errors';

// Utils
export async function shouldBeNotFound<T>(prom: Promise<T>) {
  await expect(prom)
    .rejects.toEqual(expect.objectContaining({
      ...HttpError.NotFound(),
      message: expect.any(String)
    }));
}

export async function shouldBeNotAllowed<T>(prom: Promise<T>) {
  await expect(prom)
    .rejects.toEqual(HttpError.Forbidden('Not allowed'));
}
