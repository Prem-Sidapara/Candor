import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <h1 className="text-3xl font-bold">Anonymous Truth Platform</h1>
      </div>
    </>
  )
}

export default App
