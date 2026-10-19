export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { inOwnerWorkspace } = await import('./lib/account-context');
      const { createAntkiCostCapCampaign } = await import('./lib/meta-adsets');
      void inOwnerWorkspace(() =>
        createAntkiCostCapCampaign({
          accountId: '1109284831182252',
          costCapPln: 35,
          dailyBudgetPln: 1500,
          forceNew: false,
        }),
      ).catch(() => {});
    } catch {
      // Ignore startup hook errors
    }
  }
}
