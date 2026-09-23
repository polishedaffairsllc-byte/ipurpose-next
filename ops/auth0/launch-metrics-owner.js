// Deploy this Action only in the separate MCP Auth0 tenant's Post Login flow.
// No secrets belong in this file. Firebase/site authentication is not involved.
exports.onExecutePostLogin = async (event, api) => {
  const resource = 'https://ipurposesoul.com/api/mcp';
  if (event.resource_server?.identifier !== resource) return;

  const email = event.user?.email;
  if (typeof email !== 'string' || email.toLowerCase() !== 'mshmltn@gmail.com'
    || event.user.email_verified !== true) {
    api.access.deny('Access is restricted to the connector owner.');
    return;
  }

  api.accessToken.setCustomClaim('https://ipurposesoul.com/mcp/email', email.toLowerCase());
  api.accessToken.setCustomClaim('https://ipurposesoul.com/mcp/email_verified', true);
};
