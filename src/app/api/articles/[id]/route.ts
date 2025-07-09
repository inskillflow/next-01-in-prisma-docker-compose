import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route GET – Lire un seul article
export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: context.params.id
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

// Route PUT – Mettre à jour un article
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const body = await req.json()

    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id: context.params.id
      },
      data: {
        title: body.title,
        content: body.content,
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Error updating article:', error)
    // Vérifier si l'article existe
    const article = await prisma.article.findUnique({
      where: { id: context.params.id }
    })
    
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// Route DELETE – Supprimer un article
export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const deletedArticle = await prisma.article.delete({
      where: {
        id: context.params.id
      }
    })

    return NextResponse.json(deletedArticle)
  } catch (error) {
    console.error('Error deleting article:', error)
    // Vérifier si l'article existe
    const article = await prisma.article.findUnique({
      where: { id: context.params.id }
    })
    
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
} 