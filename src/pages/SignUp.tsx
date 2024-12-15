import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle, ROLES } from '@/admin/auth/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { auth, firestore } from '@/admin/auth/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doCreateUserWithEmailAndPassword(email, password);
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { role } = await doSignInWithGoogle();
      navigate(role === ROLES.ADMIN ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up with Google",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-church-background flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-church-primary mb-6 text-center">
          Create an Account
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-church-primary text-white"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-4">
          <Button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full bg-white text-gray-700 border border-gray-300"
          >
            Sign up with Google
          </Button>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Button
            variant="link"
            className="text-church-primary p-0"
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
} 