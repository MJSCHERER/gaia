import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { authApi } from '@/services/api';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error: unknown) {
        setStatus('error');

        if (axios.isAxiosError(error)) {
          setMessage(
            error.response?.data?.message || 'Failed to verify email'
          );
        } else if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('Failed to verify email');
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full max-w-md mx-auto text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 animate-spin text-violet-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
          <p className="text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link to="/login">Go to Login</Link>
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button asChild variant="outline">
            <Link to="/login">Go to Login</Link>
          </Button>
        </>
      )}
    </div>
  );
}
