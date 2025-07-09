import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>API Articles - Next.js</h1>
      <p className={styles.description}>Votre API pour la gestion des articles est maintenant active !</p>
      
      <div className={styles.info}>
        <h2>Endpoints disponibles :</h2>
        <ul>
          <li><strong>GET</strong> /api/articles - Récupérer tous les articles</li>
          <li><strong>POST</strong> /api/articles - Créer un nouvel article</li>
          <li><strong>GET</strong> /api/articles/[id] - Récupérer un article spécifique</li>
          <li><strong>PUT</strong> /api/articles/[id] - Mettre à jour un article</li>
          <li><strong>DELETE</strong> /api/articles/[id] - Supprimer un article</li>
        </ul>
      </div>
      
      <div className={styles.testing}>
        <h2>Comment tester :</h2>
        <ol>
          <li>Ouvrez le fichier <code>api-tests.http</code> dans VSCode</li>
          <li>Installez l'extension "REST Client" si nécessaire</li>
          <li>Testez les requêtes dans l'ordre numéroté</li>
        </ol>
      </div>
      
      <div className={styles.note}>
        <p><strong>Note :</strong> Le serveur fonctionne maintenant sur le port 3001 (port 3000 occupé)</p>
        <p>Mettez à jour vos tests HTTP avec : <code>http://localhost:3001</code></p>
      </div>
    </main>
  )
} 