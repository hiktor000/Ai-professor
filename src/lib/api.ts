// Helper utility for handling API requests both on Web and inside Android APKs / WebView

const DEFAULT_REMOTE_SERVER = 'https://ais-pre-3vdjmu7q7kkmvr6xc62vst-560487372861.europe-west1.run.app';

export function getApiBaseUrl(): string {
  // Check if custom URL is saved in localStorage
  const savedUrl = localStorage.getItem('api_server_url');
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, '');
  }

  // If running in browser hosted on Cloud Run / live domain, use relative paths
  if (
    typeof window !== 'undefined' &&
    window.location.protocol !== 'file:' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1') &&
    window.location.protocol.startsWith('http')
  ) {
    return '';
  }

  // Fallback for APK / Capacitor / Cordova / file:// / localhost
  return DEFAULT_REMOTE_SERVER;
}

export function setSavedApiBaseUrl(url: string) {
  if (!url || !url.trim()) {
    localStorage.removeItem('api_server_url');
  } else {
    localStorage.setItem('api_server_url', url.trim().replace(/\/+$/, ''));
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const textResponse = await response.text();

    if (contentType.includes('text/html') || textResponse.trim().startsWith('<!') || textResponse.trim().startsWith('<html')) {
      throw new Error(
        'خطأ في الاتصال بالخادم: تعذر الوصول إلى سيرفر AI Backend (تم استلام HTML بدلاً من JSON). يرجى التأكد من ربط رابط السيرفر المباشر في الإعدادات.'
      );
    }

    let data: any;
    try {
      data = JSON.parse(textResponse);
    } catch {
      throw new Error('استجابة غير صالحة من السيرفر.');
    }

    if (!response.ok || (data && data.success === false)) {
      throw new Error((data && data.error) || 'حدث خطأ أثناء معالجة الطلب');
    }

    return data;
  } catch (err: any) {
    console.error(`[API Fetch Error] ${fullUrl}:`, err);
    throw err;
  }
}
