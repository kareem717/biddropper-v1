import { authOptions } from "@/lib/auth/config";

export async function POST(req: Request) {
  console.log(await req.json())
}
