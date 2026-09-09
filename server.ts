import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, generateToken, verifyToken } from './server/db.ts';

const app = express();
const PORT = 3000;

// Middleware for body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to extract IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Helper to extract token from Cookie or Bearer header
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie header
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('arkan_admin_token='));
    if (sessionCookie) {
      return sessionCookie.substring('arkan_admin_token='.length);
    }
  }

  return null;
}

// Authentication middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح: يجب تسجيل الدخول كمسؤول' });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا' });
  }

  (req as any).adminUser = verified;
  next();
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Visits tracking
app.post('/api/track', (req: Request, res: Response) => {
  const pathStr = req.body?.path || '/';
  const total = db.recordVisit(pathStr);
  res.json({ success: true, count: total });
});

app.get('/api/visits', (req: Request, res: Response) => {
  res.json({
    totalVisits: db.getTotalVisits(),
  });
});

// Listings: Public list with filters
app.get('/api/listings', (req: Request, res: Response) => {
  const {
    category,
    budget,
    distance,
    gender,
    propertyType,
    neighborhood,
    includeHidden,
  } = req.query;

  // Only allow includeHidden if valid admin token is present
  let allowHidden = false;
  if (includeHidden === 'true') {
    const token = extractToken(req);
    if (token && verifyToken(token)) {
      allowHidden = true;
    }
  }

  const listings = db.getListings({
    category: category as string,
    budget: budget as string,
    distance: distance as string,
    gender: gender as string,
    propertyType: propertyType as string,
    neighborhood: neighborhood as string,
    includeHidden: allowHidden,
  });

  res.json(listings);
});

// Listings: Single detail
app.get('/api/listings/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'معرّف العقار غير صالح' });
  }

  // Check if we should increment views (query param or default true for client views)
  const shouldIncrement = req.query.skipView !== 'true';
  const listing = db.getListingById(id, shouldIncrement);

  if (!listing) {
    return res.status(404).json({ error: 'العقار غير موجود' });
  }

  // If HIDDEN, only admin can view
  if (listing.status === 'HIDDEN') {
    const token = extractToken(req);
    if (!token || !verifyToken(token)) {
      return res.status(404).json({ error: 'العقار غير متاح حاليًا' });
    }
  }

  res.json(listing);
});

// Listings: Create (Admin only)
app.post('/api/listings', requireAdmin, (req: Request, res: Response) => {
  const body = req.body;

  // Validation
  if (!body.title || !body.price || !body.category) {
    return res.status(400).json({ error: 'العنوان، السعر، والقسم حقول مطلوبة' });
  }

  const newListing = db.createListing({
    category: body.category || 'STUDENT',
    propertyType: body.propertyType || (body.category === 'STUDENT' ? 'RENT_APARTMENT' : 'RENT_APARTMENT'),
    neighborhood: body.neighborhood || '',
    title: body.title,
    price: Number(body.price),
    rooms: Number(body.rooms || 1),
    gender: body.gender || 'بنين',
    distanceMin: Number(body.distanceMin || 5),
    floor: body.floor || 'الدور الأول',
    area: body.area || '',
    address: body.address || '',
    lat: body.lat ? Number(body.lat) : null,
    lng: body.lng ? Number(body.lng) : null,
    description: body.description || '',
    images: Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
    whatsapp: body.whatsapp || '201550454849',
    status: body.status || 'AVAILABLE',
    hasAc: Boolean(body.hasAc),
    hasWifi: Boolean(body.hasWifi),
    hasFridge: Boolean(body.hasFridge),
    hasWasher: Boolean(body.hasWasher),
    hasKitchen: Boolean(body.hasKitchen),
    isFurnished: Boolean(body.isFurnished),
    hasWaterHeater: Boolean(body.hasWaterHeater),
    hasElectricity: Boolean(body.hasElectricity),
    hasWater: Boolean(body.hasWater),
    capacityStudents: body.capacityStudents ? Number(body.capacityStudents) : null,
    bedsCount: body.bedsCount ? Number(body.bedsCount) : null,
    landlordPhone: body.landlordPhone || null,
  });

  res.status(201).json(newListing);
});

// Listings: Update (Admin only)
app.put('/api/listings/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'معرّف العقار غير صالح' });

  const updated = db.updateListing(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'العقار غير موجود' });
  }

  res.json(updated);
});

