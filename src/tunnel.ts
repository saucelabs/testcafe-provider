import { getTunnels } from './api';

async function sleep(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function waitForTunnel(
  username: string,
  accessKey: string,
  region: string,
  tunnelName: string,
  wait: number,
): Promise<'ok' | 'notready' | 'unauthorized'> {
  return await Promise.race([
    (async function (): Promise<'ok' | 'unauthorized'> {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await getTunnels({
          username,
          accessKey,
          region,
          filter: tunnelName,
        });
        if (result.kind === 'unauthorized') {
          return 'unauthorized';
        }
        if (result.kind !== 'ok') {
          await sleep(2000);
          continue;
        }

        const allTunnels = result.data;
        for (const owner in allTunnels) {
          const tunnels = allTunnels[owner];
          if (
            tunnels.some(
              (t) =>
                t.owner === username &&
                (t.tunnel_identifier === tunnelName || t.id === tunnelName) &&
                t.status === 'running',
            )
          ) {
            return 'ok';
          }
        }
        await sleep(1000);
      }
    })(),
    (async function (): Promise<'notready'> {
      await sleep(wait * 1000);
      return 'notready';
    })(),
  ]);
}
