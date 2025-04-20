import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">403 - Unauthorized</h1>
      <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
      <Link 
        to="/" 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default Unauthorized