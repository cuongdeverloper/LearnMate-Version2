import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
const handleDownload = async (materialId, title) => {
    try {
      const res = await fetch(`/api/materials/${materialId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Nếu có JWT
        },
      });
      if (!res.ok) throw new Error("Download failed");
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = title || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Không thể tải tài liệu.");
    }
  };