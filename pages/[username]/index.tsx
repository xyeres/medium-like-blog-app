import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { getUserWithUsername, postToJSON } from "../../lib/firebase";

export async function getServerSideProps({ query }) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // JSON Serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();
    const postsQuery = userDoc.ref
      .collection('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5);

    posts = (await postsQuery.get()).docs.map(postToJSON);
  }

  return {
    props: { user, posts } // will be passed to the page component as props
  }
};

export default function UserProfilePage({ user, posts }): JSX.Element {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed admin={false} posts={posts} />
    </main>
  )
}