// Listings: Instant status change (Admin only)
app.patch('/api/listings/:id/status', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (isNaN(id) || !['AVAILABLE', 'RESERVED', 'RENTED', 'HIDDEN'].includes(status)) {
    return res.status(400).json({ error: 'حالة العقار غير صالحة' });
  }

  const updated = db.updateListingStatus(id, status);
  if (!updated) {
    return res.status(404).json({ error: 'العقار غير موجود' });
  }

  res.json(updated);
});

// Listings: Delete (Admin only)
app.delete('/api/listings/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'معرّف العقار غير صالح' });

  const success = db.deleteListing(id);
  if (!success) {
    return res.status(404).json({ error: 'العقار غير موجود' });
  }

  res.json({ success: true, message: 'تم حذف العقار بنجاح' });
});

// Housing Requests: Public Create
app.post('/api/requests', (req: Request, res: Response) => {
  const { budget, gender, people, area, whatsapp } = req.body;

  if (!budget || !gender || !whatsapp) {
    return res.status(400).json({ error: 'الميزانية، نوع السكن، ورقم الواتساب حقول مطلوبة' });
  }

  const newRequest = db.createHousingRequest({
    budget: Number(budget),
    gender: String(gender),
    people: Number(people || 1),
    area: String(area || 'غير محدد'),
    whatsapp: String(whatsapp),
  });

  res.status(201).json(newRequest);
});

// Housing Requests: Admin List
app.get('/api/requests', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getHousingRequests());
});

// Resolve Google Maps shared URLs to coordinates
app.post('/api/resolve-maps-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'الرابط غير صالح' });
    }

    const trimmed = url.trim();

    // Direct coordinates format: "31.1325, 33.7845"
    const directCoordsMatch = trimmed.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
    if (directCoordsMatch) {
      const lat = parseFloat(directCoordsMatch[1]);
      const lng = parseFloat(directCoordsMatch[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return res.json({ success: true, lat, lng });
      }
    }

    // Direct regex match in Google Maps URLs
    const directUrlMatch =
      trimmed.match(/@([0-9.-]+),([0-9.-]+)/) ||
      trimmed.match(/[?&]q=([0-9.-]+),([0-9.-]+)/) ||
      trimmed.match(/[?&]ll=([0-9.-]+),([0-9.-]+)/) ||
      trimmed.match(/destination=([0-9.-]+),([0-9.-]+)/) ||
      trimmed.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);

    if (directUrlMatch) {
      const lat = parseFloat(directUrlMatch[1]);
      const lng = parseFloat(directUrlMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return res.json({ success: true, lat, lng, resolvedUrl: trimmed });
      }
    }

    // Short links: e.g. maps.app.goo.gl or goo.gl/maps
    if (trimmed.includes('goo.gl') || trimmed.includes('google.com/maps')) {
      const response = await fetch(trimmed, {
        method: 'GET',
        redirect: 'follow',
      });
      const finalUrl = response.url;
      const match =
        finalUrl.match(/@([0-9.-]+),([0-9.-]+)/) ||
        finalUrl.match(/[?&]q=([0-9.-]+),([0-9.-]+)/) ||
        finalUrl.match(/[?&]ll=([0-9.-]+),([0-9.-]+)/) ||
        finalUrl.match(/destination=([0-9.-]+),([0-9.-]+)/) ||
        finalUrl.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          return res.json({ success: true, lat, lng, resolvedUrl: finalUrl });
        }
      }
    }

    return res.status(404).json({ error: 'لم يتم العثور على إحداثيات صالحة في هذا الرابط' });
  } catch (err: any) {
    return res.status(500).json({ error: 'تعذر فحص الرابط: ' + err.message });
  }
});

// Housing Requests: Update Status (Admin only)
app.patch('/api/requests/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  // Map Arabic status labels if passed
  let mappedStatus: 'NEW' | 'CONTACTED' | 'CLOSED' = 'NEW';
  if (status === 'جديد' || status === 'NEW') mappedStatus = 'NEW';
  else if (status === 'تم التواصل' || status === 'CONTACTED') mappedStatus = 'CONTACTED';
  else if (status === 'مقفول' || status === 'CLOSED') mappedStatus = 'CLOSED';
  else {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
  }

  const updated = db.updateHousingRequestStatus(id, mappedStatus);
  if (!updated) {
    return res.status(404).json({ error: 'طلب السكن غير موجود' });
  }

  res.json(updated);
});

// Housing Requests: Delete (Admin only)
app.delete('/api/requests/:id', requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'معرّف الطلب غير صالح' });

  const success = db.deleteHousingRequest(id);
  if (!success) {
    return res.status(404).json({ error: 'طلب السكن غير موجود' });
  }

  res.json({ success: true, message: 'تم حذف طلب السكن بنجاح' });
});

