export const getImgUrl = (path) => {
    if (!path) return '/default-image.jpg';
  
    // Eğer path sadece dosya adı ise (örneğin "book-4.png"),
    // backend'deki "public/uploads/books" klasörüne yönlendiriyoruz.
    if (!path.includes('/') && !path.startsWith('http://') && !path.startsWith('https://')) {
      return `http://localhost:5000/uploads/books/${path}`;
    }
    
    // Eğer path "/uploads" veya "uploads/" ile başlıyorsa, backend URL'si ekleyerek döndür.
    if (path.startsWith('/uploads') || path.startsWith('uploads/')) {
      return `http://localhost:5000/${path.startsWith('/') ? path.slice(1) : path}`;
    }
    
    // Eğer path "assets/" ile başlıyorsa (eski resimler frontend public'te saklanıyorsa)
    if (path.startsWith('assets/')) {
      return `http://localhost:5173/${path}`;
    }
    
    // Eğer path zaten tam URL ise, direkt döndür.
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    return path;
  };
  