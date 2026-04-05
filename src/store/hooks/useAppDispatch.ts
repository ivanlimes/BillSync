import { useAppStoreContext } from '@/store/context/AppStoreContext';

export function useAppDispatch() {
  return useAppStoreContext().dispatch;
}
