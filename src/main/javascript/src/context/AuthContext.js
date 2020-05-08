import {createContext, useContext, useEffect} from 'react';
import {useCookies} from 'react-cookie';

export const AuthContext = createContext(false);

export default function useAuth() {
  const [authed, setAuthed] = useContext(AuthContext);
  const [{jwt_authed}] = useCookies(['jwt_authed']);

  useEffect(() => {
    setAuthed(jwt_authed === '1');
  }, [jwt_authed, setAuthed]);

  return [authed, setAuthed];
}
