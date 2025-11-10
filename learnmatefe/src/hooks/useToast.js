import { toast } from "react-toastify";

const useToast = () => {
  const success = (message, options = {}) =>
    toast.success(message, { ...options });
  const error = (message, options = {}) => toast.error(message, { ...options });
  const info = (message, options = {}) => toast.info(message, { ...options });
  const warning = (message, options = {}) =>
    toast.warning(message, { ...options });
  const defaultToast = (message, options = {}) =>
    toast(message, { ...options });

  return { success, error, info, warning, defaultToast };
};

export default useToast;
