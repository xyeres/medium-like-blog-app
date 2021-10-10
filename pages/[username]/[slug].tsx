import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import PostContent from "../../components/PostContent";

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection('posts').doc(slug);
    let postDoc = await postRef.get()
    console.log('post doc: ', postDoc.data())
    post = postToJSON(await postRef.get());

    path = postRef.path;
  }
  return {
    props: { post, path },
    revalidate: 5000,
  }
}

export async function getStaticPaths() {
  const snapshot = await firestore.collectionGroup('posts').get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug }
    }
  });

  return {
    paths,
    fallback: 'blocking',
  }
}

export default function Post(props) {
  const postRef = firestore.doc(props.path)
  const [realtimePost] = useDocumentData(postRef);
  const post = realtimePost || props.post;

  return (
    <main className="container">
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>
      </aside>
    </main>
  )
}