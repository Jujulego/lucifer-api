import Context, { ContextMatrix, TestContext } from 'bases/context';
import { HttpError } from 'middlewares/errors';

// Types
type LA = { label: string, allowed: boolean };

// Utils
export async function contexts<P, T>(matrix: ContextMatrix<LA & P>, call: (ctx: Context, p: P) => Promise<T>, cb: (res: T, params: LA & P) => void) {
  await TestContext.map(matrix, async (ctx, params) => {
    const { label, allowed } = params;

    try {
      const prom = call(ctx, params);

      if (allowed) {
        await cb(await prom, params);
      } else {
        await expect(prom).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
      }
    } catch (error) {
      console.error(`in '${label}'`);
      throw error;
    }
  });
}
