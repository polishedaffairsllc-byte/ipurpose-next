# Production Domain Issue - Root Cause Analysis & Fix

**Issue:** `ipurposesoul.com` returning `ERR_CONNECTION_TIMED_OUT` 
**Investigation Date:** January 19, 2026
**Status:** ✅ Root cause identified, fix instructions provided

---

## Root Cause Analysis

### What's Working ✅
- **DNS Resolution:** `ipurposesoul.com` correctly resolves to `76.76.21.21` (Vercel's IP)
- **Nameservers:** Correctly configured to `ns1.bluehost.com` and `ns2.bluehost.com` (Bluehost)
- **Vercel Server:** Responding to requests on the IP
- **Network Routing:** Traffic correctly reaching Vercel infrastructure

### What's Broken ❌
- **Domain Registration in Vercel:** `ipurposesoul.com` is **NOT** added to the Vercel project's domain list
- **Current Behavior:** When Vercel receives a request for `ipurposesoul.com`, it doesn't recognize it as belonging to the `ipurpose-next` project, so it returns a 308 redirect to `https://vercel.com/`

### Evidence
```bash
$ curl -I http://76.76.21.21 -H "Host: ipurposesoul.com"
HTTP/1.1 308 Permanent Redirect
Location: https://vercel.com/
Server: Vercel
X-Vercel-Id: iad1::htjbz-1768792875836-6cb41b645cba
```

The Vercel server IS responding, but it's telling clients "I don't know this domain."

---

## Vercel Project Details

- **Project ID:** `prj_dZRAfBhuw8HbTm4PiC5xnPHojz9M`
- **Project Name:** `ipurpose-next`
- **Org ID:** `team_DxF0PzBzqRY4ya3khEQIC91h`
- **Current Vercel.app URL:** `ipurpose-next-*.vercel.app` (auto-generated)

---

## The Fix

### Method 1: Via Vercel Dashboard (Recommended - 2 minutes)

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard

2. **Select the `ipurpose-next` Project**
   - Click on "ipurpose-next" in your projects list

3. **Navigate to Settings**
   - Click "Settings" tab at the top

4. **Go to Domains**
   - In the left sidebar, click "Domains"

5. **Add Domain**
   - Click "Add Domain" button
   - Enter: `ipurposesoul.com`
   - Click "Add"

6. **Verify Nameservers** (if prompted)
   - Vercel will show the required nameservers
   - Your domain already uses Bluehost's nameservers
   - If required, update DNS records as shown (usually just CNAME or A record pointing to Vercel)

7. **Wait for SSL Certificate**
   - Vercel will automatically provision an SSL certificate
   - This typically takes 5-15 minutes
   - You'll see the domain status change from "Pending" to "Valid" once complete

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Navigate to project
cd /Users/renita.hamilton/Desktop/ipurpose-next

# Login (if not already)
vercel login

# Add domain
vercel domains add ipurposesoul.com

# Verify it worked
vercel domains ls
```

### Method 3: Update DNS Records in Bluehost (Alternative)

If Vercel shows a specific CNAME or A record to add:

1. **Log into Bluehost cPanel**
   - Go to your Bluehost account
   - Open cPanel

2. **Navigate to Zone Editor or DNS Settings**
   - Find "Zone Editor" or "DNS" section

3. **Update/Add the required record**
   - If Vercel asks for CNAME: Add/update `ipurposesoul.com` CNAME to Vercel's edge network
   - If Vercel asks for A record: Update to point to Vercel's IP

4. **Wait for propagation**
   - Usually 1-5 minutes
   - Can check with: `dig ipurposesoul.com +short`

---

## Verification Steps

### After Adding Domain to Vercel (Wait 5-15 minutes for SSL)

1. **Check Domain Status in Vercel**
   ```
   Dashboard → Settings → Domains
   Status should show: "Valid" ✅
   ```

2. **Test HTTP/HTTPS**
   ```bash
   # Should return your site content, not a redirect
   curl -I https://ipurposesoul.com
   
   # Expected response:
   # HTTP/2 200
   # (Your site content)
   ```

3. **Test in Browser**
   - Go to: https://ipurposesoul.com
   - Should load the iPurpose homepage
   - Check browser console for any errors

4. **Verify Certificate**
   - Click the lock icon in browser address bar
   - Should show valid SSL certificate for `ipurposesoul.com`

5. **Check Redirects Work**
   - Navigate to: https://ipurposesoul.com/clarity-check
   - Should load the clarity check form
   - All internal pages should work

---

## Expected Behavior After Fix

| Request | Current (Broken) | After Fix (Expected) |
|---------|------------------|----------------------|
| `https://ipurposesoul.com/` | 308 redirect to vercel.com | ✅ Loads homepage |
| `https://ipurposesoul.com/clarity-check` | 308 redirect to vercel.com | ✅ Loads form |
| `https://ipurposesoul.com/api/health` | 308 redirect to vercel.com | ✅ Returns health check JSON |
| `http://ipurposesoul.com/` | Same as above | ✅ Redirects to HTTPS + loads |

---

## Timeline

- **Add domain to Vercel:** < 1 minute
- **SSL certificate provisioning:** 5-15 minutes
- **DNS propagation (if changed):** 1-5 minutes
- **Total time to full uptime:** ~15 minutes maximum

---

## Why This Happened

1. DNS was configured to point to Vercel (correct)
2. But the domain was never registered/added to the Vercel project
3. Vercel received traffic but had no project mapped to that domain
4. Result: 308 redirect to Vercel homepage

This is a common issue when:
- Domains are added/changed
- Projects are transferred between teams
- DNS is updated but Vercel project settings aren't synced

---

## After Uptime is Restored

Once the site is loading:

1. ✅ Monitor error logs in Vercel dashboard
2. ✅ Verify all pages load correctly
3. ✅ Check Firebase auth is working (users can log in)
4. ✅ Check API endpoints respond correctly
5. ✅ Test the Clarity Check form end-to-end
6. ⏳ Then resume feature work (fonts, email, etc.)

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs/projects/domains
- **DNS Verification:** https://mxtoolbox.com/domain/ipurposesoul.com
- **SSL Status:** https://www.sslshopper.com/ssl-checker.html#hostname=ipurposesoul.com

---

**Next Step:** Add `ipurposesoul.com` to Vercel project domains, wait 15 minutes for SSL, then verify site loads.
