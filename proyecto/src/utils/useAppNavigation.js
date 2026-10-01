import { useLocation, useNavigate } from 'react-router-dom';

export const MODAL_PATHS = new Set([
  '/pausa',
  '/configuracion',
  '/perfil',
  '/tutorial',
  '/victoria',
  '/derrota',
]);

export const DEFAULT_BACKGROUND_LOCATION = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'inicio',
};

export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (path, options = {}) => {
    if (MODAL_PATHS.has(path)) {
      const backgroundLocation = location.state?.backgroundLocation
        || (MODAL_PATHS.has(location.pathname) ? DEFAULT_BACKGROUND_LOCATION : location);
      return navigate(path, {
        ...options,
        state: { ...options.state, backgroundLocation },
      });
    }

    return navigate(path, options);
  };
}

export function useDismissModal() {
  const navigate = useNavigate();
  const location = useLocation();

  return () => navigate(location.state?.backgroundLocation || '/', { replace: true });
}