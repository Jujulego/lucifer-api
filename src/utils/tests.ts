import Context, { ContextParams, TestContext } from 'bases/context';
import { HttpError } from 'middlewares/errors';

// Types
type LA = { label: string, allowed: boolean };

type Matrix<P> = Array<ContextParams<LA & P>>;
type Call<P, T> = (ctx: Context, p: LA & P) => Promise<T>;
type Callback<P, T> = (res: T, p: LA & P) => void;
type Rejected<P> = (p: LA & P) => void;

// Utils
export async function contexts<P, T>(matrix: Matrix<P>, call: Call<P, T>, cb: Callback<P, T>, rejected?: Rejected<P>) {
  for (let i = 0; i < matrix.length; ++i) {
    const params = matrix[i];

    const ctx = TestContext.fromParams(params);
    const { label, allowed } = params;

    try {
      const prom = call(ctx, params);

      if (allowed) {
        await cb(await prom, params);
      } else {
        await expect(prom).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
        if (rejected) await rejected(params);
      }
    } catch (error) {
      console.error(`in '${label}'`);
      throw error;
    }
  }
}
