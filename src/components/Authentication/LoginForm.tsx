import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { initializeLocalStorage } from '../../utils/localStorageUtils';
import { PackageOpen } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Initialize localStorage with demo data
  useState(() => {
    initializeLocalStorage();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex flex-1 bg-blue-600 justify-center items-center p-12">
        <div className="max-w-xl text-white">
          <div className="flex items-center space-x-2 mb-8">
            <PackageOpen className="h-12 w-12" />
            <h1 className="text-4xl font-bold">ENTNT Rentals</h1>
          </div>
          <h2 className="text-3xl font-bold mb-6">Equipment Rental Management System</h2>
          <p className="text-xl opacity-90 mb-8">
            Streamline your equipment rental operations with our comprehensive management dashboard.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Inventory Management</h3>
                <p className="opacity-80">Track and manage your entire equipment inventory.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rental Tracking</h3>
                <p className="opacity-80">Efficiently manage rental orders and schedules.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <PackageOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Maintenance Management</h3>
                <p className="opacity-80">Keep track of equipment maintenance for optimal operation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex justify-center lg:hidden mb-8">
            <PackageOpen className="h-12 w-12 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-600 ml-2">ENTNT Rentals</h1>
          </div>
          
          <div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Use the demo accounts:
            </p>
            <div className="mt-1 text-sm text-gray-500 space-y-1">
              <p>Admin: admin@entnt.in / admin123</p>
              <p>Staff: staff@entnt.in / staff123</p>
              <p>Customer: customer@entnt.in / cust123</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;