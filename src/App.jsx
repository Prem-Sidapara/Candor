
import './index.css'
import Navbar from './components/Navbar';
import Feed from './components/Feed';

function App() {


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4">
        <Feed />
      </main>
    </div>
  )
}

export default App
