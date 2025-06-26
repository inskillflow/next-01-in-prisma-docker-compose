import { articles } from '@/lib/data'
import { NextResponse } from 'next/server'

// Route GET – Lire un seul article
export async function GET(_: Request, context: { params: { id: string } }) {
  const article = articles.find((a) => a.id === context.params.id)

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(article)
}

// Route PUT – Mettre à jour un article
export async function PUT(req: Request, context: { params: { id: string } }) {
  const index = articles.findIndex((a) => a.id === context.params.id)

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()

  if (!body.title || !body.content) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  articles[index] = {
    ...articles[index],
    title: body.title,
    content: body.content,
  }

  return NextResponse.json(articles[index])
}

// Route DELETE – Supprimer un article
export async function DELETE(_: Request, context: { params: { id: string } }) {
  const index = articles.findIndex((a) => a.id === context.params.id)

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const deleted = articles.splice(index, 1)

  return NextResponse.json(deleted[0])
} 