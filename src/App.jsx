
import './index.css'
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import { useRef } from 'react';

function App() {
  const feedRefreshRef = useRef(null); // Feed ka fetchPosts store karne ke liye

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onPostCreated={() => feedRefreshRef.current?.()} />
      <main className="max-w-3xl mx-auto px-4">
        <Feed onMountRefresh={(fn) => { feedRefreshRef.current = fn; }} />
      </main>
    </div>
  )
}

export default App
