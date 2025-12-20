const DEFAULT_TIMEOUT = 10000;

export function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT, message = 'Timeout') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

export async function runInParallel(fetchers = []) {
  const results = await Promise.allSettled(
    fetchers.map((fn) => {
      try {
        return fn();
      } catch (err) {
        return Promise.reject(err);
      }
    })
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return { data: result.value?.data ?? result.value ?? null, error: result.value?.error ?? null };
    }
    return { data: null, error: result.reason || new Error('Falha ao carregar recurso') };
  });
}