/** Error con código HTTP y mensaje pensado para mostrarse tal cual en la interfaz. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'error',
    public extra: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export const notFound = (what = 'Lo que buscas') => new HttpError(404, `${what} no existe.`, 'not_found');
