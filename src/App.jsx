
import './index.css'
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import { useRef } from 'react';

function App() {
  const feedRefreshRef = useRef(null); // Feed ka fetchPosts store karne ke liye

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onPostCreated={() => feedRefreshRef.current?.()} />
      <main className="max-w-[90vw] mx-auto px-4">
        <Feed onMountRefresh={(fn) => { feedRefreshRef.current = fn; }} />
        <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: '30px', padding: '12px 0 24px' }}>
          🚧 voting &amp; comments are under development <br />
          By the way you can still post. Have a good day!
        </p>
      </main>
    </div>
  )
}

export default App
