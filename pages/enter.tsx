import { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../lib/context';
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import debounce from 'lodash.debounce';

export default function EnterPage(props) {
  const { user, username } = useContext(UserContext);

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />

  return (
    <main>
      {user ? !username ? <UsernameForm /> : <SignOutButton /> : <SignInButton />}
    </main>
  )
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider)
  }
  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} />Sign in with Google
    </button>
  )
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>
}

function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext)

  useEffect(() => {
    checkUsername(formValue)
  }, [formValue])

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val)
      setLoading(false)
      setIsValid(false)
    }
    if (re.test(val)) {
      setFormValue(val)
      setLoading(true)
      setIsValid(false)
    }
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`);
        const { exists } = await ref.get();
        console.log('Firestore read executed!');
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault()

    // create refs for both docs
    const userRef = firestore.doc(`users/${user.uid}`)
    const usernameRef = firestore.doc(`usernames/${formValue}`)

    // commit both docs together as a batch write
    const batch = firestore.batch();
    batch.set(userRef, { username: formValue, photoURL: user.photoURL, displayName: user.displayName })
    batch.set(usernameRef, { uid: user.uid });

    await batch.commit();

  }

  return (
    !username && (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input name="username" placeholder="username" value={formValue} onChange={onChange} />

          <UsernameMessage username={formValue} isValid={isValid} loading={loading} />

          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue} <br />
            Loading: {loading.toString()} <br />
            Username valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}