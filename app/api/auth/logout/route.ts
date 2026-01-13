export async function POST(request: Request) {
  const headers = new Headers();
  // Clear the cookie (FirebaseSession) and redirect to homepage
  headers.append("Set-Cookie", `FirebaseSession=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`);
  headers.append("Location", "/");
  return new Response(null, { status: 302, headers });
}

export async function GET(request: Request) {
  const headers = new Headers();
  // Clear the cookie (FirebaseSession) and redirect to homepage
  headers.append("Set-Cookie", `FirebaseSession=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`);
  headers.append("Location", "/");
  return new Response(null, { status: 302, headers });
}
