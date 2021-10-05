import '../styles/globals.css'

// Wrapper for app, use this to add global components 
// like Nav bar or auth state 

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
