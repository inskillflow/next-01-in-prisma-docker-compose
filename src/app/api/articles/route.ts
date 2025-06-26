import { NextResponse } from 'next/server'
import { articles } from '@/lib/data'
import { generateId } from '@/lib/utils'


export async function GET() {
  return NextResponse.json(articles)
}




export async function POST(req: Request) {
  const body = await req.json()

  if (!body.title || !body.content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const newArticle = {
    id: generateId(),
    title: body.title,
    content: body.content,
    createdAt: new Date().toISOString(),
  }

  articles.push(newArticle)

  return NextResponse.json(newArticle, { status: 201 })
}