// Listings: Record View
app.post('/api/listings/:id/view', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'معرّف غير صالح' });

  const listing = db.getListingById(id, true);
  if (!listing) return res.status(404).json({ error: 'العقار غير موجود' });

  res.json({ success: true, views: listing.views });
});

// Admin Authentication: Login with Rate Limiting (5 failed / 10 min)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);

  // Check Rate Limit
  if (db.isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'تم حظر محاولات الدخول مؤقتًا لكثرة المحاولات الخاطئة (أكثر من 5 محاولات). يرجى المحاولة بعد 10 دقائق.',
    });
  }

  const { username, password } = req.body;
  const currentCreds = db.getAdminCredentials();

  const userMatches = Boolean(
    username &&
    username.trim().toLowerCase() === currentCreds.username.trim().toLowerCase()
  );
  const passMatches = Boolean(
    password &&
    password === currentCreds.password
  );

  if (userMatches && passMatches) {
    db.recordLoginAttempt(clientIp, true);
    const token = generateToken(currentCreds.username);

    // Set HTTPOnly cookie (7 days)
    res.setHeader(
      'Set-Cookie',
      `arkan_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.json({
      success: true,
      token,
      user: { username: currentCreds.username, role: 'ADMIN' },
    });
  } else {
    db.recordLoginAttempt(clientIp, false);
    return res.status(401).json({
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    });
  }
});

// Update Admin Credentials
app.post('/api/admin/credentials', requireAdmin, (req: Request, res: Response) => {
  const { newUsername, newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'كلمة المرور يجب ألا تقل عن 4 خانات' });
  }

  const currentCreds = db.getAdminCredentials();
  const targetUser = (newUsername && newUsername.trim()) ? newUsername.trim() : currentCreds.username;
  db.setAdminCredentials(targetUser, newPassword.trim());

  return res.json({
    success: true,
    message: 'تم تحديث بيانات الدخول بنجاح',
    username: targetUser,
  });
});

// Admin Current User
app.get('/api/admin/me', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ authenticated: false });

  const verified = verifyToken(token);
  if (!verified) return res.status(401).json({ authenticated: false });

  res.json({
    authenticated: true,
    user: { username: verified.sub, role: verified.role },
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.setHeader(
    'Set-Cookie',
    `arkan_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  res.json({ success: true });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getStats());
});

// Site Settings: Public GET
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSiteSettings());
});

// Site Settings: Admin Update
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSiteSettings(req.body);
    res.json({ success: true, settings: updated, message: 'تم حفظ إعدادات وتفاصيل الموقع بنجاح' });
  } catch (e: any) {
    res.status(500).json({ error: 'فشل حفظ الإعدادات: ' + (e?.message || 'خطأ غير متوقع') });
  }
});

// Site Settings: Admin Reset to defaults
app.post('/api/admin/settings/reset', requireAdmin, (req: Request, res: Response) => {
  try {
    const reset = db.resetSiteSettings();
    res.json({ success: true, settings: reset, message: 'تمت استعادة إعدادات ونصوص الموقع الافتراضية بنجاح' });
  } catch (e: any) {
    res.status(500).json({ error: 'فشل استعادة الإعدادات: ' + (e?.message || 'خطأ غير متوقع') });
  }
});

// Image Upload Endpoint with validation: Max 10MB, JPG/PNG/WEBP, Max 15 images
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  const { data, filename, mimeType } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'لم يتم إرسال أي صورة' });
  }

  // Allowed mime types
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const mime = mimeType || 'image/jpeg';
  if (!allowedMimes.includes(mime.toLowerCase())) {
    return res.status(400).json({
      error: 'امتداد الصورة غير مدعوم. الصيغ المسموحة هي JPG و PNG و WEBP فقط.',
    });
  }

  // Validate size (max 10MB approx 13.5MB base64)
  const approxBytes = (data.length * 3) / 4;
  if (approxBytes > 10 * 1024 * 1024) {
    return res.status(400).json({
      error: 'حجم الصورة يتجاوز الحد الأقصى المسموح به (10 ميجابايت)',
    });
  }

  // If data is already a full data URI or URL, return it
  const finalUrl = data.startsWith('data:') ? data : `data:${mime};base64,${data}`;
  res.json({ url: finalUrl, success: true });
});

// ---------------- VITE / STATIC SERVING ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arkan Real Estate server running on http://localhost:${PORT}`);
  });
}

startServer();
