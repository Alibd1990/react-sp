export function getApiErrorMessage(error, fallback = 'Operation echouee') {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if (backendMessage) {
    return backendMessage;
  }

  if (status === 401) {
    return 'Session expiree, reconnecte-toi.';
  }

  if (status === 403) {
    return 'Acces refuse: droits insuffisants.';
  }

  if (status >= 500) {
    return 'Erreur serveur, reessaye plus tard.';
  }

  if (error?.message === 'Network Error') {
    return 'Erreur reseau: backend injoignable.';
  }

  return fallback;
}
