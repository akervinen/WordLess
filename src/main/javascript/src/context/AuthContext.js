import {createContext, useContext, useEffect} from 'react';
import {useCookies} from 'react-cookie';

/**
 * Authentication context
 * @type {React.Context<boolean>}
 */
export const AuthContext = createContext(false);

/**
 * Authentication hook. Checks for auth using a non-httpOnly cookie (not the JWT token).
 * @returns {[boolean, function]} authentication status and a function to change it
 */
export default function useAuth() {
  const [authed, setAuthed] = useContext(AuthContext);
  const [{jwt_authed}] = useCookies(['jwt_authed']);

  useEffect(() => {
    setAuthed(jwt_authed === '1');
  }, [jwt_authed, setAuthed]);

  return [authed, setAuthed];
}
