import { getTunnels } from './api';

async function timeout(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function isTunnelRunning(
  username: string,
  accessKey: string,
  region: string,
  tunnelName: string,
  wait: number,
): Promise<boolean> {
  return await Promise.race([
    (async function (): Promise<boolean> {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const allTunnels = await getTunnels({
          username,
          accessKey,
          region,
          filter: tunnelName,
        });
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
            return true;
          }
        }
        await timeout(1000);
      }
    })(),
    (async function (): Promise<boolean> {
      await timeout(wait);
      return false;
    })(),
  ]);
}
