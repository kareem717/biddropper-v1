import { useSearchParams } from "next/navigation";

export async function GET(req: Request, { params }: { params: { tag: string } }) {
 
  return new Response(`Hello ${params.tag}!`);
}