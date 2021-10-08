import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { firestore, postToJSON, fromMillis } from '../lib/firebase';
import { useState } from 'react';
import PostFeed from '../components/PostFeed';

// max post to query per page
const LIMIT = 1;

export async function getServerSideProps() {
  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT)

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts },
  }
}


export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false)
  const [postsEnd, setPostsEnd] = useState(false)

  const getMostPosts = async () => {
    setLoading(true)
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;

    const query = firestore
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)
      .limit(LIMIT)

    const newPosts = (await query.get()).docs.map((doc) => doc.data())

    setPosts(posts.concat(newPosts));
    setLoading(false)

    if (newPosts.length < LIMIT) {
      setPostsEnd(true)
    }
  }
  return (
    <main>
      <PostFeed admin={false} posts={posts} />

      {!loading && !postsEnd && <button onClick={getMostPosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}
