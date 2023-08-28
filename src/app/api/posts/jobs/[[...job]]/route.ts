export async function POST(req: Request) {
  const body = await req.json();

  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}